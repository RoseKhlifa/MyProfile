"use client";

import createGlobe from "cobe";
import {
  BookOpen,
  BriefcaseBusiness,
  CircleUserRound,
  Mail,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  type MotionValue,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  createContext,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./enhancements.css";

type MotionMode = "system" | "full" | "reduced";
type MotionContextValue = {
  reduced: boolean;
  mode: MotionMode;
  setMode: (mode: MotionMode) => void;
};
const MotionContext = createContext<MotionContextValue | null>(null);
const ease = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  const systemReduced = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const [mode, updateMode] = useState<MotionMode>("full");

  useEffect(() => {
    // The site starts with full motion; a previous preview preference is ignored.
    setHydrated(true);
  }, []);

  const setMode = useCallback((next: MotionMode) => {
    updateMode(next);
    try {
      localStorage.setItem("rk-motion", next);
    } catch {
      /* The current session still updates. */
    }
  }, []);
  const reduced =
    hydrated &&
    (mode === "reduced" || (mode === "system" && Boolean(systemReduced)));
  const value = useMemo(
    () => ({ reduced, mode, setMode }),
    [reduced, mode, setMode]
  );

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export function useMotionMode(): MotionContextValue {
  const value = useContext(MotionContext);
  return value ?? { reduced: true, mode: "system", setMode: () => undefined };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.08 });
  const { reduced } = useMotionMode();
  return (
    <motion.div
      ref={ref}
      className={`motion-enhance-reveal ${className}`}
      initial={false}
      animate={
        reduced || visible
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 4, filter: "blur(3px)" }
      }
      transition={{
        duration: reduced ? 0 : 0.5,
        delay: reduced ? 0 : delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({ children }: { children: ReactNode }) {
  const { reduced } = useMotionMode();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 21, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 240, damping: 21, mass: 0.4 });
  const move = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (
      reduced ||
      event.pointerType === "touch" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
  };
  useEffect(() => {
    if (reduced) {
      x.set(0);
      y.set(0);
      springX.jump(0);
      springY.jump(0);
    }
  }, [reduced, x, y, springX, springY]);
  return (
    <motion.span
      className="motion-enhance-magnetic"
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}

export function TextEffect({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.3 });
  const { reduced } = useMotionMode();
  return (
    <span ref={ref} className="motion-enhance-text-effect">
      <span className="motion-enhance-reader">{text}</span>
      <span aria-hidden="true" className="motion-enhance-text-visual">
        {Array.from(text).map((character, index) => (
          <motion.span
            key={`${index}-${character}`}
            className="motion-enhance-text-character"
            initial={false}
            animate={
              reduced || visible
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 2, filter: "blur(2px)" }
            }
            transition={{
              duration: reduced ? 0 : 0.35,
              delay: reduced ? 0 : Math.min(index * 0.012, 0.5),
              ease,
            }}
          >
            {character}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

export function TextLoop({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref);
  const { reduced } = useMotionMode();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || !visible || words.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % words.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [reduced, visible, words.length]);
  const current = reduced ? 0 : index % Math.max(words.length, 1);
  return (
    <span ref={ref} className="motion-enhance-text-loop">
      <span className="motion-enhance-reader">{words[0] ?? ""}</span>
      {words.map((word) => (
        <span
          key={word}
          className="motion-enhance-text-reserve"
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
      <AnimatePresence initial={false} mode="sync">
        <motion.span
          key={current}
          className="motion-enhance-text-loop-current"
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduced
              ? { opacity: 0 }
              : { opacity: 0, y: -4, filter: "blur(2px)" }
          }
          transition={{ duration: reduced ? 0 : 0.32, ease }}
        >
          {words[current] ?? ""}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AnimatedTabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: readonly { value: string; label: string }[];
}) {
  const { reduced } = useMotionMode();
  const filters = options ?? [
    { value: "all", label: "全部" },
    { value: "web", label: "网页" },
    { value: "writing", label: "写作" },
  ];
  return (
    <LayoutGroup>
      <fieldset className="motion-enhance-tabs" aria-label="筛选项目">
        {filters.map((filter) => (
          <button
            type="button"
            className="motion-enhance-tab"
            key={filter.value}
            onClick={() => onChange(filter.value)}
            aria-pressed={value === filter.value}
          >
            {value === filter.value && (
              <motion.span
                className="motion-enhance-tab-highlight"
                layoutId="project-filter"
                transition={{ duration: reduced ? 0 : 0.24, ease }}
              />
            )}
            <span className="motion-enhance-tab-label">{filter.label}</span>
          </button>
        ))}
      </fieldset>
    </LayoutGroup>
  );
}

export function ProfileGlobe() {
  const mountRef = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionMode();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.className = "motion-enhance-globe-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    let globe: ReturnType<typeof createGlobe> | undefined;
    let frame = 0;
    let lastTime = 0;
    let phi = 3.95;
    let pointerX = 0;
    let smoothX = 0;
    let visible = true;
    let disposed = false;
    let failed = false;
    const timers: number[] = [];
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
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
          phi: phi + smoothX * 0.2,
          ...(width && height ? { width, height } : {}),
        });
      } catch {
        fail();
      }
    };
    const animate = (time: number) => {
      frame = 0;
      if (reduced || disposed || failed || !visible || document.hidden) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = time;
      phi += dt * 0.12;
      smoothX += (pointerX - smoothX) * (1 - Math.exp(-6 * dt));
      draw();
      if (!failed) frame = requestAnimationFrame(animate);
    };
    const resume = () => {
      if (disposed || failed || !visible || document.hidden) return;
      if (reduced) draw();
      else if (!frame) frame = requestAnimationFrame(animate);
    };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width > 0 && height > 0 && visible && !document.hidden)
        draw(width, height);
    };
    const pointerMove = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)
      );
    };
    const pointerLeave = () => {
      pointerX = 0;
    };
    const visibility = () => {
      if (document.hidden) pause();
      else resume();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };

    setReady(false);
    try {
      const bounds = host.getBoundingClientRect();
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: Math.max(bounds.width, 112),
        height: Math.max(bounds.height, 112),
        phi,
        theta: 0.23,
        dark: 1,
        diffuse: 1.65,
        scale: 1.1,
        mapSamples: 16000,
        mapBrightness: 3.8,
        baseColor: [0.62, 0.62, 0.62],
        markerColor: [1, 1, 1],
        glowColor: [0.12, 0.12, 0.12],
        markers: [],
      });
      setReady(true);
      host.addEventListener("pointermove", pointerMove, { passive: true });
      host.addEventListener("pointerleave", pointerLeave);
      canvas.addEventListener("webglcontextlost", contextLost);
      document.addEventListener("visibilitychange", visibility);
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
      }
      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            resize();
            resume();
          } else pause();
        });
        intersectionObserver.observe(host);
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
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerleave", pointerLeave);
      canvas.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", visibility);
      globe?.destroy();
      host.replaceChildren();
    };
  }, [reduced]);

  return (
    <span
      className={`motion-enhance-globe${ready ? " motion-enhance-globe-ready" : ""}`}
      aria-hidden="true"
    >
      <span className="motion-enhance-globe-fallback">
        <i />
        <i />
      </span>
      <span className="motion-enhance-globe-mount" ref={mountRef} />
    </span>
  );
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const { reduced } = useMotionMode();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="motion-enhance-progress"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
      aria-hidden="true"
    />
  );
}

