"use client";

import { ArrowUpRight, Github, MessageCircle, Star, X } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  type PointerEvent,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { useMotionMode } from "@/components/motion/enhancements";
import { ProjectPreview } from "@/components/motion/project-preview";
import { ExternalArrow } from "@/components/ui/external-arrow";
import { TagList } from "@/components/ui/tag-list";
import type { Project } from "@/lib/types";
import "./project-card.css";

const finePointerQuery = "(hover: hover) and (pointer: fine)";

function subscribePointer(callback: () => void) {
  const query = window.matchMedia(finePointerQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function finePointer() {
  return window.matchMedia(finePointerQuery).matches;
}

function withoutProtocol(link: string) {
  return link.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function sharedId(project: Project, part: string) {
  return `project-${encodeURIComponent(project.id ?? project.title)}-${part}`;
}

function starsDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "最近";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(date)
    .replaceAll("-", ".");
}

function ProjectStars({ project }: { project: Project }) {
  if (!project.repository || typeof project.stars !== "number") return null;

  return (
    <span
      className="cv-project-stars"
      title={
        project.starsUpdatedAt
          ? `GitHub Stars · ${starsDate(project.starsUpdatedAt)} 更新`
          : "GitHub Stars"
      }
    >
      <Star size={11} strokeWidth={1.5} aria-hidden="true" />
      <span className="sr-only">GitHub Stars：</span>
      <span>{project.stars.toLocaleString("en-US")}</span>
    </span>
  );
}

function focusContact(reduced: boolean) {
  const contact = document.getElementById("contact-details");
  if (!contact) return;
  const previousTabIndex = contact.getAttribute("tabindex");
  contact.setAttribute("tabindex", "-1");
  contact.scrollIntoView({
    behavior: reduced ? "instant" : "smooth",
    block: "start",
  });
  contact.focus({ preventScroll: true });
  contact.addEventListener(
    "blur",
    () => {
      if (previousTabIndex === null) contact.removeAttribute("tabindex");
      else contact.setAttribute("tabindex", previousTabIndex);
    },
    { once: true }
  );
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}#contact-details`
  );
}

interface ProjectCardProps {
  ref?: Ref<HTMLElement>;
  project: Project;
  selected?: boolean;
  hidden?: boolean;
  dimmed: boolean;
  onHover: (title: string | null) => void;
  onOpen: () => void;
}

