"use client";

import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
} from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatedTabs,
  NumberTicker,
  useMotionMode,
} from "@/components/motion/enhancements";
import { ProjectCard, ProjectDetails } from "@/components/motion/project-card";
import { SECTION_TITLES } from "@/data/resume-data";
import type { Project } from "@/lib/types";
import "./projects.css";

type ProjectFilter = "all" | NonNullable<Project["category"]>;
const FILTERS = [
  { value: "all", label: "全部" },
  { value: "services", label: "在线服务" },
  { value: "creative", label: "AI 创作" },
  { value: "automation", label: "自动化" },
  { value: "experiments", label: "实验项目" },
  { value: "personal", label: "个人站点" },
] as const;

function category(project: Project) {
  if (project.category) return project.category;
  if (project.previewKind === "tool") return "automation";
  return "personal";
}

interface ProjectsProps {
  projects: Project[];
  initialExpanded?: boolean;
}

export function Projects({ projects, initialExpanded = false }: ProjectsProps) {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [expanded, setExpanded] = useState(initialExpanded);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [measured, setMeasured] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [returning, setReturning] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const cancelReturn = useRef<(() => void) | null>(null);
  const gridHeight = useMotionValue(0);
  const { reduced } = useMotionMode();
  const groupId = useId();
  const filteredProjects = projects.filter(
    (project) => filter === "all" || category(project) === filter
  );
  const gridId = `${groupId}-projects`;

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    let previous = grid.offsetHeight;
    let animation: ReturnType<typeof animate> | undefined;
    gridHeight.set(previous);
    setMeasured(true);
    setResizing(false);
    const observer = new ResizeObserver(() => {
      const next = grid.offsetHeight;
      if (next === previous) return;
      previous = next;
      animation?.stop();
      if (reduced) {
        gridHeight.set(next);
        setResizing(false);
        return;
      }
      setResizing(true);
      const current = animate(gridHeight, next, {
        duration: 0.44,
        ease: [0.22, 1, 0.36, 1],
      });
      animation = current;
      void current.then(() => {
        if (animation === current) setResizing(false);
      });
    });
    observer.observe(grid);
    return () => {
      observer.disconnect();
      animation?.stop();
    };
  }, [gridHeight, reduced]);

  useEffect(() => () => cancelReturn.current?.(), []);

  function toggleExpanded() {
    if (returning) return;
    if (!expanded) {
      setHovered(null);
      setExpanded(true);
      return;
    }
    const grid = gridRef.current;
    const retained = grid?.children[5];
    const finish = () => {
      cancelReturn.current?.();
      cancelReturn.current = null;
      setReturning(false);
      setHovered(null);
      setExpanded(false);
      expandRef.current?.focus({ preventScroll: true });
    };
    if (!grid || !retained || reduced) {
      finish();
      return;
    }
    const target = Math.max(
      0,
      grid.getBoundingClientRect().top + window.scrollY - 24,
      retained.getBoundingClientRect().bottom +
        window.scrollY -
        window.innerHeight +
        160
    );
    if (window.scrollY <= target + 80) {
      finish();
      return;
    }
    setReturning(true);
    // Return to the retained cards before shortening the page beneath the viewport.
    const timeout = window.setTimeout(finish, 1000);
    window.addEventListener("scrollend", finish, { once: true });
    cancelReturn.current = () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scrollend", finish);
    };
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <LayoutGroup id={groupId}>
      <section className="relative flex min-h-0 flex-col gap-y-3 print:gap-y-1 scroll-mb-16">
        <h2
          className="text-sm lowercase leading-[1.4] text-muted-foreground print:leading-tight"
          id="side-projects"
        >
          {SECTION_TITLES.projects}
        </h2>
        <div className="cv-project-filter-row print:hidden">
          <span
            className="text-xs text-muted-foreground cv-project-count"
            aria-live="polite"
          >
            <NumberTicker value={filteredProjects.length} />
            <span> 个项目</span>
          </span>
          <AnimatedTabs
            value={filter}
            options={FILTERS}
            onChange={(value) => {
              cancelReturn.current?.();
              cancelReturn.current = null;
              setReturning(false);
              setHovered(null);
              setExpanded(initialExpanded);
              setFilter(value as ProjectFilter);
            }}
          />
        </div>
        <motion.div
          className="cv-project-grid-frame"
          style={{
            height: measured ? gridHeight : "auto",
            overflow: resizing ? "clip" : "visible",
          }}
        >
          <div
            ref={gridRef}
            id={gridId}
            className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.title}
                  project={project}
                  hidden={!expanded && index >= 6}
                  revealOrder={index >= 6 ? index - 6 : undefined}
                  selected={selected?.title === project.title}
                  dimmed={hovered !== null && hovered !== project.title}
                  onHover={setHovered}
                  onOpen={() => {
                    setHovered(null);
                    setSelected(project);
                  }}
                />
              ))}
            </AnimatePresence>
            {filteredProjects.length === 0 && (
              <p className="text-xs text-body" aria-live="polite">
                暂无此类项目。
              </p>
            )}
          </div>
        </motion.div>
        {filteredProjects.length > 6 && (
          <motion.button
            ref={expandRef}
            type="button"
            className="cv-project-expand text-xs text-body print:hidden"
            aria-expanded={expanded}
            aria-controls={gridId}
            aria-disabled={returning}
            onClick={toggleExpanded}
            whileHover={reduced ? undefined : { y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={expanded ? "collapse" : "expand"}
                initial={{ opacity: 0, y: reduced ? 0 : 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -3 }}
                transition={{ duration: reduced ? 0 : 0.14 }}
              >
                {expanded
                  ? "收起项目"
                  : `展开全部项目（共${filteredProjects.length}项）`}
              </motion.span>
            </AnimatePresence>
            <motion.span
              className="cv-project-expand-icon"
              aria-hidden="true"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{
                duration: reduced ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ChevronDown size={13} strokeWidth={1.5} />
            </motion.span>
          </motion.button>
        )}
      </section>
      <AnimatePresence>
        {selected && (
          <ProjectDetails
            key={selected.title}
            project={selected}
            reduced={reduced}
            onDismiss={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
