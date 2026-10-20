import snapshot from "../data/github-contributions.snapshot.json";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionCalendar = {
  username: string;
  days: ContributionDay[];
  total: number;
  from: string;
  to: string;
  fetchedAt: string;
};

export const GITHUB_USERNAME = "RoseKhlifa";
export const GITHUB_CONTRIBUTIONS_URL = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

const DAY_MS = 86_400_000;

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,
    (_, entity: string) => {
      if (!entity.startsWith("#")) return named[entity.toLowerCase()];
      const hexadecimal = entity[1].toLowerCase() === "x";
      const point = Number.parseInt(
        entity.slice(hexadecimal ? 2 : 1),
        hexadecimal ? 16 : 10
      );
      if (point < 0 || point > 0x10ffff) {
        throw new Error("Invalid HTML entity in contribution data");
      }
      return String.fromCodePoint(point);
    }
  );
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(
    /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  )) {
    const name = match[1].toLowerCase();
    if (Object.hasOwn(result, name)) {
      throw new Error(`Duplicate contribution attribute: ${name}`);
    }
    result[name] = decodeEntities(match[2] ?? match[3]);
  }
  return result;
}

function textContent(html: string): string {
  return decodeEntities(
    html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]*>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function dateTimestamp(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid contribution date: ${value}`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid contribution date: ${value}`);
  }
  return timestamp;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Reject incomplete HTML, broken mappings, or a damaged local snapshot. */
export function validateContributionCalendar(
  value: unknown,
  username = GITHUB_USERNAME
): ContributionCalendar {
  if (!isRecord(value) || value.username !== username) {
    throw new Error("Contribution username does not match");
  }
  if (
    !Array.isArray(value.days) ||
    value.days.length < 350 ||
    value.days.length > 378
  ) {
    throw new Error("Contribution calendar is not a complete year");
  }
  if (
    typeof value.fetchedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.fetchedAt) ||
    !Number.isFinite(Date.parse(value.fetchedAt))
  ) {
    throw new Error("Contribution fetch timestamp is invalid");
  }
  let previous: number | undefined;
  let total = 0;
  for (const day of value.days) {
    if (
      !isRecord(day) ||
      typeof day.date !== "string" ||
      typeof day.count !== "number" ||
      !Number.isSafeInteger(day.count) ||
      day.count < 0 ||
      typeof day.level !== "number" ||
      !Number.isInteger(day.level) ||
      day.level < 0 ||
      day.level > 4
    ) {
      throw new Error("Contribution day has invalid fields");
    }
    if ((day.count === 0) !== (day.level === 0)) {
      throw new Error("Contribution count and level disagree");
    }
    const timestamp = dateTimestamp(day.date);
    if (previous !== undefined && timestamp - previous !== DAY_MS) {
      throw new Error("Contribution dates are not unique and continuous");
    }
    previous = timestamp;
    total += day.count;
  }
  if (
    value.from !== value.days[0].date ||
    value.to !== value.days[value.days.length - 1].date
  ) {
    throw new Error("Contribution range does not match its days");
  }
  if (!Number.isSafeInteger(value.total) || value.total !== total) {
    throw new Error("Contribution total does not match its daily counts");
  }
  return value as ContributionCalendar;
}

/** Parse GitHub's public calendar; tooltip.for joins a day's cell.id. */
export function parseGitHubContributions(
  html: string,
  username = GITHUB_USERNAME,
  fetchedAt = new Date().toISOString()
): ContributionCalendar {
  const tooltips = new Map<string, string>();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip\s*>/gi
  )) {
    const target = attributes(match[1]).for;
    if (!target) continue;
    if (tooltips.has(target)) {
      throw new Error(`Duplicate contribution tooltip: ${target}`);
    }
    tooltips.set(target, textContent(match[2]));
  }

  const days: ContributionDay[] = [];
  const ids = new Set<string>();
  for (const match of html.matchAll(/<td\b([^>]*)>/gi)) {
    const cell = attributes(match[1]);
    if (!Object.hasOwn(cell, "data-date")) continue;
    if (!cell.id || ids.has(cell.id)) {
      throw new Error("Contribution cell ID is missing or duplicated");
    }
    ids.add(cell.id);
    if (!/^[0-4]$/.test(cell["data-level"] ?? "")) {
      throw new Error(`Invalid contribution level for ${cell["data-date"]}`);
    }
    const tooltip = tooltips.get(cell.id);
    const countMatch = tooltip?.match(
      /^(\d+|\d{1,3}(?:,\d{3})+)\s+contributions?\s+on\b/i
    );
    const count = /^No contributions on\b/i.test(tooltip ?? "")
      ? 0
      : countMatch
        ? Number(countMatch[1].replaceAll(",", ""))
        : undefined;
    if (count === undefined) {
      throw new Error(`Missing contribution count for ${cell["data-date"]}`);
    }
    days.push({
      date: cell["data-date"],
      count,
      level: Number(cell["data-level"]) as ContributionDay["level"],
    });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));

  let headingTotal: number | undefined;
  for (const match of html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2\s*>/gi)) {
    if (attributes(match[1]).id !== "js-contribution-activity-description") {
      continue;
    }
    if (headingTotal !== undefined) {
      throw new Error("Contribution total heading is duplicated");
    }
    const heading = textContent(match[2]).match(
      /^(\d+|\d{1,3}(?:,\d{3})+)\s+contributions?\s+in\s+(?:the last year|\d{4})\b/i
    );
    if (!heading) throw new Error("Contribution total heading is invalid");
    headingTotal = Number(heading[1].replaceAll(",", ""));
  }
  if (headingTotal === undefined) {
    throw new Error("Contribution total heading is missing");
  }

  return validateContributionCalendar(
    {
      username,
      days,
      total: headingTotal,
      from: days[0]?.date,
      to: days[days.length - 1]?.date,
      fetchedAt,
    },
    username
  );
}

export async function getGitHubContributions(): Promise<{
  calendar: ContributionCalendar;
  source: "live" | "snapshot";
}> {
  try {
    const response = await fetch(GITHUB_CONTRIBUTIONS_URL, {
      headers: {
        Accept: "text/html",
        "Accept-Language": "en-US",
        "User-Agent": "RoseKhlifa-Homepage",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(
        `GitHub contribution request returned ${response.status}`
      );
    }
    return {
      calendar: parseGitHubContributions(await response.text()),
      source: "live",
    };
  } catch {
    return {
      calendar: validateContributionCalendar(snapshot),
      source: "snapshot",
    };
  }
}
