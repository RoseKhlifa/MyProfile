import type { Project } from "@/lib/types";
import starSnapshot from "./github-stars.snapshot.json" with { type: "json" };

export const PROFILE_REPOSITORY = "https://github.com/RoseKhlifa/MyProfile";

function publicRepository(name: keyof typeof starSnapshot) {
  const snapshot = starSnapshot[name];
  return {
    repository: `https://github.com/${name}`,
    stars: snapshot.stars,
    starsUpdatedAt: snapshot.updatedAt,
  };
}

export const PROJECT_CATALOG: Project[] = [
  {
    id: "image-studio",
    title: "Image Studio",
    category: "creative",
    cover: "studio",
    eyebrow: "AI IMAGE WORKSPACE",
    status: "开源",
    description:
      "跨平台 AI 图像工作台。生成、蒙版编辑、参考图与历史复用，在一张画布里完成。",
    techStack: ["Go", "Wails", "React", "TypeScript"],
    link: "https://github.com/RoseKhlifa/Image-Studio/releases",
    linkLabel: "下载客户端",
    ...publicRepository("RoseKhlifa/Image-Studio"),
    details:
      "为图像生成与编辑做的一套跨平台客户端，也是我目前 Stars 最多的公开项目。桌面端由 Go 与 Wails 驱动，前端用 React 和 Konva 组织画布与编辑工作流。",
    highlights: [
      "支持图像生成、参考图编辑、蒙版和标注，复用本地历史记录。",
      "桌面端支持按目录批处理图生图，并有 Android WebView 配套客户端。",
      "对接兼容的图像 API；客户端与历史在本地，生成能力由配置的上游提供。",
    ],
    related: "Image-Prompts 为它提供灵感浏览与提示词导入入口。",
  },
  {
    id: "gptcodex",
    title: "GPTCODEX",
    category: "services",
    cover: "gateway",
    eyebrow: "AI API SERVICE",
    status: "运营中",
    metric: "4000+ 用户",
    description:
      "我运营的 AI API 中转服务，累计 4000+ 用户。控制台、文档和配套服务，从一个入口访问。",
    techStack: ["JavaScript", "Cloudflare Workers", "KV"],
    link: "https://gptcodex.top",
    linkLabel: "访问 GPTCODEX",
    details:
      "面向开发者的 AI API 服务，已经积累 4000+ 用户。这个项目负责品牌导航、服务入口与统计展示，把控制台、文档、小铺等入口放在一起。",
    highlights: [
      "品牌页使用原生 HTML、CSS 与 JavaScript，配套 Cloudflare Worker。",
      "通过 KV 缓存统计数据，并处理数据刷新与回退。",
      "4000+ 为该服务累计用户规模；导航页是整个服务的一个组成部分。",
    ],
    related: "订阅代充、手机号接码和 RKの小铺，是同一套服务中的独立产品。",
  },
  {
    id: "gpt-recharge",
    title: "ChatGPT 订阅代充",
    category: "services",
    cover: "recharge",
    eyebrow: "GPT RECHARGE",
    status: "运营中",
    metric: "商业化 · 多租户",
    description:
      "已经跑通商业化的 ChatGPT 订阅代充平台，面向用户与合作商户提供多租户运营、订单管理和处理状态查询。",
    techStack: ["Python", "Flask", "SQLite", "JavaScript"],
    link: "https://pay.gptcodex.top",
    linkLabel: "前往充值平台",
    details:
      "从 ChatGPT 直充订阅协议脚本发展而来的完整服务，是我投入较多精力的项目之一。现在已形成可实际运营、产生利润的多租户业务。",
    highlights: [
      "订阅套餐、兑换码、订单和管理端串联成完整业务流程。",
      "使用 Python、Flask 与 SQLite，配套持久任务队列及实时处理状态。",
      "账单、收据等后续任务支持异步执行与重试。",
    ],
    related: "可通过 RKの小铺选购相关订阅服务。",
  },
  {
    id: "sms-workbench",
    title: "SMS Workbench",
    category: "services",
    cover: "sms",
    eyebrow: "PHONE VERIFICATION",
    status: "运营中",
    metric: "商业化 · 多租户",
    description:
      "面向 ChatGPT 手机号验证场景的接码平台，提供号码租约、消息查询与多租户运营管理。",
    techStack: ["Go", "React", "TypeScript", "PostgreSQL"],
    link: "https://sms.gptcodex.top",
    linkLabel: "打开接码工作台",
    details:
      "与订阅业务配套的手机号接码平台，目前已经跑通商业化多租户运营。把兑换、号码租约、消息状态和后台管理集中到一个工作台。",
    highlights: [
      "通过兑换码获取或恢复号码租约，查看租期与消息记录。",
      "前端按任务状态轮询，收到有效消息后停止查询并保留历史。",
      "Go 与 PostgreSQL 负责持久化，React 界面配套号码池、健康及审计管理。",
    ],
    related: "与 ChatGPT 订阅代充、RKの小铺配套运营。",
  },
  {
    id: "rk-shop",
    title: "RKの小铺",
    category: "services",
    cover: "shop",
    eyebrow: "AI SERVICES STORE",
    status: "运营中",
    metric: "已产生营收",
    description:
      "订阅代充、手机号接码集中选购，支持自动交付。基于 acg-faka 二次开发，已经产生营收。",
    techStack: ["PHP", "acg-faka"],
    link: "https://buy.gptcodex.top",
    linkLabel: "逛逛 RKの小铺",
    details:
      "把自己正在运营的 AI 服务整理成可直接购买的商品。基于 acg-faka 商城二次开发，目前主要上架订阅代充与手机号接码服务，并提供自动交付。",
    highlights: [
      "订阅代充与手机号接码按商品组织，便于直接选购。",
      "下单与自动交付衔接，已经产生真实营收。",
      "商城为私有二开版本，基础项目使用 PHP 与 acg-faka。",
    ],
    related: "连接 pay.gptcodex.top 与 sms.gptcodex.top 的服务商品。",
  },
  {
    id: "image-prompts",
    title: "Image-Prompts",
    category: "creative",
    cover: "prompts",
    eyebrow: "PROMPT LIBRARY",
    status: "开源",
    description:
      "中英双语图像提示词库，连接灵感浏览、社区投稿与 Image Studio 导入，让好提示词更容易复用。",
    techStack: ["React", "Hono", "Drizzle", "PostgreSQL"],
    link: "https://prompts.sorry.ink/",
    linkLabel: "浏览提示词",
    ...publicRepository("RoseKhlifa/Image-Prompts"),
    details:
      "Image Studio 生态中负责灵感与提示词来源的一侧，也是一座可独立浏览的双语提示词站。围绕分类、标签、来源与社区投稿组织内容。",
    highlights: [
      "提供双语提示词浏览、详情、收藏、点赞及个人页面。",
      "社区投稿与审核流程保留来源信息，方便追溯与复用。",
      "提示词详情可发送到 Image Studio，减少反复复制与切换。",
    ],
    related: "与 Image Studio 配套使用。",
  },
  {
    id: "4icode",
    title: "4i Console",
    category: "services",
    cover: "console",
    eyebrow: "AI SERVICE CONSOLE",
    status: "筹划中",
    description:
      "另一套 AI 中转服务的独立控制台，围绕密钥、用量、钱包与团队管理构建，目前仍在筹划中。",
    techStack: ["Vue", "TypeScript", "Pinia", "ECharts"],
    link: "https://4i.codes",
    linkLabel: "查看 4i",
    details:
      "为另一套 AI 服务搭建的控制台，现阶段以界面、账户和运营能力建设为主。项目使用 Vue 3，配套独立的 Node 与 Hono 辅助服务。",
    highlights: [
      "界面包含密钥、用量、钱包、团队和工单等模块。",
      "Vue、Pinia 与 ECharts 组织状态与数据展示，辅助服务使用 SQLite。",
      "网关能力通过上游 API 接入；服务仍在筹划，不按成熟运营产品介绍。",
    ],
  },
  {
    id: "xxt",
    title: "XXT",
    category: "automation",
    cover: "checkin",
    eyebrow: "CHECK-IN WORKSPACE",
    status: "个人项目",
    description:
      "学习通签到管理平台，整合网页端、任务状态、活动记录和微信消息通知，并提供配套小程序。",
    techStack: ["Go", "Vue", "SQLite", "WebSocket"],
    link: "https://xxt.sorry.ink",
    linkLabel: "打开 XXT",
    details:
      "围绕学习通不同签到场景做的多用户管理项目。Go 后端连接网页端与微信端，集中展示任务、活动与记录状态。",
    highlights: [
      "Vue 网页包含用户侧与管理侧，按账号组织活动和任务。",
      "Go、SQLite 与 WebSocket 提供状态、记录及通知协作。",
      "微信小程序与云托管配合，提供手机侧入口。",
    ],
    related: "XXT-Mini 是对应的原生微信小程序端。",
  },
  {
    id: "xxt-mini",
    title: "XXT-Mini",
    category: "automation",
    cover: "miniapp",
    eyebrow: "WECHAT MINI PROGRAM",
    status: "个人项目",
    description:
      "XXT 的微信小程序端，在手机上查看活动、任务和记录，并接收订阅通知。",
    techStack: ["JavaScript", "WXML", "WXSS", "微信云托管"],
    details:
      "XXT 的原生微信配套项目，主要承载 XXT 相关功能。使用微信原生页面、组件和云托管能力，在手机上提供状态与通知入口。",
    highlights: [
      "使用 JavaScript、WXML 与 WXSS，未套用跨端前端框架。",
      "与 XXT 后端配套，展示任务和活动记录。",
      "集成微信登录、云托管与订阅消息。",
    ],
    accessNote:
      "微信搜索小程序「豆印 - 拼豆图纸转换」。该小程序目前仍以 XXT 配套功能为主。",
    related: "配套网页：xxt.sorry.ink；需要帮助可联系我。",
  },
  {
    id: "wangui",
    title: "晚归签到 · HENAU",
    category: "automation",
    cover: "campus",
    eyebrow: "CAMPUS AUTOMATION",
    status: "个人项目",
    description:
      "为河南农业大学晚归签到场景写的自动化管理项目，包含任务看板、记录查询与消息通知。体验请联系我。",
    techStack: ["Go", "Vue", "SQLite", "SSE"],
    ...publicRepository("RoseKhlifa/wangui-henau"),
    details:
      "针对学校晚归签到流程做的个人项目，整合定时任务、状态更新与记录管理。前端为 Vue，Go 后端负责数据与通知。",
    highlights: [
      "包含用户界面与管理界面，集中查看任务状态和历史记录。",
      "使用 SSE 推送状态，并配套通知、导出和备份功能。",
      "以前后端多阶段 Docker 镜像部署。",
    ],
    accessNote: "体验地址未公开展示，想体验可以联系我。",
  },
  {
    id: "terminal-farm",
    title: "Terminal Farm",
    category: "automation",
    cover: "farm",
    eyebrow: "COMMERCIAL ARCHIVE",
    status: "已停服",
    metric: "曾商业运营",
    description:
      "曾跑通商业化的 QQ 农场代挂项目，整合机器人、多账号与网页终端。后因政策因素停服，现保留源码。",
    techStack: ["Bun", "TypeScript", "React", "Protobuf"],
    link: "https://github.com/RoseKhlifa/Terminal-Farm-Business",
    linkLabel: "查看项目仓库",
    ...publicRepository("RoseKhlifa/Terminal-Farm-Business"),
    details:
      "早期完成过商业化的 QQ 农场代挂项目。后来因政策影响关站，并将代码公开，保留这次从自动化工具做到实际运营的经历。",
    highlights: [
      "机器人与多账号能力配合网页终端，构成一套运营工具。",
      "Bun 与 TypeScript 组织业务，React 与 WebSocket 提供管理界面。",
      "包含 Protobuf 通信与扫码配套；原服务现已停止运营。",
    ],
  },
  {
    id: "lab-safety",
    title: "实验室准入考试自动化",
    category: "experiments",
    cover: "exam",
    eyebrow: "BROWSER AUTOMATION",
    status: "实验项目",
    description:
      "用 Python、Playwright 与 DeepSeek 编写的浏览器自动化实验，处理实验室安全准入考试的页面与作答流程。",
    techStack: ["Python", "Playwright", "DeepSeek"],
    link: "https://github.com/RoseKhlifa/LabSafetyExamCheat",
    linkLabel: "查看项目仓库",
    ...publicRepository("RoseKhlifa/LabSafetyExamCheat"),
    details:
      "为学校实验室安全准入考试编写的自动化程序，结合浏览器页面信息与模型处理。作为个人实验保留代码与工程记录。",
    highlights: [
      "使用 Playwright 处理浏览器页面。",
      "通过 OpenAI Python SDK 连接 DeepSeek，组织文本处理流程。",
      "包含日志与结构化文本处理，未提供独立在线应用。",
    ],
  },
  {
    id: "fps-demo",
    title: "AssaultCube Hack Demo",
    category: "experiments",
    cover: "fps",
    eyebrow: "C++ EXTERNAL DEMO",
    status: "实验项目",
    description:
      "面向 AssaultCube 的 C++ 外部外挂 Demo，包含透视、自瞄、雷达与 ImGui 面板，保留公开视频演示。",
    techStack: ["C++", "Windows API", "ImGui"],
    link: "https://www.bilibili.com/video/BV1QGUGBkEh3/",
    linkLabel: "观看 Bilibili 演示",
    ...publicRepository("RoseKhlifa/FPShackDemo-External"),
    details:
      "早期 C++ 与 Windows 方向的个人 Demo，实验外部数据读取、可视化叠加与交互面板。演示对象为 AssaultCube，已有 Bilibili 视频展示。",
    highlights: [
      "包含 ESP、雷达、方向预警与自瞄等实验模块。",
      "使用 Windows API 与 ImGui 组织界面和可视化层。",
      "保留源码与演示视频，按历史实验项目展示。",
    ],
  },
  {
    id: "51aw-spider",
    title: "51awSpider",
    category: "experiments",
    cover: "spider",
    eyebrow: "CRAWLER EXPERIMENT",
    status: "实验项目",
    description:
      "一个随手写的 Python 文本爬虫，按关键词分页提取标题、链接和摘要，并过滤图片与引用内容。",
    techStack: ["Python", "BeautifulSoup", "lxml"],
    link: "https://github.com/RoseKhlifa/51awSpider",
    linkLabel: "查看项目仓库",
    ...publicRepository("RoseKhlifa/51awSpider"),
    details:
      "用于网页结构解析和正文清洗的娱乐项目。单文件实现搜索结果遍历、文章提取与终端输出，重点在文本处理。",
    highlights: [
      "使用 requests、BeautifulSoup 与 lxml 解析网页。",
      "支持关键词、分页与抓取数量上限。",
      "过滤引用、图片和空段落，将整理后的内容输出到终端。",
    ],
  },
  {
    id: "myblog",
    title: "个人博客",
    category: "personal",
    previewKind: "journal",
    eyebrow: "PERSONAL JOURNAL",
    status: "个人项目",
    description:
      "基于 astro-whono 二次开发的个人博客，加入在线写作、自动发布与备份回滚，用来记录开发过程和技术笔记。",
    techStack: ["Astro", "TypeScript", "Svelte", "Docker"],
    link: "https://blog.rosekhlifa.com",
    linkLabel: "阅读博客",
    ...publicRepository("RoseKhlifa/MyBlog"),
    details:
      "个人博客从 astro-whono 开始二次开发，保留内容站的阅读体验，并补充自己的写作与发布流程。",
    highlights: [
      "Astro 内容站与 Svelte 组件配合，使用 CodeMirror 编辑器。",
      "增加在线写作与发布辅助功能。",
      "配套 Docker/Nginx 部署、备份及回滚流程。",
    ],
  },
  {
    id: "homepage",
    title: "MyProfile",
    category: "personal",
    previewKind: "homepage",
    eyebrow: "PERSONAL HOMEPAGE",
    status: "开源",
    description:
      "基于 Minimalist CV 二次开发，保留原版排版，加入动态项目封面、GitHub 热力图和访问统计。",
    techStack: ["Next.js", "TypeScript", "Motion", "SQLite"],
    link: PROFILE_REPOSITORY,
    linkLabel: "查看源码 / Fork",
    ...publicRepository("RoseKhlifa/MyProfile"),
    details:
      "当前看到的个人主页，现已作为 MyProfile 开源。沿用 Minimalist CV 的字体、留白与简历式布局，加入项目筛选、独立封面和动态交互，欢迎 Star 或 Fork。",
    highlights: [
      "统一展示正在运营的服务、开源项目与个人实验。",
      "GitHub 贡献热力图和公开仓库 Stars 使用真实数据。",
      "访问计数持久保存，并兼顾手机、键盘操作和打印。",
    ],
    accessNote: "你正在浏览这个项目。",
  },
];
