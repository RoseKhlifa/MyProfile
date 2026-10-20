import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const sourceUrl = new URL(
  "../src/lib/github-contributions.ts",
  import.meta.url
);
const snapshotUrl = new URL(
  "../src/data/github-contributions.snapshot.json",
  import.meta.url
);
const options = new Set(process.argv.slice(2));
const allowed = new Set(["--fixture-only", "--refresh-snapshot"]);
for (const option of options) {
  if (!allowed.has(option)) throw new Error(`Unknown argument: ${option}`);
}
if (options.has("--fixture-only") && options.has("--refresh-snapshot")) {
  throw new Error("--refresh-snapshot requires an online request");
}

const stored = existsSync(snapshotUrl)
  ? JSON.parse(readFileSync(snapshotUrl, "utf8"))
  : null;
const typescript = readFileSync(sourceUrl, "utf8").replace(
  /^import snapshot from "\.\.\/data\/github-contributions\.snapshot\.json";\r?\n/m,
  `const snapshot = ${JSON.stringify(stored)};\n`
);
assert(
  !typescript.includes("import snapshot from"),
  "JSON import was isolated"
);
const javascript = stripTypeScriptTypes(typescript, { mode: "strip" });
const {
  GITHUB_CONTRIBUTIONS_URL,
  GITHUB_USERNAME,
  getGitHubContributions,
  parseGitHubContributions,
  validateContributionCalendar,
} = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
);

if (options.has("--refresh-snapshot")) {
  const response = await fetch(GITHUB_CONTRIBUTIONS_URL, {
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "text/html",
      "Accept-Language": "en-US",
      "User-Agent": "RoseKhlifa-Homepage",
    },
  });
  assert.equal(response.status, 200, "official snapshot request returned 200");
  const calendar = parseGitHubContributions(await response.text());
  writeFileSync(snapshotUrl, `${JSON.stringify(calendar, null, 2)}\n`, "utf8");
  console.log(
    `ok refreshed official snapshot: ${calendar.days.length} days, ${calendar.total} contributions, ${calendar.from}..${calendar.to}`
  );
}

const calendar = validateContributionCalendar(
  JSON.parse(readFileSync(snapshotUrl, "utf8"))
);
assert.equal(calendar.username, GITHUB_USERNAME);
assert.equal(
  calendar.total,
  calendar.days.reduce((sum, day) => sum + day.count, 0)
);
console.log(
  `ok real snapshot: ${calendar.days.length} days, ${calendar.total} contributions, ${calendar.from}..${calendar.to}, fetched ${calendar.fetchedAt}`
);

function htmlFixture(days = calendar.days, headingTotal = calendar.total) {
  const reverseDays = [...days].reverse();
  const cells = reverseDays.map(
    (day, index) =>
      `<td data-level='${day.level}' id='day-${index}' data-date='${day.date}'></td>`
  );
  const tips = reverseDays.map((day, index) => {
    const count = day.count.toLocaleString("en-US");
    const text =
      day.count === 0
        ? "No contributions on fixture date."
        : `${count} ${day.count === 1 ? "contribution" : "contributions"} on fixture date.`;
    return `<tool-tip id='unrelated-${index}' for='day-${index}'><span>${text.replaceAll(" ", "&#32;")}</span></tool-tip>`;
  });
  return `<h2 class='x' id='js-contribution-activity-description'>${headingTotal.toLocaleString("en-US")} contributions in the last year</h2>${tips.reverse().join("")}${cells.join("")}`;
}

const fixture = htmlFixture();
const parsed = parseGitHubContributions(
  fixture,
  calendar.username,
  calendar.fetchedAt
);
assert.deepEqual(parsed, calendar);
console.log(
  "ok shuffled attributes, reversed dates, ID-mapped tooltips, nested text and numeric entities"
);

