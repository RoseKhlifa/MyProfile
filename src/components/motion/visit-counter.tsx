"use client";

import { ArrowUpRight, Eye, Github } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PROFILE_REPOSITORY } from "@/data/projects";
import "./visit-counter.css";

type VisitResult = { total: number };

function createVisitId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // getRandomValues also works when previewing over a server's plain HTTP IP.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) =>
    value.toString(16).padStart(2, "0")
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function isVisitResult(value: unknown): value is VisitResult {
  if (!value || typeof value !== "object" || !("total" in value)) return false;
  return Number.isSafeInteger(value.total) && Number(value.total) >= 0;
}

export function VisitCounter() {
  const eventId = useRef<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    eventId.current ??= createVisitId();
    const requestId = eventId.current;

    async function registerVisit() {
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: requestId }),
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Visit count unavailable");
        const result: unknown = await response.json();
        if (!isVisitResult(result)) throw new Error("Invalid visit count");
        if (!disposed) {
          setTotal(result.total);
          setUnavailable(false);
        }
      } catch {
        if (!disposed) setUnavailable(true);
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void registerVisit();
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <footer className="cv-site-footer text-xs">
      <p className="cv-visit-counter">
        <Eye size={13} strokeWidth={1.4} aria-hidden="true" />
        <span>本站访问</span>
        <span className="cv-visit-divider" aria-hidden="true">
          ·
        </span>
        <output
          className="cv-visit-total"
          aria-label="累计访问次数"
          aria-live="polite"
          aria-busy={total === null && !unavailable}
        >
          {total !== null ? (
            <>
              <span className="cv-visit-number">
                {total.toLocaleString("en-US")}
              </span>
              <span> 次</span>
            </>
          ) : unavailable ? (
            <span className="cv-visit-unavailable">暂不可用</span>
          ) : (
            <span className="cv-visit-loading">
              <span aria-hidden="true">—</span>
              <span className="sr-only">正在加载</span>
            </span>
          )}
        </output>
      </p>
      <a
        className="cv-site-filing"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="豫ICP备2026044107号-1（工信部备案查询，新标签页）"
      >
        豫ICP备2026044107号-1
      </a>
      <div className="cv-site-source">
        <a
          href={PROFILE_REPOSITORY}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="本站开源 MyProfile：查看源码、Star 或 Fork（新标签页）"
        >
          <Github size={13} strokeWidth={1.5} aria-hidden="true" />
          <span>本站开源</span>
          <span aria-hidden="true">·</span>
          <span className="cv-site-source-name">MyProfile</span>
          <span>Star / Fork</span>
          <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
