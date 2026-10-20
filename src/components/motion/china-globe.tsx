"use client";

import createGlobe from "cobe";
import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMotionMode } from "./enhancements";
import "./china-globe.css";

const CHINA: [number, number] = [35.86, 104.2];
const HOME_THETA = (CHINA[0] * Math.PI) / 180;
const HOME_PHI = (Math.PI * 3) / 2 - (CHINA[1] * Math.PI) / 180;
const TAU = Math.PI * 2;

// COBE v2 U(lat, lon) = (cos(lat)cos(lon), sin(lat), -cos(lat)sin(lon)).
// O projects x = cos(phi)x + sin(phi)z and
// y = sin(phi)sin(theta)x + cos(theta)y - cos(phi)sin(theta)z.
// phi = 3pi/2 - longitude, theta = latitude gives screen (0, 0), depth +1.

export function ChinaGlobe() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => undefined);
  const { reduced } = useMotionMode();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const mount = mountRef.current;
    if (!viewport || !mount) return;
    const canvas = document.createElement("canvas");
    canvas.className = "china-globe-canvas";
    mount.appendChild(canvas);
    let globe: ReturnType<typeof createGlobe> | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let disposed = false;
    let failed = false;
    let visible = true;
    let frame = 0;
    let lastTime = 0;
    let phi = HOME_PHI;
    let theta = HOME_THETA;
    let velocityPhi = 0;
    let velocityTheta = 0;
    let dragPointer: number | null = null;
    let previousX = 0;
    let previousY = 0;
    let previousTime = 0;
    let returnAfter = 0;
    let forceHome = false;
    const timers: number[] = [];

    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const fail = () => {
      failed = true;
      pause();
      if (!disposed) setReady(false);
    };
    const draw = (width?: number, height?: number) => {
      if (!globe || disposed || failed) return;
      try {
        globe.update({
          phi,
          theta,
          ...(width && height ? { width, height } : {}),
        });
      } catch {
        fail();
      }
    };
    const animate = (time: number) => {
      frame = 0;
      if (disposed || failed || reduced || !visible || document.hidden) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 1 / 60;
      lastTime = time;
      if (dragPointer === null) {
        if (time < returnAfter && !forceHome) {
          phi += velocityPhi * dt;
          theta = Math.max(-1.25, Math.min(1.25, theta + velocityTheta * dt));
          velocityPhi *= Math.exp(-3.5 * dt);
          velocityTheta *= Math.exp(-3.5 * dt);
        } else {
          const drift = forceHome ? 0 : Math.sin(time * 0.0002) * 0.045;
          const homePhi = HOME_PHI + drift;
          const shortest = Math.atan2(
            Math.sin(homePhi - phi),
            Math.cos(homePhi - phi)
          );
          const follow = 1 - Math.exp(-(forceHome ? 4.5 : 1.25) * dt);
          phi += shortest * follow;
          theta +=
            (HOME_THETA +
              (forceHome ? 0 : Math.sin(time * 0.00015) * 0.016) -
              theta) *
            follow;
          velocityPhi = 0;
          velocityTheta = 0;
          if (
            forceHome &&
            Math.abs(shortest) < 0.001 &&
            Math.abs(theta - HOME_THETA) < 0.001
          )
            forceHome = false;
        }
      }
      draw();
      if (!failed) frame = requestAnimationFrame(animate);
    };
    const resume = () => {
      if (disposed || failed || !visible || document.hidden) return;
      if (reduced) draw();
      else if (!frame) frame = requestAnimationFrame(animate);
    };
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (width > 0 && height > 0 && visible && !document.hidden)
        draw(width, height);
    };
    const pointerDown = (event: PointerEvent) => {
      if (
        dragPointer !== null ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      dragPointer = event.pointerId;
      previousX = event.clientX;
      previousY = event.clientY;
      previousTime = event.timeStamp;
      velocityPhi = 0;
      velocityTheta = 0;
      forceHome = false;
      viewport.dataset.dragging = "true";
      viewport.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragPointer) return;
      const dx = event.clientX - previousX;
      const dy = event.clientY - previousY;
      const dt = Math.max((event.timeStamp - previousTime) / 1000, 0.008);
      phi += dx * 0.009;
      theta = Math.max(-1.25, Math.min(1.25, theta + dy * 0.007));
      velocityPhi = Math.max(-2.2, Math.min(2.2, (dx * 0.009) / dt));
      velocityTheta = Math.max(-1.5, Math.min(1.5, (dy * 0.007) / dt));
      previousX = event.clientX;
      previousY = event.clientY;
      previousTime = event.timeStamp;
      if (reduced) draw();
    };
    const pointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== dragPointer) return;
      dragPointer = null;
      returnAfter = performance.now() + 3600;
      viewport.dataset.dragging = "false";
      if (viewport.hasPointerCapture(event.pointerId))
        viewport.releasePointerCapture(event.pointerId);
    };
    const visibilityChange = () => {
      if (document.hidden) pause();
      else resume();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    resetRef.current = () => {
      velocityPhi = 0;
      velocityTheta = 0;
      returnAfter = 0;
      forceHome = true;
      if (reduced) {
        phi = HOME_PHI;
        theta = HOME_THETA;
        draw();
      } else resume();
    };

    setReady(false);
    try {
      // COBE returns no-op methods rather than throwing when WebGL is absent.
      const context =
        canvas.getContext("webgl2", { alpha: true, antialias: true }) ??
        canvas.getContext("webgl", { alpha: true, antialias: true });
      if (!context) throw new Error("No globe renderer");
      const bounds = mount.getBoundingClientRect();
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: Math.max(bounds.width, 1),
        height: Math.max(bounds.height, 1),
        phi,
        theta,
        dark: 1,
        diffuse: 1.55,
        scale: 1.04,
        mapSamples: 22000,
        mapBrightness: 4.7,
        baseColor: [0.68, 0.7, 0.72],
        markerColor: [0.75, 0.91, 0.92],
        glowColor: [0.08, 0.1, 0.11],
        markers: [{ location: CHINA, size: 0.055 }],
      });
      phi = ((phi % TAU) + TAU) % TAU;
      setReady(true);
      viewport.addEventListener("pointerdown", pointerDown);
      viewport.addEventListener("pointermove", pointerMove, { passive: true });
      viewport.addEventListener("pointerup", pointerEnd);
      viewport.addEventListener("pointercancel", pointerEnd);
      viewport.addEventListener("lostpointercapture", pointerEnd);
      canvas.addEventListener("webglcontextlost", contextLost);
      document.addEventListener("visibilitychange", visibilityChange);
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
      }
      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            resize();
            resume();
          } else pause();
        });
        intersectionObserver.observe(viewport);
      }
      for (const delay of [80, 300])
        timers.push(
          window.setTimeout(() => {
            if (visible && !document.hidden) draw();
          }, delay)
        );
      resume();
    } catch {
      fail();
    }

    return () => {
      disposed = true;
      pause();
      timers.forEach(window.clearTimeout);
      resetRef.current = () => undefined;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      viewport.removeEventListener("pointerdown", pointerDown);
      viewport.removeEventListener("pointermove", pointerMove);
      viewport.removeEventListener("pointerup", pointerEnd);
      viewport.removeEventListener("pointercancel", pointerEnd);
      viewport.removeEventListener("lostpointercapture", pointerEnd);
      canvas.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", visibilityChange);
      globe?.destroy();
      mount.replaceChildren();
    };
  }, [reduced]);

  return (
    <div className="china-globe-root">
      <div
        ref={viewportRef}
        className={`china-globe-viewport${ready ? " china-globe-ready" : ""}`}
        aria-hidden="true"
      >
        <span className="china-globe-fallback">
          <i />
          <i />
          <span />
        </span>
        <div ref={mountRef} className="china-globe-mount" />
      </div>
      <div className="china-globe-copy">
        <span className="china-globe-eyebrow">Digital presence</span>
        <span className="china-globe-location">
          <span className="china-globe-location-dot" />
          China
          <button
            type="button"
            className="china-globe-reset"
            aria-label="回到中国视角"
            title="回到中国视角"
            onClick={() => resetRef.current()}
          >
            <LocateFixed size={14} strokeWidth={1.5} />
          </button>
        </span>
      </div>
    </div>
  );
}
