"use client";

import { ArrowUpRight } from "lucide-react";
import { useInView } from "motion/react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ContributionCalendar,
  ContributionDay,
} from "@/lib/github-contributions";
import { ContributionSnake } from "./contribution-snake";
import { useMotionMode } from "./enhancements";
import { useContributionCalendar } from "./use-contribution-calendar";
import "./contribution-graph.css";

const DAY_MS = 86_400_000;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateNumber(date: string) {
  return new Date(`${date}T00:00:00Z`).getTime();
}

function dateLabel(day: ContributionDay) {
  return `${day.date.replaceAll("-", ".")} · ${day.count} 次贡献`;
}

export function ContributionGraph({
  calendar: initialCalendar,
  source: initialSource,
}: {
  calendar: ContributionCalendar;
  source: "live" | "snapshot";
}) {
  const { calendar, source } = useContributionCalendar(
    initialCalendar,
    initialSource
  );
  const root = useRef<HTMLDivElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const visible = useInView(root, { once: true, amount: 0.15 });
  const { reduced } = useMotionMode();
  const [focusedDate, setFocusedDate] = useState(calendar.to);
  const [tip, setTip] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const [interacting, setInteracting] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    if (!calendar.days.some((day) => day.date === focusedDate))
      setFocusedDate(calendar.to);
  }, [calendar, focusedDate]);

  const weeks = useMemo(() => {
    const firstDay = new Date(`${calendar.from}T00:00:00Z`);
    const start = firstDay.getTime() - firstDay.getUTCDay() * DAY_MS;
    const totalWeeks = Math.ceil(
      (dateNumber(calendar.to) - start + DAY_MS) / (7 * DAY_MS)
    );
    const result: (ContributionDay | null)[][] = Array.from(
      { length: totalWeeks },
      () => Array.from({ length: 7 }, () => null)
    );
    for (const day of calendar.days) {
      const offset = Math.round((dateNumber(day.date) - start) / DAY_MS);
      result[Math.floor(offset / 7)][offset % 7] = day;
    }
    return result;
  }, [calendar]);

  const monthLabels = useMemo(
    () =>
      weeks.map((week, index) => {
        const first = week.find((day) => day !== null);
        const previous = weeks[index - 1]?.find((day) => day !== null);
        if (!first || first.date.slice(5, 7) === previous?.date.slice(5, 7))
          return "";
        return MONTHS[Number(first.date.slice(5, 7)) - 1];
      }),
    [weeks]
  );

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    // On narrow screens, begin with the most recent activity in view.
    element.scrollLeft = element.scrollWidth;
    const measure = () =>
      setEdges({
        start: element.scrollLeft > 2,
        end: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  function showTip(day: ContributionDay, button: HTMLButtonElement) {
    const frame = root.current?.getBoundingClientRect();
    if (!frame) return;
    const rect = button.getBoundingClientRect();
    setTip({
      day,
      x: Math.max(
        108,
        Math.min(frame.width - 108, rect.left + rect.width / 2 - frame.left)
      ),
      y: rect.top - frame.top - 9,
    });
  }

  function moveFocus(
    event: KeyboardEvent<HTMLButtonElement>,
    day: ContributionDay
  ) {
    const changes: Record<string, number> = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
    };
    if (event.key === "Escape") {
      setTip(null);
      return;
    }
    const index = calendar.days.findIndex((item) => item.date === day.date);
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = calendar.days.length - 1;
    else if (event.key in changes) next += changes[event.key];
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(calendar.days.length - 1, next));
    const date = calendar.days[next].date;
    setFocusedDate(date);
    buttons.current.get(date)?.focus({ preventScroll: true });
    buttons.current
      .get(date)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  const profile = `https://github.com/${calendar.username}`;

  return (
    <div
      ref={root}
      className="cv-contribution text-xs"
      data-revealed={visible || reduced}
    >
      <div className="cv-contribution-heading">
        <p className="text-body">
          <span className="cv-contribution-total">
            {calendar.total.toLocaleString("en-US")}
          </span>
          <span className="text-muted-foreground"> 次贡献 · 过去一年</span>
        </p>
        <a
          className="cv-contribution-profile"
          href={profile}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{calendar.username}
          <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
      <div className="cv-contribution-frame">
        <div
          className="cv-contribution-scroll-wrap"
          data-fade-start={edges.start}
          data-fade-end={edges.end}
        >
          <div
            ref={scroller}
            className="cv-contribution-scroll"
            onScroll={() => setTip(null)}
            onPointerDown={() => setInteracting(true)}
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse") setInteracting(false);
            }}
            onPointerCancel={() => setInteracting(false)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setInteracting(true);
            }}
            onPointerLeave={() => setInteracting(false)}
            onFocusCapture={() => setFocusWithin(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setFocusWithin(false);
            }}
          >
            <div ref={plot} className="cv-contribution-plot">
              <table
                className="cv-contribution-table"
                aria-label={`${calendar.username} 的 GitHub 贡献日历，共 ${calendar.total} 次贡献`}
              >
                <colgroup>
                  <col className="cv-contribution-weekday-col" />
                  {weeks.map((week) => (
                    <col key={week.find(Boolean)?.date} />
                  ))}
                </colgroup>
                <thead aria-hidden="true">
                  <tr>
                    <td />
                    {monthLabels.map((month, index) => (
                      <td key={weeks[index].find(Boolean)?.date}>
                        <span>{month}</span>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map((weekday, row) => (
                    <tr key={weekday}>
                      <th scope="row">
                        <span className={row % 2 === 0 ? "sr-only" : undefined}>
                          {weekday}
                        </span>
                      </th>
                      {weeks.map((week, column) => {
                        const day = week[row];
                        return (
                          <td key={week.find(Boolean)?.date}>
                            {day ? (
                              <button
                                ref={(element) => {
                                  if (element)
                                    buttons.current.set(day.date, element);
                                  else buttons.current.delete(day.date);
                                }}
                                type="button"
                                className="cv-contribution-day"
                                data-date={day.date}
                                data-count={day.count}
                                data-level={day.level}
                                aria-label={dateLabel(day)}
                                aria-describedby={
                                  tip?.day.date === day.date
                                    ? "contribution-tooltip"
                                    : undefined
                                }
                                tabIndex={focusedDate === day.date ? 0 : -1}
                                style={
                                  {
                                    "--week": column,
                                    "--day": row,
                                  } as CSSProperties
                                }
                                onPointerEnter={(event) =>
                                  showTip(day, event.currentTarget)
                                }
                                onPointerLeave={() => setTip(null)}
                                onFocus={(event) => {
                                  setFocusedDate(day.date);
                                  showTip(day, event.currentTarget);
                                }}
                                onBlur={() => setTip(null)}
                                onClick={(event) =>
                                  showTip(day, event.currentTarget)
                                }
                                onKeyDown={(event) => moveFocus(event, day)}
                              />
                            ) : (
                              <span className="cv-contribution-empty" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <ContributionSnake
                plot={plot}
                days={calendar.days}
                paused={interacting || focusWithin || tip !== null}
              />
            </div>
          </div>
        </div>
        <div className="cv-contribution-footer text-muted-foreground">
          <span className="cv-contribution-range">
            {calendar.from.replaceAll("-", ".")} —{" "}
            {calendar.to.replaceAll("-", ".")}
          </span>
          <div
            className="cv-contribution-legend"
            role="img"
            aria-label="颜色越亮，贡献越多"
          >
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="cv-contribution-swatch"
                data-level={level}
                aria-hidden="true"
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
      {source === "snapshot" && (
        <p className="cv-contribution-cached text-muted-foreground">
          最近同步于 {calendar.fetchedAt.slice(0, 10).replaceAll("-", ".")}
        </p>
      )}
      {tip && (
        <div
          id="contribution-tooltip"
          role="tooltip"
          className="cv-contribution-tooltip"
          style={{ left: tip.x, top: tip.y }}
        >
          {dateLabel(tip.day)}
        </div>
      )}
    </div>
  );
}
