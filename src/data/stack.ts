export const STACK_GROUPS = [
  {
    id: "interface",
    title: "前端与交互",
    items: [
      { name: "React", url: "https://react.dev/learn" },
      { name: "Vue", url: "https://vuejs.org/guide/introduction.html" },
      { name: "TypeScript", url: "https://www.typescriptlang.org/docs/" },
      { name: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
      { name: "Next.js", url: "https://nextjs.org/docs" },
      { name: "Motion", url: "https://motion.dev/docs/react" },
    ],
  },
  {
    id: "backend",
    title: "后端与桌面",
    items: [
      { name: "Go", url: "https://go.dev/doc/" },
      { name: "Python", url: "https://docs.python.org/3/" },
      { name: "PHP", url: "https://www.php.net/manual/en/" },
      { name: "Hono", url: "https://hono.dev/docs/" },
      { name: "Flask", url: "https://flask.palletsprojects.com/en/stable/" },
      { name: "Wails", url: "https://wails.io/docs/introduction/" },
    ],
  },
  {
    id: "storage",
    title: "数据与存储",
    items: [
      { name: "PostgreSQL", url: "https://www.postgresql.org/docs/current/" },
      { name: "SQLite", url: "https://www.sqlite.org/docs.html" },
      { name: "Drizzle", url: "https://orm.drizzle.team/docs/overview" },
      { name: "Cloudflare KV", url: "https://developers.cloudflare.com/kv/" },
      { name: "Cloudflare R2", url: "https://developers.cloudflare.com/r2/" },
    ],
  },
  {
    id: "clients",
    title: "自动化与客户端",
    items: [
      { name: "Playwright", url: "https://playwright.dev/docs/intro" },
      {
        name: "微信小程序",
        url: "https://developers.weixin.qq.com/miniprogram/dev/framework/",
      },
      { name: "C++", url: "https://isocpp.org/faq" },
      { name: "ImGui", url: "https://github.com/ocornut/imgui/wiki" },
    ],
  },
  {
    id: "content",
    title: "内容与工具",
    items: [
      { name: "Astro", url: "https://docs.astro.build/en/getting-started/" },
      { name: "Vite", url: "https://vite.dev/guide/" },
      { name: "Bun", url: "https://bun.com/docs" },
      {
        name: "Markdown",
        url: "https://daringfireball.net/projects/markdown/syntax",
      },
    ],
  },
  {
    id: "deployment",
    title: "部署与服务",
    items: [
      { name: "Docker", url: "https://docs.docker.com/" },
      { name: "Nginx", url: "https://nginx.org/en/docs/" },
      {
        name: "Cloudflare Workers",
        url: "https://developers.cloudflare.com/workers/",
      },
      {
        name: "systemd",
        url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.html",
      },
    ],
  },
] as const;

export const INTERESTS = [
  "Crypto",
  "Vibe Coding",
  "Web3",
  "抓包与协议分析",
  "逆向工程",
  "AI 应用",
];