export function ProjectCard({
  ref,
  project,
  selected = false,
  hidden = false,
  dimmed,
  onHover,
  onOpen,
}: ProjectCardProps) {
  const { reduced } = useMotionMode();
  const fine = useSyncExternalStore(subscribePointer, finePointer, () => false);
  const interactive = fine && !reduced;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glow = useMotionValue(0);
  const tiltX = useSpring(rotateX, { stiffness: 210, damping: 28 });
  const tiltY = useSpring(rotateY, { stiffness: 210, damping: 28 });
  const glowOpacity = useSpring(glow, { stiffness: 200, damping: 30 });
  const background = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, oklch(var(--ink) / 0.075), transparent 75%)`;
  const transition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 310, damping: 32, mass: 0.75 };

  useEffect(() => {
    if (!interactive) {
      rotateX.set(0);
      rotateY.set(0);
      glow.set(0);
    }
  }, [interactive, rotateX, rotateY, glow]);

  function leave() {
    rotateX.set(0);
    rotateY.set(0);
    glow.set(0);
    onHover(null);
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (!interactive || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    x.set(localX);
    y.set(localY);
    rotateX.set((0.5 - localY / bounds.height) * 2.4);
    rotateY.set((localX / bounds.width - 0.5) * 2.4);
    glow.set(1);
  }

  return (
    <motion.article
      ref={ref}
      hidden={hidden}
      layout={reduced ? false : "position"}
      className="print:break-inside-avoid cv-project-item"
      data-selected={selected ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      initial={{ opacity: 0, y: reduced ? 0 : 5 }}
      animate={{ opacity: interactive && dimmed ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
      transition={transition}
      onPointerEnter={() => {
        if (interactive) onHover(project.title);
      }}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
      style={{
        rotateX: interactive ? tiltX : 0,
        rotateY: interactive ? tiltY : 0,
        transformPerspective: 900,
      }}
    >
      <motion.span
        className="cv-project-glow"
        style={{ background, opacity: interactive ? glowOpacity : 0 }}
        aria-hidden="true"
      />
      <motion.div
        className="cv-project-preview-shell"
        layoutId={reduced ? undefined : sharedId(project, "preview")}
      >
        <button
          type="button"
          className="cv-project-preview-button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`查看 ${project.title} 项目详情`}
        >
          <ProjectPreview project={project} />
          <span className="cv-project-preview-open" aria-hidden="true">
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </span>
        </button>
      </motion.div>
      <h3 className="text-sm font-medium leading-snug print:leading-none">
        <button
          type="button"
          className="cv-project-title hover:underline"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`查看 ${project.title} 项目详情`}
        >
          <motion.span
            layoutId={reduced ? undefined : sharedId(project, "title")}
          >
            {project.title}
          </motion.span>
        </button>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`访问 ${project.title}（新标签页）`}
          >
            <ExternalArrow />
          </a>
        )}
        {project.demo && <span className="cv-project-demo-label">示例</span>}
      </h3>
      {project.link && (
        <a
          className="hidden underline print:block print:break-words print:text-[10px] print:leading-tight"
          href={project.link}
        >
          {withoutProtocol(project.link)}
        </a>
      )}
      <motion.p
        layoutId={reduced ? undefined : sharedId(project, "description")}
        className="mt-1 text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight"
      >
        {project.description}
      </motion.p>
      <TagList
        tags={project.techStack}
        label="Technologies used"
        className="mt-2 print:mt-0.5"
      />
      {(project.status ||
        project.metric ||
        (project.repository && typeof project.stars === "number")) && (
        <div className="cv-project-meta">
          {project.status && (
            <span className="cv-project-meta-status">
              <span className="cv-project-status-dot" />
              {project.status}
            </span>
          )}
          {project.metric && <span>{project.metric}</span>}
          <ProjectStars project={project} />
        </div>
      )}
    </motion.article>
  );
}

interface ProjectDetailsProps {
  project: Project;
  reduced: boolean;
  onDismiss: () => void;
}

export function ProjectDetails({
  project,
  reduced,
  onDismiss,
}: ProjectDetailsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contactRequested = useRef<boolean | null>(null);
  const titleId = `${sharedId(project, "dialog")}-title`;
  const repositoryLink =
    project.repository && project.repository !== project.link
      ? project.repository
      : undefined;
  const publicLink = !project.demo ? project.link : undefined;
  const showContact =
    !project.link && Boolean(project.accessNote) && project.id !== "homepage";
  const detailText = project.demo
    ? "布局示例，用于预览项目数量增加时的展示效果。"
    : (project.details ?? project.description);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (contactRequested.current !== null) {
        const reduceMotion = contactRequested.current;
        window.requestAnimationFrame(() => focusContact(reduceMotion));
        return;
      }
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="cv-project-dialog font-mono"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onDismiss();
        }
      }}
    >
      <motion.div
        className="cv-project-details"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : 5 }}
        transition={{ duration: reduced ? 0 : 0.22 }}
      >
        <button
          className="cv-project-close"
          type="button"
          aria-label="关闭项目详情"
          onClick={onDismiss}
        >
          <X size={15} strokeWidth={1.5} />
        </button>
        <motion.div
          className="cv-project-detail-preview"
          layoutId={reduced ? undefined : sharedId(project, "preview")}
        >
          <ProjectPreview project={project} expanded={true} />
        </motion.div>
        <h3
          id={titleId}
          className="text-sm font-medium leading-snug print:leading-none"
        >
          <motion.span
            layoutId={reduced ? undefined : sharedId(project, "title")}
          >
            {project.title}
          </motion.span>
          {project.demo && <span className="cv-project-demo-label">示例</span>}
        </h3>
        {project.eyebrow && (
          <p className="cv-project-eyebrow">{project.eyebrow}</p>
        )}
        <motion.p
          layoutId={reduced ? undefined : sharedId(project, "description")}
          className="mt-1 text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight"
        >
          {project.description}
        </motion.p>
        <TagList
          tags={project.techStack}
          label="Technologies used"
          className="mt-2 print:mt-0.5"
        />
        <div className="cv-project-detail-info text-xs text-body">
          <p className="cv-project-detail-copy">{detailText}</p>
          {!project.demo &&
            project.highlights &&
            project.highlights.length > 0 && (
              <ul className="cv-project-highlights">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          <dl>
            {(project.demo || project.status) && (
              <div>
                <dt>状态</dt>
                <dd>
                  <span className="cv-project-status-dot" />
                  {project.demo ? "布局示例" : project.status}
                </dd>
              </div>
            )}
            {!project.demo && project.metric && (
              <div>
                <dt>进展</dt>
                <dd>{project.metric}</dd>
              </div>
            )}
            {!project.demo &&
              project.repository &&
              typeof project.stars === "number" && (
                <div>
                  <dt>GitHub</dt>
                  <dd>
                    <ProjectStars project={project} />
                    {project.starsUpdatedAt && (
                      <span className="cv-project-stars-date">
                        {starsDate(project.starsUpdatedAt)} 同步
                      </span>
                    )}
                  </dd>
                </div>
              )}
            {!project.demo && project.related && (
              <div>
                <dt>关联</dt>
                <dd>{project.related}</dd>
              </div>
            )}
            {!project.demo && project.accessNote && (
              <div>
                <dt>体验</dt>
                <dd>{project.accessNote}</dd>
              </div>
            )}
            {!project.demo && publicLink && (
              <div>
                <dt>入口</dt>
                <dd>{withoutProtocol(publicLink)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="cv-project-actions">
          {publicLink && (
            <a
              className="cv-project-visit text-xs text-body hover:underline"
              href={publicLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.linkLabel ??
                (publicLink === project.repository
                  ? "查看源码"
                  : "访问项目")}{" "}
              <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">（新标签页）</span>
            </a>
          )}
          {!project.demo && repositoryLink && (
            <a
              className="cv-project-visit text-xs text-body hover:underline"
              href={repositoryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={12} strokeWidth={1.5} aria-hidden="true" />
              查看源码{" "}
              <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">（新标签页）</span>
            </a>
          )}
          {!project.demo && showContact && (
            // biome-ignore lint/a11y/useValidAnchor: This link navigates to a real section after closing its modal.
            <a
              className="cv-project-visit text-xs text-body hover:underline"
              href="#contact-details"
              onClick={() => {
                contactRequested.current = reduced;
                dialogRef.current?.close();
                onDismiss();
              }}
            >
              <MessageCircle size={12} strokeWidth={1.5} aria-hidden="true" />
              联系作者{" "}
              <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
            </a>
          )}
          {(project.demo || project.id === "homepage") && (
            <button
              type="button"
              className="cv-project-return text-xs text-body hover:underline"
              onClick={onDismiss}
            >
              {project.id === "homepage" ? "返回当前主页" : "返回项目列表"}{" "}
              <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
        </div>
      </motion.div>
    </dialog>
  );
}
