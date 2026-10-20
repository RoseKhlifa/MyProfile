"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionMode } from "./enhancements";
import "./ambient-background.css";

export function AmbientBackground() {
  const { reduced } = useMotionMode();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const track = pathRef.current;
    if (!track) return;
    const desktop = window.matchMedia("(min-width: 1400px)");
    const update = () => {
      if (reduced || !visible || !desktop.matches) track.pauseAnimations();
      else track.unpauseAnimations();
    };
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, [reduced, visible]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || !visible) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let lastFrame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetDepth = 0;
    let currentDepth = 0;

    const update = (now: number) => {
      if (document.hidden) {
        frame = 0;
        return;
      }
      const elapsed = lastFrame === 0 ? 32 : now - lastFrame;
      if (elapsed < 30) {
        frame = requestAnimationFrame(update);
        return;
      }
      lastFrame = now;
      const easing = 1 - Math.exp(-Math.min(elapsed, 64) / 580);
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;
      currentDepth += (targetDepth - currentDepth) * easing;
      root.style.setProperty("--ambient-pointer-x", `${currentX.toFixed(2)}px`);
      root.style.setProperty("--ambient-pointer-y", `${currentY.toFixed(2)}px`);
      root.style.setProperty(
        "--ambient-scroll-y",
        `${currentDepth.toFixed(2)}px`
      );
      if (
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05 ||
        Math.abs(targetDepth - currentDepth) > 0.05
      ) {
        frame = requestAnimationFrame(update);
      } else {
        frame = 0;
        lastFrame = 0;
      }
    };

    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 20;
      targetY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 16;
      schedule();
    };

    const scroll = () => {
      const range = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetDepth = -Math.min(Math.max(window.scrollY / range, 0), 1) * 16;
      schedule();
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    finePointer.addEventListener("change", reset);
    scroll();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
      finePointer.removeEventListener("change", reset);
      root.style.removeProperty("--ambient-pointer-x");
      root.style.removeProperty("--ambient-pointer-y");
      root.style.removeProperty("--ambient-scroll-y");
    };
  }, [reduced, visible]);

  return (
    <div
      ref={rootRef}
      className="cv-ambient-background"
      aria-hidden="true"
      data-active={reduced ? "static" : visible ? "running" : "paused"}
    >
      <div className="cv-ambient-atmosphere">
        <div className="cv-ambient-parallax">
          <div className="cv-ambient-mist cv-ambient-mist-silver" />
          <div className="cv-ambient-mist cv-ambient-mist-cool" />
          <div className="cv-ambient-mist cv-ambient-mist-low" />
        </div>
      </div>
      <div className="cv-ambient-margin-space" data-protected-width="1088">
        <div className="cv-ambient-contour cv-ambient-contour-left">
          <svg
            ref={pathRef}
            viewBox="0 0 460 760"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="cv-ambient-line"
              d="M 398 -80 C -72 98, -90 624, 360 838"
            />
            <path
              className="cv-ambient-line cv-ambient-line-echo"
              d="M 422 -80 C -46 102, -63 620, 384 838"
            />
            <circle className="cv-ambient-traveler" r="1.5">
              <animateMotion
                dur="42s"
                repeatCount="indefinite"
                path="M 398 -80 C -72 98, -90 624, 360 838"
              />
            </circle>
          </svg>
        </div>
        <div className="cv-ambient-contour cv-ambient-contour-right">
          <svg viewBox="0 0 460 760" fill="none" aria-hidden="true">
            <path
              className="cv-ambient-line"
              d="M 398 -80 C -72 98, -90 624, 360 838"
            />
            <path
              className="cv-ambient-line cv-ambient-line-echo"
              d="M 422 -80 C -46 102, -63 620, 384 838"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
