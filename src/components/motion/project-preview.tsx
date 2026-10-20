"use client";

import {
  ArrowUpRight,
  Braces,
  FileText,
  LayoutGrid,
  List,
  Minus,
  SlidersHorizontal,
} from "lucide-react";
import { useInView } from "motion/react";
import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { useMotionMode } from "@/components/motion/enhancements";
import { PortfolioCover } from "@/components/motion/portfolio-cover";
import type { Project } from "@/lib/types";
import "./project-preview.css";

export function projectKind(project: Project): "homepage" | "journal" | "tool" {
  return (
    project.previewKind ??
    (/blog|astro-whono|博客|writing/i.test(
      `${project.title} ${project.techStack.join(" ")}`
    )
      ? "journal"
      : "homepage")
  );
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function documentVisible() {
  return !document.hidden;
}

interface ProjectPreviewProps {
  project: Project;
  expanded?: boolean;
}

export function ProjectPreview({
  project,
  expanded = false,
}: ProjectPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const visible = useSyncExternalStore(
    subscribeVisibility,
    documentVisible,
    () => false
  );
  const { reduced, mode } = useMotionMode();
  const kind = projectKind(project);
  const running = inView && visible && !reduced && mode === "full";

  if (project.cover) {
    return (
      <div
        ref={ref}
        className={`cv-preview cv-preview-custom${expanded ? " is-expanded" : ""}`}
        data-running={running ? "true" : "false"}
        data-reduced={reduced ? "true" : "false"}
        aria-hidden="true"
      >
        <PortfolioCover project={project} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`cv-preview cv-preview-${kind}${expanded ? " is-expanded" : ""}`}
      data-running={running ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="cv-preview-browser">
        <span className="cv-preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="cv-preview-address">
          {project.demo || kind === "tool"
            ? `${project.title} / ${project.techStack[0] ?? kind}`
            : kind === "homepage"
              ? "rosekhlifa.com"
              : "journal / RoseKhlifa"}
        </span>
        <ArrowUpRight size={9} strokeWidth={1.25} />
      </div>
      {kind === "homepage" ? (
        <HomepagePreview project={project} />
      ) : kind === "journal" ? (
        <JournalPreview project={project} />
      ) : (
        <ToolPreview project={project} />
      )}
      <span className="cv-preview-scan" />
      <div className="cv-preview-bottom">
        <span className="cv-preview-live-dot" />
        <span>
          {project.demo
            ? project.techStack.slice(0, 2).join(" · ")
            : kind === "homepage"
              ? "PERSONAL HOMEPAGE"
              : kind === "journal"
                ? "PERSONAL JOURNAL"
                : "WORKSPACE"}
        </span>
        {kind === "homepage" ? (
          <Braces size={9} strokeWidth={1.3} />
        ) : kind === "journal" ? (
          <FileText size={9} strokeWidth={1.3} />
        ) : (
          <SlidersHorizontal size={9} strokeWidth={1.3} />
        )}
      </div>
    </div>
  );
}

function HomepagePreview({ project }: { project: Project }) {
  return (
    <div className="cv-preview-stage">
      <div className="cv-mini-home">
        <div className="cv-mini-home-header">
          <div>
            <span className="cv-mini-name">
              {project.demo ? project.title : "RoseKhlifa"}
            </span>
            <span className="cv-mini-role">
              {project.demo
                ? project.techStack.slice(0, 2).join(" · ")
                : "Independent developer."}
            </span>
            <span className="cv-mini-muted">
              {project.demo ? "WEB PROJECT / PREVIEW" : "个人项目与开发记录"}
            </span>
          </div>
          {project.demo ? (
            <span className="cv-mini-demo-avatar">
              <LayoutGrid size={12} strokeWidth={1} />
            </span>
          ) : (
            <Image
              src="/avatar.jpg"
              alt=""
              width={36}
              height={36}
              className="cv-mini-avatar"
              unoptimized={true}
            />
          )}
        </div>
        <div className="cv-mini-section">
          <span className="cv-mini-label">about</span>
          <div className="cv-mini-lines">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="cv-mini-section cv-mini-project-section">
          <span className="cv-mini-label">side projects</span>
          <div className="cv-mini-projects">
            <div className="cv-mini-project">
              <span>
                {project.demo ? project.title : "个人主页"}{" "}
                <ArrowUpRight size={6} />
              </span>
              <div className="cv-mini-lines">
                <i />
                <i />
              </div>
              <span className="cv-mini-tags">
                {project.demo ? project.techStack[0] : "Next.js · TypeScript"}
              </span>
            </div>
            <div className="cv-mini-project">
              <span>
                {project.demo ? "界面与交互" : "个人博客"}{" "}
                <ArrowUpRight size={6} />
              </span>
              <div className="cv-mini-lines">
                <i />
                <i />
              </div>
              <span className="cv-mini-tags">
                {project.demo
                  ? project.techStack.slice(1, 3).join(" · ")
                  : "Astro · astro-whono"}
              </span>
            </div>
          </div>
        </div>
        <div className="cv-mini-dock">
          <Minus size={7} />
          <Braces size={7} />
          <FileText size={7} />
        </div>
      </div>
      <span className="cv-preview-orbit cv-preview-orbit-one" />
      <span className="cv-preview-orbit cv-preview-orbit-two" />
    </div>
  );
}

function JournalPreview({ project }: { project: Project }) {
  return (
    <div className="cv-preview-stage">
      <div className="cv-mini-journal">
        <div className="cv-mini-journal-header">
          <span>
            {project.demo ? project.title : "RoseKhlifa"}
            <span className="cv-mini-journal-mark"> / </span>Journal
          </span>
          <span className="cv-mini-journal-nav">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="cv-mini-journal-content">
          <div className="cv-mini-journal-intro">
            <span className="cv-mini-journal-kicker">PERSONAL NOTES</span>
            <span className="cv-mini-journal-title">
              {project.demo ? project.title : "个人博客"}
            </span>
            <span className="cv-mini-journal-subtitle">
              {project.demo
                ? project.techStack.slice(0, 2).join(" · ")
                : "开发过程与技术笔记"}
            </span>
          </div>
          <div className="cv-mini-journal-rule">
            <i />
          </div>
          <div className="cv-mini-journal-list">
            <div className="cv-mini-journal-entry">
              <FileText size={8} />
              <div className="cv-mini-lines">
                <i />
                <i />
              </div>
              <ArrowUpRight size={7} />
            </div>
            <div className="cv-mini-journal-entry">
              <FileText size={8} />
              <div className="cv-mini-lines">
                <i />
                <i />
              </div>
              <ArrowUpRight size={7} />
            </div>
            <div className="cv-mini-journal-entry">
              <FileText size={8} />
              <div className="cv-mini-lines">
                <i />
                <i />
              </div>
              <ArrowUpRight size={7} />
            </div>
          </div>
        </div>
        <div className="cv-mini-journal-footer">
          <span>{project.demo ? project.techStack[0] : "astro-whono"}</span>
          <span>{project.demo ? "WRITING PREVIEW" : "内容整理中"}</span>
        </div>
      </div>
      <span className="cv-preview-orbit cv-preview-orbit-one" />
      <span className="cv-preview-orbit cv-preview-orbit-two" />
    </div>
  );
}

function ToolPreview({ project }: { project: Project }) {
  const grid =
    Array.from(project.title).reduce(
      (sum, character) => sum + (character.codePointAt(0) ?? 0),
      0
    ) %
      2 ===
    0;
  return (
    <div className="cv-preview-stage">
      <div className="cv-mini-tool">
        <div className="cv-mini-tool-sidebar">
          <span className="cv-mini-tool-brand">
            <Braces size={10} strokeWidth={1.2} />
          </span>
          <LayoutGrid size={8} strokeWidth={1.1} />
          <List size={8} strokeWidth={1.1} />
          <FileText size={8} strokeWidth={1.1} />
          <SlidersHorizontal size={8} strokeWidth={1.1} />
        </div>
        <div className="cv-mini-tool-workspace">
          <div className="cv-mini-tool-toolbar">
            <span>{project.title}</span>
            <span>{grid ? <LayoutGrid size={7} /> : <List size={7} />}</span>
          </div>
          <span className="cv-mini-tool-kicker">
            {project.techStack.slice(0, 2).join(" · ")}
          </span>
          <div className="cv-mini-tool-input">
            <span />
            <SlidersHorizontal size={7} strokeWidth={1.2} />
          </div>
          <div
            className={`cv-mini-tool-content ${grid ? "cv-mini-tool-grid" : "cv-mini-tool-list"}`}
          >
            {["draft", "workspace", "canvas", "output"].map((item) => (
              <div key={item} className="cv-mini-tool-card">
                <span className="cv-mini-tool-card-icon">
                  <Braces size={8} strokeWidth={1} />
                </span>
                <div className="cv-mini-lines">
                  <i />
                  <i />
                </div>
                <span className="cv-mini-tool-card-status" />
              </div>
            ))}
          </div>
          <div className="cv-mini-tool-progress">
            <i />
          </div>
          <div className="cv-mini-tool-footer">
            <span>WORKSPACE</span>
            <span>{grid ? "GRID VIEW" : "LIST VIEW"}</span>
          </div>
        </div>
      </div>
      <span className="cv-preview-orbit cv-preview-orbit-one" />
      <span className="cv-preview-orbit cv-preview-orbit-two" />
    </div>
  );
}
