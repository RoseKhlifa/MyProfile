import type { ResumeData } from "@/lib/types";
import { PROJECT_CATALOG } from "./projects";
import avatar from "./user-avatar.jpg";

export const BLOG_URL = "https://blog.rosekhlifa.com";
export const CONTACT_DETAILS = {
  email: "rosekhlifa@gmail.com",
  wechat: "R0sEkHL1fA",
  qq: "2221542777",
  x: { handle: "@RoseKhlifa888", url: "https://x.com/RoseKhlifa888" },
  github: {
    handle: "github.com/RoseKhlifa",
    url: "https://github.com/RoseKhlifa",
  },
  note: "添加联系方式时，请注明来意。",
};
export const PROFILE_ROLES = [
  "独立开发者",
  "VibeCoding成瘾者",
  "AI技术服务从业者",
];

export const PROFILE_EDUCATION = {
  school: "河南农业大学",
  major: "软件工程",
  classOf: "2029",
};

export const RESUME_DATA: ResumeData = {
  name: "RoseKhlifa",
  location: "",
  locationLink: "",
  about: PROFILE_ROLES.join("、"),
  summary: `${PROFILE_EDUCATION.school}${PROFILE_EDUCATION.major}专业学生 ${PROFILE_EDUCATION.classOf}届`,
  avatar,
  siteUrl: "https://rosekhlifa.com",
  contact: {
    email: CONTACT_DETAILS.email,
    tel: "",
    social: [
      { name: "GitHub", url: CONTACT_DETAILS.github.url, icon: "github" },
      { name: "X", url: CONTACT_DETAILS.x.url, icon: "x" },
    ],
  },
  education: [],
  work: [],
  skills: [],
  projects: PROJECT_CATALOG,
};

export const SECTION_TITLES = {
  summary: "About",
  work: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
} satisfies Partial<Record<keyof ResumeData, string>>;
