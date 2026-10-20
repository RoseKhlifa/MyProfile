"use client";

import { useEffect, useState } from "react";
import type { ContributionCalendar } from "@/lib/github-contributions";

type ContributionResult = {
  calendar: ContributionCalendar;
  source: "live" | "snapshot";
};

const REFRESH_MS = 3_600_000;
const DAY_MS = 86_400_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function validResult(
  value: unknown,
  username: string
): value is ContributionResult {
  if (
    !isRecord(value) ||
    (value.source !== "live" && value.source !== "snapshot") ||
    !isRecord(value.calendar)
  ) {
    return false;
  }
  const calendar = value.calendar;
  if (
    calendar.username !== username ||
    !Array.isArray(calendar.days) ||
    calendar.days.length < 350 ||
    calendar.days.length > 378 ||
    typeof calendar.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(calendar.fetchedAt))
  ) {
    return false;
  }
  let total = 0;
  let previous: number | undefined;
  for (const day of calendar.days) {
    if (
      !isRecord(day) ||
      typeof day.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
      typeof day.count !== "number" ||
      !Number.isSafeInteger(day.count) ||
      day.count < 0 ||
      typeof day.level !== "number" ||
      !Number.isInteger(day.level) ||
      day.level < 0 ||
      day.level > 4 ||
      (day.count === 0) !== (day.level === 0)
    ) {
      return false;
    }
    const timestamp = Date.parse(`${day.date}T00:00:00.000Z`);
    if (
      !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 10) !== day.date ||
      (previous !== undefined && timestamp - previous !== DAY_MS)
    ) {
      return false;
    }
    previous = timestamp;
    total += day.count;
  }
  return (
    Number.isSafeInteger(calendar.total) &&
    calendar.total === total &&
    calendar.from === calendar.days[0].date &&
    calendar.to === calendar.days[calendar.days.length - 1].date
  );
}

export function useContributionCalendar(
  initialCalendar: ContributionCalendar,
  initialSource: "live" | "snapshot"
): ContributionResult {
  const [result, setResult] = useState<ContributionResult>({
    calendar: initialCalendar,
    source: initialSource,
  });
  const username = initialCalendar.username;

  useEffect(() => {
    let disposed = false;
    let lastChecked = 0;
    let request: AbortController | null = null;
    let timer: number | undefined;

    const schedule = () => {
      window.clearTimeout(timer);
      if (!disposed && !document.hidden) {
        timer = window.setTimeout(
          () => void refresh(),
          Math.max(0, REFRESH_MS - (Date.now() - lastChecked))
        );
      }
    };

    const refresh = async () => {
      if (disposed || document.hidden || request) {
        return;
      }
      if (Date.now() - lastChecked < REFRESH_MS) {
        schedule();
        return;
      }
      lastChecked = Date.now();
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch("/api/contributions", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const next: unknown = await response.json();
        if (
          disposed ||
          document.hidden ||
          controller.signal.aborted ||
          !validResult(next, username)
        ) {
          return;
        }
        setResult((current) => {
          if (
            next.calendar.to < current.calendar.to ||
            Date.parse(next.calendar.fetchedAt) <
              Date.parse(current.calendar.fetchedAt)
          ) {
            return current;
          }
          return next;
        });
      } catch {
        // Preserve the last valid calendar if offline, aborted, or malformed.
      } finally {
        window.clearTimeout(timeout);
        request = null;
        schedule();
      }
    };

    const visibilityChanged = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        request?.abort();
      } else void refresh();
    };

    void refresh();
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      disposed = true;
      request?.abort();
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [username]);

  return result;
}
