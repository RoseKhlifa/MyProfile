"use client";

import { useInView } from "motion/react";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
  createContributionSnake,
  SNAKE_LENGTH,
  SNAKE_REST_MS,
  SNAKE_STEP_MS,
} from "@/lib/contribution-snake";
import type { ContributionDay } from "@/lib/github-contributions";
import { useMotionMode } from "./enhancements";

type Point = { x: number; y: number; size: number };

export function ContributionSnake({
  plot,
  days,
  paused,
}: {
  plot: RefObject<HTMLDivElement | null>;
  days: ContributionDay[];
  paused: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const meal = useRef<SVGRectElement>(null);
  const progress = useRef(0);
  const { reduced } = useMotionMode();
  const inView = useInView(plot, { amount: 0.1 });
  // A refresh with identical days does not restart the snake's route.
  const signature = days.map((day) => `${day.date}:${day.count}`).join("|");
  const route = useMemo(() => {
    const current = signature.split("|").map((entry) => {
      const [date, count] = entry.split(":");
      return { date, count: Number(count), level: 0 as const };
    });
    return createContributionSnake(current);
  }, [signature]);

  useEffect(() => {
    if (route.length > 0) progress.current = 0;
  }, [route]);

  useEffect(() => {
    const root = plot.current;
    const layer = svg.current;
    const bodyPath = trail.current;
    const headGroup = head.current;
    const mealGlow = meal.current;
    if (
      !root ||
      !layer ||
      !bodyPath ||
      !headGroup ||
      !mealGlow ||
      route.length < 2
    )
      return;

    let points = new Map<string, Point>();
    let raf = 0;
    let last = 0;
    let lastPaint = -1;
    let eatenIndex = -1;
    let eatenAt = 0;
    let eatenPoint: Point | undefined;
    const duration = (route.length - 1) * SNAKE_STEP_MS;
    const cycle = duration + SNAKE_REST_MS;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next = new Map<string, Point>();
      for (const button of root.querySelectorAll<HTMLButtonElement>(
        ".cv-contribution-day"
      )) {
        const cell = button.getBoundingClientRect();
        if (button.dataset.date)
          next.set(button.dataset.date, {
            x: cell.left - rect.left + cell.width / 2,
            y: cell.top - rect.top + cell.height / 2,
            size: cell.width,
          });
      }
      points = next;
      layer.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
      lastPaint = -1;
    };

    const frame = (now: number) => {
      raf = 0;
      if (document.hidden || paused || reduced || !inView) return;
      if (last === 0) last = now;
      progress.current = (progress.current + Math.min(now - last, 64)) % cycle;
      last = now;
      const elapsed = progress.current;
      if (elapsed >= duration) {
        // The calendar rests between passes, giving the data time on its own.
        layer.style.opacity = String(
          Math.max(0, 1 - (elapsed - duration) / 650)
        );
        mealGlow.style.opacity = "0";
        eatenIndex = -1;
      } else {
        layer.style.opacity = String(Math.min(1, elapsed / 450));
        const step = elapsed / SNAKE_STEP_MS;
        const index = Math.floor(step);
        const fraction = step - index;
        const interpolate = (offset: number) => {
          const before = points.get(route[Math.max(0, index - offset)].date);
          const after = points.get(route[Math.max(0, index + 1 - offset)].date);
          if (!before || !after) return undefined;
          return {
            x: before.x + (after.x - before.x) * fraction,
            y: before.y + (after.y - before.y) * fraction,
            size: after.size,
          };
        };
        const segments = Array.from({ length: SNAKE_LENGTH }, (_, offset) =>
          interpolate(offset)
        ).filter((point): point is Point => point !== undefined);
        const front = segments[0];
        const previous = points.get(route[index].date);
        const next = points.get(route[index + 1].date);
        if (front && previous && next) {
          bodyPath.setAttribute(
            "d",
            segments
              .map(
                (point, i) =>
                  `${i === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`
              )
              .join(" ")
          );
          bodyPath.setAttribute("stroke-width", String(front.size * 0.43));
          const angle =
            (Math.atan2(next.y - previous.y, next.x - previous.x) * 180) /
            Math.PI;
          headGroup.setAttribute(
            "transform",
            `translate(${front.x},${front.y}) rotate(${angle}) scale(${front.size / 12})`
          );
          if (index !== lastPaint) layer.dataset.snakeDate = route[index].date;
        }
        if (index !== lastPaint) {
          lastPaint = index;
          if (route[index].meal && index !== eatenIndex) {
            eatenIndex = index;
            eatenAt = elapsed;
            eatenPoint = points.get(route[index].date);
          }
        }
        if (eatenPoint) {
          const age = elapsed - eatenAt;
          const strength = age >= 0 && age < 650 ? 1 - age / 650 : 0;
          mealGlow.setAttribute(
            "x",
            String(eatenPoint.x - eatenPoint.size / 2)
          );
          mealGlow.setAttribute(
            "y",
            String(eatenPoint.y - eatenPoint.size / 2)
          );
          mealGlow.setAttribute("width", String(eatenPoint.size));
          mealGlow.setAttribute("height", String(eatenPoint.size));
          mealGlow.style.opacity = String(strength * 0.55);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const update = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (document.hidden || paused || reduced || !inView) {
        layer.style.opacity = "0";
        layer.dataset.running = "false";
        return;
      }
      layer.dataset.running = "true";
      measure();
      raf = requestAnimationFrame(frame);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      layer.style.opacity = "0";
      layer.dataset.running = "false";
    };
  }, [plot, route, paused, reduced, inView]);

  return (
    <svg
      ref={svg}
      className="cv-contribution-snake"
      aria-hidden="true"
      focusable="false"
      data-running="false"
    >
      <rect ref={meal} className="cv-contribution-snake-meal" rx="2" />
      <path
        ref={trail}
        className="cv-contribution-snake-body"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g ref={head} className="cv-contribution-snake-head">
        <rect x="-3.6" y="-3.1" width="7.2" height="6.2" rx="2.1" />
        <circle
          className="cv-contribution-snake-eye"
          cx="1.4"
          cy="-1.5"
          r="0.55"
        />
        <circle
          className="cv-contribution-snake-eye"
          cx="1.4"
          cy="1.5"
          r="0.55"
        />
      </g>
    </svg>
  );
}
