import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const EVENT_LIFETIME_MS = 24 * 60 * 60 * 1000;
const UUID_V4 =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export type VisitCounter = {
  getTotal: () => number;
  recordVisit: (eventId: string) => number;
  close: () => void;
};

export function isVisitEventId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}

export function createVisitCounter(
  dbPath: string,
  now: () => number = Date.now
): VisitCounter {
  if (!isAbsolute(dbPath)) {
    throw new Error("Visit counter database path must be absolute");
  }
  mkdirSync(dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);
  let open = true;
  try {
    database.exec(`
      PRAGMA busy_timeout = 10000;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS visit_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value INTEGER NOT NULL CHECK (value >= 0)
      );
      INSERT OR IGNORE INTO visit_metadata (key, value) VALUES ('total', 0);
      CREATE TABLE IF NOT EXISTS visit_events (
        event_id TEXT PRIMARY KEY NOT NULL,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS visit_events_expiry ON visit_events(expires_at);
    `);

    const readTotal = database.prepare(
      "SELECT value AS total FROM visit_metadata WHERE key = 'total'"
    );
    const removeExpired = database.prepare(
      "DELETE FROM visit_events WHERE expires_at <= ?"
    );
    const addEvent = database.prepare(
      "INSERT OR IGNORE INTO visit_events (event_id, expires_at) VALUES (?, ?)"
    );
    const increment = database.prepare(
      "UPDATE visit_metadata SET value = value + 1 WHERE key = 'total' AND value < 9007199254740991"
    );

    const getTotal = () => {
      const total = readTotal.get()?.total;
      if (
        typeof total !== "number" ||
        !Number.isSafeInteger(total) ||
        total < 0
      ) {
        throw new Error("Visit counter total is invalid");
      }
      return total;
    };

    return {
      getTotal,
      recordVisit(eventId) {
        if (!isVisitEventId(eventId)) {
          throw new Error("Visit event ID must be a UUID v4");
        }
        const timestamp = Math.floor(now());
        if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
          throw new Error("Visit event time is invalid");
        }
        database.exec("BEGIN IMMEDIATE");
        try {
          removeExpired.run(timestamp);
          const inserted = addEvent.run(
            eventId.toLowerCase(),
            timestamp + EVENT_LIFETIME_MS
          );
          if (inserted.changes !== 0 && increment.run().changes !== 1) {
            throw new Error("Visit counter limit reached");
          }
          const total = getTotal();
          database.exec("COMMIT");
          return total;
        } catch (error) {
          database.exec("ROLLBACK");
          throw error;
        }
      },
      close() {
        if (open) {
          database.close();
          open = false;
        }
      },
    };
  } catch (error) {
    database.close();
    throw error;
  }
}

let cached: { path: string; counter: VisitCounter } | undefined;

/** Lazily opened; importing this module never creates a database. */
export function getVisitCounter(): VisitCounter {
  const path =
    process.env.VISIT_COUNTER_DB ||
    join(process.cwd(), ".data", "visits.sqlite");
  if (!cached || cached.path !== path) {
    const counter = createVisitCounter(path);
    cached?.counter.close();
    cached = { path, counter };
  }
  return cached.counter;
}
