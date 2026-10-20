# Visit counter

`GET /api/visits` returns `{ "total": 0 }` without incrementing the count.
`POST /api/visits` accepts `{ "eventId": "<UUID v4>" }`, records one page
visit, and returns `{ "total": 1 }`. A repeated event ID is counted once for
24 hours. The client should keep its event ID for retries of the same page
visit and generate a new ID for a new page visit. This is a page-view count,
not a unique-person count. The total starts at zero; no sample traffic is added.

The route uses the Node.js runtime and built-in `node:sqlite`. Run with
Node.js 22.18 or later (development verification uses Node.js 25). Responses
are `no-store`. Invalid requests return 400, a mismatched Origin returns 403,
and a storage failure returns 503 with a generic message. Missing Origin is
accepted for normal command-line checks. A preserved reverse-proxy Host can
match the public Origin even when the upstream URL uses an internal address.

The default database is `.data/visits.sqlite` beneath the process working
directory. Set `VISIT_COUNTER_DB` to an absolute path to store it elsewhere.
The parent directory is created automatically. Keep this directory persistent
across deployments; for Docker, mount it as a persistent volume or bind mount.
Use a persistent Node server process; a static-only or edge deployment does not
run this SQLite endpoint.
Multiple Node processes on one host may share the same SQLite file. The store
uses WAL, a 10-second busy timeout, and a single write transaction for event
deduplication, expired-event cleanup, and incrementing the total. Old event IDs
are removed during subsequent writes, while the accumulated total is retained.

Only the total, random event IDs and their expiration timestamps are stored.
The counter does not store IP addresses, user agents, contact data, or visitor
profiles. Deployments must preserve the existing database; do not reset or
replace it when updating the application.

Run isolated verification with:

```sh
node --disable-warning=ExperimentalWarning scripts/check-visit-counter.mjs
```

The script creates temporary databases, verifies retries and persistence, runs
12 concurrent processes against one database, checks request validation, and
closes all connections before removing the temporary files. It never opens the
application's default database.
