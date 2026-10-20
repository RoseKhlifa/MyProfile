import type { Project } from "@/lib/types";
import { RESUME_DATA } from "./resume-data";

export const PROJECT_DEMO: Project[] = [
  ...RESUME_DATA.projects.filter(
    (project) => project.id === "homepage" || project.id === "myblog"
  ),
  {
    title: "网页项目 A",
    description: "网页作品的布局示例，用于观察多项目时的信息密度与预览效果。",
    techStack: ["Next.js", "TypeScript"],
    demo: true,
    previewKind: "homepage",
  },
  {
    title: "工具项目 A",
    description: "列表式工具界面示例，用于观察不同作品封面的排列节奏。",
    techStack: ["React", "TypeScript"],
    demo: true,
    previewKind: "tool",
  },
  {
    title: "写作项目 A",
    description: "文章归档类布局示例，展示较长说明与技术标签的换行。",
    techStack: ["Astro", "MDX"],
    demo: true,
    previewKind: "journal",
  },
  {
    title: "工具项目 B",
    description: "网格式工具界面示例，与文字和写作类封面形成区分。",
    techStack: ["React", "CSS"],
    demo: true,
    previewKind: "tool",
  },
  {
    title: "网页项目 B",
    description: "另一项网页布局示例，继续沿用相同的字体、间距和交互。",
    techStack: ["Next.js", "Tailwind CSS"],
    demo: true,
    previewKind: "homepage",
  },
  {
    title: "写作项目 B",
    description: "第二个写作类布局示例；正式内容仍只保留真实项目。",
    techStack: ["Astro", "Markdown"],
    demo: true,
    previewKind: "journal",
  },
];
