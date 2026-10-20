"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Section } from "@/components/ui/section";
import { useMotionMode } from "./enhancements";
import "./build-log.css";

const entries = [
  {
    id: "homepage",
    title: "个人主页",
    date: "2026.10",
    role: "基于 Minimalist CV 二次开发",
    description:
      "保留原版字体、间距和简历布局，添加文字入场、悬停反馈、项目筛选与详情展开。",
    detail:
      "这次直接在 BartoszJarocki/cv 原仓库上开发。英文使用原版 Geist Mono，姓名保留原版 Pixel 字体，中文使用配套的 Noto Sans SC。",
  },
  {
    id: "blog",
    title: "个人博客",
    date: "2026.10",
    role: "astro-whono / 服务器部署",
    description: "完成博客构建与服务器部署，目前可以通过公网地址访问。",
    detail:
      "博客当前使用主题示例文章。接下来补充个人内容，并通过 1Panel 接入 blog.rosekhlifa.com。",
  },
];

export function BuildLog() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const { reduced } = useMotionMode();
  return (
    <Section title="Build log" titleId="build-log">
      <div className="space-y-8 print:space-y-1.5">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="print:break-inside-avoid cv-build-entry"
          >
            <button
              type="button"
              className="cv-build-trigger"
              onMouseEnter={() => setHovered(entry.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(entry.id)}
              onBlur={() => setHovered(null)}
              aria-expanded={open === entry.id}
              aria-controls={`build-${entry.id}`}
              onClick={() => setOpen(open === entry.id ? null : entry.id)}
            >
              {hovered === entry.id && (
                <motion.span
                  className="cv-build-highlight"
                  layoutId={reduced ? undefined : "build-highlight"}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 320, damping: 32 }
                  }
                />
              )}
              <span className="flex items-baseline justify-between gap-x-2">
                <span className="text-sm font-medium leading-snug print:leading-none">
                  {entry.title}
                </span>
                <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
                  {entry.date}
                  {open === entry.id ? <Minus size={12} /> : <Plus size={12} />}
                </span>
              </span>
              <span className="mt-1 block text-sm leading-snug text-body print:text-[12px] print:leading-tight">
                {entry.role}
              </span>
              <span className="mt-1.5 block text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight">
                {entry.description}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === entry.id && (
                <motion.div
                  id={`build-${entry.id}`}
                  className="cv-build-detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                >
                  <p className="pt-3 text-xs text-body">{entry.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        ))}
      </div>
    </Section>
  );
}