const commaDays = calendar.days.map((day, index) =>
  index === 0 ? { ...day, count: 1234, level: 4 } : day
);
const commaTotal = commaDays.reduce((sum, day) => sum + day.count, 0);
const commaParsed = parseGitHubContributions(
  htmlFixture(commaDays, commaTotal)
);
assert.equal(commaParsed.days[0].count, 1234);
assert.equal(commaParsed.total, commaTotal);
console.log("ok zero, singular, plural and comma-separated counts");

const invalidCases = [
  [
    "missing tooltip",
    fixture.replace(/<tool-tip\b[^>]*>[\s\S]*?<\/tool-tip>/, ""),
  ],
  ["invalid level", fixture.replace(/data-level='[0-4]'/, "data-level='5'")],
  [
    "missing date",
    fixture.replace(
      new RegExp(
        `<td\\b[^>]*data-date='${calendar.days[100].date}'[^>]*><\\/td>`
      ),
      ""
    ),
  ],
  [
    "duplicate date",
    `${fixture}<td id='duplicate' data-date='${calendar.from}' data-level='0'></td><tool-tip for='duplicate'>No contributions on fixture.</tool-tip>`,
  ],
  ["incorrect total", htmlFixture(calendar.days, calendar.total + 1)],
  ["missing heading", fixture.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, "")],
  [
    "invalid date",
    fixture.replace(/data-date='\d{4}-\d{2}-\d{2}'/, "data-date='2026-02-30'"),
  ],
  [
    "duplicate tooltip",
    `${fixture}<tool-tip for='day-0'>No contributions on fixture.</tool-tip>`,
  ],
  [
    "zero count with positive level",
    htmlFixture(
      calendar.days.map((day, index) =>
        index === 0 ? { ...day, count: 0, level: 2 } : day
      )
    ),
  ],
  ["empty document", "<html>rate limited</html>"],
];
for (const [label, invalid] of invalidCases) {
  assert.throws(() => parseGitHubContributions(invalid), label);
}
assert.throws(() =>
  validateContributionCalendar({ ...calendar, username: "other" })
);
assert.throws(() => validateContributionCalendar({ ...calendar, total: -1 }));
assert.throws(() =>
  validateContributionCalendar({ ...calendar, from: "2000-01-01" })
);
assert.throws(() =>
  validateContributionCalendar({ ...calendar, fetchedAt: "invalid" })
);
console.log(
  `ok malformed, incomplete, duplicate, mismatched and wrong-account data rejected (${invalidCases.length + 4} cases)`
);

const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => {
    throw new Error("fixture: network unavailable");
  };
  if (stored) {
    const fallback = await getGitHubContributions();
    assert.equal(fallback.source, "snapshot");
    assert.deepEqual(fallback.calendar, validateContributionCalendar(stored));
    console.log(
      "ok offline request returns the real snapshot with source=snapshot"
    );
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    assert.equal((await getGitHubContributions()).source, "snapshot");
    globalThis.fetch = async () => new Response("<html>changed page</html>");
    assert.equal((await getGitHubContributions()).source, "snapshot");
    console.log("ok HTTP failure and changed HTML return source=snapshot");
  }
  globalThis.fetch = async (url, request) => {
    assert.equal(url, GITHUB_CONTRIBUTIONS_URL);
    assert.equal(request.next.revalidate, 3600);
    assert(request.signal instanceof AbortSignal);
    assert.equal(request.headers["Accept-Language"], "en-US");
    return new Response(fixture, { status: 200 });
  };
  const successful = await getGitHubContributions();
  assert.equal(successful.source, "live");
  assert.deepEqual(successful.calendar.days, calendar.days);
  console.log(
    "ok successful fetch uses hourly revalidation, abort signal and source=live"
  );
} finally {
  globalThis.fetch = originalFetch;
}

if (!options.has("--fixture-only")) {
  const live = await getGitHubContributions();
  assert.equal(
    live.source,
    "live",
    "online verification must reach official GitHub"
  );
  console.log(
    `ok live official calendar: ${live.calendar.days.length} days, ${live.calendar.total} contributions, ${live.calendar.from}..${live.calendar.to}, source=${live.source}`
  );
}
console.log("PASS contribution data checks");