function scrollToSection(id: string, reduced: boolean) {
  const target = document.getElementById(id);
  if (!target) return;
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: reduced ? "instant" : "smooth",
    block: "start",
  });
}

function DockIcon({
  mouseX,
  children,
}: {
  mouseX: MotionValue<number>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionMode();
  const proximity = useTransform(mouseX, (position) => {
    if (reduced || !Number.isFinite(position) || !ref.current) return 1;
    const bounds = ref.current.getBoundingClientRect();
    const distance = Math.abs(position - bounds.left - bounds.width / 2);
    return 1 + Math.max(0, 1 - distance / 88) ** 2 * 0.36;
  });
  const scale = useSpring(proximity, {
    stiffness: 340,
    damping: 25,
    mass: 0.35,
  });
  const y = useTransform(scale, [1, 1.36], [0, -2.5]);
  useEffect(() => {
    if (reduced) scale.jump(1);
  }, [reduced, scale]);
  return (
    <motion.span
      ref={ref}
      className="motion-enhance-dock-icon"
      style={{ scale, y }}
      aria-hidden="true"
    >
      {children}
    </motion.span>
  );
}

export function NumberTicker({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const { reduced } = useMotionMode();
  const spring = useSpring(0, { stiffness: 100, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );
  useEffect(() => {
    if (reduced) spring.jump(value);
    else if (visible) spring.set(value);
  }, [value, reduced, visible, spring]);
  return (
    <span ref={ref} className="motion-enhance-number">
      <span className="motion-enhance-reader">{value}</span>
      <span className="motion-enhance-number-reserve" aria-hidden="true">
        {value.toLocaleString()}
      </span>
      <motion.span className="motion-enhance-number-current" aria-hidden="true">
        {display}
      </motion.span>
    </span>
  );
}

export function Dock({ blogUrl }: { blogUrl: string }) {
  const { reduced } = useMotionMode();
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  useEffect(() => {
    if (reduced) mouseX.set(Number.POSITIVE_INFINITY);
  }, [reduced, mouseX]);
  const entries = [
    { id: "about-section", label: "关于", Icon: CircleUserRound },
    { id: "side-projects", label: "项目", Icon: BriefcaseBusiness },
  ];
  return (
    <nav
      className="motion-enhance-dock"
      data-reduced={reduced}
      aria-label="快捷导航"
      onPointerMove={(event) => {
        if (
          !reduced &&
          event.pointerType !== "touch" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          mouseX.set(event.clientX);
      }}
      onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
    >
      {entries.map(({ id, label, Icon }) => (
        <button
          type="button"
          className="motion-enhance-dock-item"
          key={id}
          onClick={() => scrollToSection(id, reduced)}
          aria-label={label}
        >
          <DockIcon mouseX={mouseX}>
            <Icon size={17} strokeWidth={1.5} />
          </DockIcon>
          <span className="motion-enhance-tooltip" aria-hidden="true">
            {label}
          </span>
        </button>
      ))}
      <a
        className="motion-enhance-dock-item"
        href={blogUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="博客（新窗口）"
      >
        <DockIcon mouseX={mouseX}>
          <BookOpen size={17} strokeWidth={1.5} />
        </DockIcon>
        <span className="motion-enhance-tooltip" aria-hidden="true">
          博客
        </span>
      </a>
      <span className="motion-enhance-dock-divider" aria-hidden="true" />
      <button
        type="button"
        className="motion-enhance-dock-item"
        onClick={() => scrollToSection("contact-details", reduced)}
        aria-label="联系"
      >
        <DockIcon mouseX={mouseX}>
          <Mail size={17} strokeWidth={1.5} />
        </DockIcon>
        <span className="motion-enhance-tooltip" aria-hidden="true">
          联系
        </span>
      </button>
    </nav>
  );
}
