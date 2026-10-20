import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const moduleUrl = new URL("../src/lib/visit-counter.ts", import.meta.url);
const source = stripTypeScriptTypes(readFileSync(moduleUrl, "utf8"));
const importUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { createVisitCounter, getVisitCounter, isVisitEventId } = await import(
  importUrl
);

if (process.argv[2] === "--worker") {
  const counter = createVisitCounter(process.argv[3]);
  process.once("message", () => {
    try {
      for (let index = 0; index < 10; index++) {
        counter.recordVisit(process.argv[4]);
        counter.recordVisit(randomUUID());
      }
      counter.close();
      process.disconnect();
    } catch (error) {
      counter.close();
      console.error(error);
      process.exitCode = 1;
      process.disconnect();
    }
  });
  process.send({ ready: true });
} else {
  const root = mkdtempSync(join(tmpdir(), "rk-visit-counter-"));
  const dbPath = join(root, "nested", "visits.sqlite");
  const children = [];
  const opened = [];
  let apiCounter;
  const previousPath = process.env.VISIT_COUNTER_DB;
  try {
    let counter = createVisitCounter(dbPath);
    opened.push(counter);
    assert.equal(counter.getTotal(), 0);
    const first = randomUUID();
    assert.equal(counter.recordVisit(first), 1);
    assert.equal(counter.recordVisit(first), 1);
    assert.equal(counter.recordVisit(first.toUpperCase()), 1);
    assert.equal(counter.recordVisit(randomUUID()), 2);
    assert.throws(() => counter.recordVisit("invalid"));
    assert.equal(counter.getTotal(), 2);
    counter.close();
    counter = createVisitCounter(dbPath);
    opened.push(counter);
    assert.equal(counter.getTotal(), 2);
    console.log(
      "ok real zero start, UUID retry deduplication, independent events and reopen persistence"
    );

    let now = Date.now();
    const expiryPath = join(root, "expiry.sqlite");
    const expiring = createVisitCounter(expiryPath, () => now);
    opened.push(expiring);
    const expiredId = randomUUID();
    assert.equal(expiring.recordVisit(expiredId), 1);
    now += 24 * 60 * 60 * 1000;
    assert.equal(expiring.recordVisit(randomUUID()), 2);
    const inspect = new DatabaseSync(expiryPath);
    assert.equal(
      inspect.prepare("SELECT count(*) AS count FROM visit_events").get().count,
      1
    );
    assert.equal(
      inspect.prepare("PRAGMA journal_mode").get().journal_mode,
      "wal"
    );
    assert.equal(expiring.recordVisit(expiredId), 3);
    inspect.close();
    expiring.close();
    console.log(
      "ok WAL storage and 24-hour event cleanup preserve the accumulated total"
    );

    const sharedId = randomUUID();
    const ready = [];
    const finished = [];
    for (let index = 0; index < 12; index++) {
      const child = fork(
        fileURLToPath(import.meta.url),
        ["--worker", dbPath, sharedId],
        {
          stdio: ["ignore", "pipe", "pipe", "ipc"],
        }
      );
      children.push(child);
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      ready.push(
        new Promise((resolve, reject) => {
          child.once("message", resolve);
          child.once("error", reject);
          child.once("exit", (code) => {
            if (code !== 0) reject(new Error(stderr));
          });
        })
      );
      finished.push(
        new Promise((resolve, reject) => {
          child.once("error", reject);
          child.once("exit", (code) =>
            code === 0 ? resolve() : reject(new Error(stderr))
          );
        })
      );
    }
    await Promise.all(ready);
    for (const child of children) child.send("start");
    await Promise.all(finished);
    assert.equal(counter.getTotal(), 123);
    console.log(
      "ok 12 concurrent processes: 120 unique events plus one shared UUID counted exactly once (total 123)"
    );

    process.env.VISIT_COUNTER_DB = join(root, "api.sqlite");
    const routeSource = stripTypeScriptTypes(
      readFileSync(
        new URL("../src/app/api/visits/route.ts", import.meta.url),
        "utf8"
      )
    ).replace(
      'from "@/lib/visit-counter"',
      `from ${JSON.stringify(importUrl)}`
    );
    const route = await import(
      `data:text/javascript;base64,${Buffer.from(routeSource).toString("base64")}`
    );
    const request = (body, headers = {}) =>
      new Request("http://127.0.0.1:4324/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
    const initial = await route.GET(
      new Request("http://127.0.0.1:4324/api/visits")
    );
    apiCounter = getVisitCounter();
    assert.deepEqual(await initial.json(), { total: 0 });
    assert.equal(initial.headers.get("Cache-Control"), "no-store");
    const id = randomUUID();
    assert.deepEqual(
      await (await route.POST(request(JSON.stringify({ eventId: id })))).json(),
      { total: 1 }
    );
    assert.deepEqual(
      await (await route.POST(request(JSON.stringify({ eventId: id })))).json(),
      { total: 1 }
    );
    for (const invalid of [
      "invalid JSON",
      "{}",
      '{"eventId":"not-a-uuid"}',
      " ".repeat(257),
    ]) {
      assert.equal((await route.POST(request(invalid))).status, 400);
    }
    assert.equal(
      (
        await route.POST(
          request(JSON.stringify({ eventId: randomUUID() }), {
            Origin: "https://other.example",
          })
        )
      ).status,
      403
    );
    const proxied = await route.POST(
      request(JSON.stringify({ eventId: randomUUID() }), {
        Origin: "https://rosekhlifa.com",
        Host: "rosekhlifa.com",
      })
    );
    assert.equal(proxied.status, 200);
    assert.deepEqual(await proxied.json(), { total: 2 });
    getVisitCounter().close();
    process.env.VISIT_COUNTER_DB = "invalid-relative-path";
    const unavailable = await route.GET(
      new Request("http://127.0.0.1:4324/api/visits")
    );
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
      error: "Visit counter unavailable",
    });
    assert.equal(isVisitEventId(id), true);
    console.log(
      "ok API GET/POST, no-store, duplicate retries, invalid input, origin checks, proxy host and private 503 errors"
    );
  } finally {
    for (const child of children) {
      if (child.exitCode === null) child.kill();
    }
    for (const counter of opened) counter.close();
    apiCounter?.close();
    if (previousPath === undefined) delete process.env.VISIT_COUNTER_DB;
    else process.env.VISIT_COUNTER_DB = previousPath;
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert(basename(root).startsWith("rk-visit-counter-"));
    rmSync(root, { recursive: true, force: true });
  }
  console.log("PASS persistent visit counter; temporary databases removed");
}
