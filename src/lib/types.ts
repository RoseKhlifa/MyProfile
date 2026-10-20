import type { StaticImageData } from "next/image";

export type SocialIcon = "github" | "linkedin" | "x";

export interface SocialLink {
  name: string;
  url: string;
  icon: SocialIcon;
}

export interface WorkEntry {
  company: string;
  link: string;
  badges: string[];
  title: string;
  start: string;
  end: string | null;
  description: string;
  highlights?: string[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  start: string;
  end: string | null;
}

export interface Project {
  id?: string;
  category?:
    | "services"
    | "creative"
    | "automation"
    | "experiments"
    | "personal";
  demo?: boolean;
  previewKind?: "homepage" | "journal" | "tool";
  cover?:
    | "studio"
    | "prompts"
    | "gateway"
    | "recharge"
    | "sms"
    | "shop"
    | "console"
    | "farm"
    | "campus"
    | "checkin"
    | "miniapp"
    | "exam"
    | "fps"
    | "spider";
  title: string;
  eyebrow?: string;
  techStack: string[];
  description: string;
  link?: string;
  linkLabel?: string;
  status?: "运营中" | "开源" | "筹划中" | "已停服" | "实验项目" | "个人项目";
  metric?: string;
  details?: string;
  highlights?: string[];
  accessNote?: string;
  repository?: string;
  stars?: number;
  starsUpdatedAt?: string;
  related?: string;
}

export interface ResumeData {
  name: string;
  location: string;
  locationLink: string;
  about: string;
  summary: string;
  avatar: StaticImageData;
  siteUrl: string;
  personalWebsiteUrl?: string;
  contact: {
    email: string;
    tel: string;
    social: SocialLink[];
  };
  education: EducationEntry[];
  work: WorkEntry[];
  skills: string[];
  projects: Project[];
}
