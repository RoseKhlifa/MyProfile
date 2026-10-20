"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useId, useState } from "react";
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
  const { reduced } = useMotionMode();
  const groupId = useId();
  const filteredProjects = projects.filter(
    (project) => filter === "all" || category(project) === filter
  );
  const gridId = `${groupId}-projects`;

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
              setHovered(null);
              setExpanded(initialExpanded);
              setFilter(value as ProjectFilter);
            }}
          />
        </div>
        <div
          id={gridId}
          className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                hidden={!expanded && index >= 6}
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
        {filteredProjects.length > 6 && (
          <button
            type="button"
            className="cv-project-expand text-xs text-body print:hidden"
            aria-expanded={expanded}
            aria-controls={gridId}
            onClick={() => {
              setHovered(null);
              setExpanded((value) => !value);
            }}
          >
            {expanded
              ? "收起项目"
              : `展开全部项目（共${filteredProjects.length}项）`}
          </button>
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
