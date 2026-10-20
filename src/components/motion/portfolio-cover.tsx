import {
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  BookOpen,
  Box,
  Braces,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Crosshair,
  FileText,
  Layers,
  LayoutGrid,
  Mail,
  MessageSquare,
  MousePointer2,
  PackageCheck,
  PenTool,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Terminal,
  Wand2,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/lib/types";
import "./portfolio-cover.css";

type CoverKind = NonNullable<Project["cover"]>;

const captions: Record<CoverKind, string> = {
  studio: "CANVAS · MASK · HISTORY",
  prompts: "BROWSE · SAVE · IMPORT",
  gateway: "CONSOLE · DOCS · SERVICES",
  recharge: "PLANS · ORDERS · STATUS",
  sms: "LEASES · MESSAGES · HISTORY",
  shop: "SUBSCRIPTIONS · SMS · DELIVERY",
  console: "KEYS · USAGE · TEAMS",
  farm: "ACCOUNTS · BOT · TERMINAL",
  campus: "SCHEDULE · RECORDS · NOTIFY",
  checkin: "ACCOUNTS · TASKS · NOTIFY",
  miniapp: "TASKS · RECORDS · MESSAGES",
  exam: "BROWSER · TEXT · MODEL",
  fps: "ESP · RADAR · IMGUI",
  spider: "FETCH · PARSE · EXTRACT",
};

export function PortfolioCover({ project }: { project: Project }) {
  const kind = project.cover ?? "console";
  const scenes: Record<CoverKind, ReactNode> = {
    studio: <StudioScene />,
    prompts: <PromptsScene />,
    gateway: <GatewayScene />,
    recharge: <RechargeScene />,
    sms: <SmsScene />,
    shop: <ShopScene />,
    console: <ConsoleScene />,
    farm: <FarmScene />,
    campus: <CampusScene />,
    checkin: <CheckinScene />,
    miniapp: <MiniappScene />,
    exam: <ExamScene />,
    fps: <FpsScene />,
    spider: <SpiderScene />,
  };
  return (
    <div
      className={`portfolio-cover portfolio-cover-${kind}`}
      aria-hidden="true"
    >
      <div className="portfolio-cover-heading">
        <span className="portfolio-cover-kicker">
          {project.eyebrow ?? "ROSEKHLIFA / SELECTED WORK"}
        </span>
        <span className="portfolio-cover-title">{project.title}</span>
      </div>
      <div className="portfolio-cover-scene">{scenes[kind]}</div>
      <div className="portfolio-cover-caption">
        <span>{captions[kind]}</span>
        <ArrowUpRight size={10} strokeWidth={1.2} />
      </div>
    </div>
  );
}

function Window({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={`portfolio-window ${className}`}>
      <div className="portfolio-window-bar">
        <span className="portfolio-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <MinusMark />
      </div>
      {children}
    </div>
  );
}

function MinusMark() {
  return <span className="portfolio-window-minus" />;
}
function Lines({ className = "" }: { className?: string }) {
  return (
    <span className={`portfolio-lines ${className}`}>
      <i />
      <i />
      <i />
    </span>
  );
}
function StatusDot() {
  return <span className="portfolio-status-dot" />;
}
function IconTile({ children }: { children: ReactNode }) {
  return <span className="portfolio-icon-tile">{children}</span>;
}

function StudioScene() {
  return (
    <Window label="STUDIO / CANVAS" className="portfolio-studio-window">
      <div className="portfolio-studio-tools">
        <MousePointer2 />
        <PenTool />
        <Layers />
        <SlidersHorizontal />
      </div>
      <div className="portfolio-studio-layout">
        <div className="portfolio-studio-parameters">
          <span>PROMPT</span>
          <Lines />
          <span>LAYERS</span>
          <i />
          <i />
          <i />
        </div>
        <div className="portfolio-studio-canvas">
          <div className="portfolio-studio-art">
            <span />
            <span />
            <span />
          </div>
          <div className="portfolio-studio-mask">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="portfolio-studio-wipe" />
        </div>
        <div className="portfolio-studio-history">
          <span>HISTORY</span>
          <i />
          <i />
          <i />
        </div>
      </div>
    </Window>
  );
}

function PromptsScene() {
  return (
    <div className="portfolio-prompts-library">
      <div className="portfolio-prompts-search">
        <Search />
        <span>Explore a different perspective</span>
        <span>
          <SlidersHorizontal />
        </span>
      </div>
      <div className="portfolio-prompts-columns">
        {[0, 1, 2].map((column) => (
          <div
            className="portfolio-prompts-column"
            key={column}
            style={{ "--column": column } as CSSProperties}
          >
            {[0, 1, 2].map((item) => (
              <div
                className={`portfolio-prompt-tile portfolio-prompt-art-${(column + item) % 4}`}
                key={item}
              >
                <span className="portfolio-prompt-form" />
                <span className="portfolio-prompt-label">
                  <i />
                  <BookOpen />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GatewayScene() {
  return (
    <div className="portfolio-gateway">
      <div className="portfolio-gateway-brand">
        <span className="portfolio-gateway-monogram">G</span>
        <span>
          GPTCODEX<small>SERVICE NAVIGATOR</small>
        </span>
        <ArrowUpRight />
      </div>
      <div className="portfolio-gateway-rule">
        <i />
      </div>
      <div className="portfolio-gateway-entries">
        {[
          { label: "商城", Icon: Box },
          { label: "状态", Icon: ArrowDownUp },
          { label: "文档", Icon: BookOpen },
        ].map(({ label, Icon }) => (
          <div key={label}>
            <Icon />
            <span>{label}</span>
            <ChevronRight />
          </div>
        ))}
      </div>
      <div className="portfolio-gateway-footer">
        <StatusDot />
        <span>Find your way in.</span>
        <Braces />
      </div>
    </div>
  );
}

function RechargeScene() {
  return (
    <div className="portfolio-recharge">
      <Window
        label="SUBSCRIPTION / WORKSPACE"
        className="portfolio-recharge-window"
      >
        <div className="portfolio-recharge-header">
          <IconTile>
            <CreditCard />
          </IconTile>
          <span>
            订阅与订单<small>SUBSCRIPTION WORKFLOW</small>
          </span>
          <SlidersHorizontal />
        </div>
        <div className="portfolio-recharge-plans">
          <div>
            <span>PLAN</span>
            <Lines />
            <i />
          </div>
          <div>
            <span>ORDER</span>
            <Lines />
            <i />
          </div>
        </div>
        <div className="portfolio-recharge-steps">
          <span>
            <Check />
            创建订单
          </span>
          <i />
          <span>
            <ArrowDownUp />
            处理
          </span>
          <i />
          <span>
            <ShieldCheck />
            交付
          </span>
        </div>
      </Window>
      <span className="portfolio-recharge-receipt">
        <FileText />
        <i />
        <i />
        <i />
        <Check />
      </span>
    </div>
  );
}

function SmsScene() {
  return (
    <Window label="MESSAGING / WORKBENCH" className="portfolio-sms-window">
      <div className="portfolio-sms-nav">
        <MessageSquare />
        <span>号码租约</span>
        <span>消息记录</span>
        <i />
      </div>
      <div className="portfolio-sms-body">
        <div className="portfolio-sms-leases">
          {["A", "B", "C"].map((item) => (
            <div key={item}>
              <Smartphone />
              <span className="portfolio-masked-number">
                <i />
                <i />
                <i />
              </span>
              <span className="portfolio-sms-lease-state" />
            </div>
          ))}
        </div>
        <div className="portfolio-sms-thread">
          <span className="portfolio-sms-thread-title">MESSAGE PREVIEW</span>
          <span className="portfolio-sms-bubble">
            <i />
            <i />
          </span>
          <span className="portfolio-sms-bubble portfolio-sms-bubble-alt">
            <i />
          </span>
          <span className="portfolio-sms-typing">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </Window>
  );
}

function ShopScene() {
  return (
    <div className="portfolio-shop">
      <div className="portfolio-shop-products">
        {[
          { id: "product", Icon: Box },
          { id: "code", Icon: Braces },
          { id: "collection", Icon: Layers },
        ].map(({ id, Icon }) => (
          <div className="portfolio-shop-product" key={id}>
            <Icon />
            <Lines />
            <span className="portfolio-shop-tag" />
          </div>
        ))}
      </div>
      <div className="portfolio-shop-route">
        <i />
        <span className="portfolio-shop-package">
          <PackageCheck />
        </span>
        <i />
      </div>
      <div className="portfolio-shop-delivery">
        <Check />
        <span>
          订单
          <ChevronRight />
          自动交付
        </span>
        <span className="portfolio-shop-envelope">
          <Mail />
        </span>
      </div>
    </div>
  );
}

function ConsoleScene() {
  return (
    <Window label="4I.CODES / CONSOLE" className="portfolio-console-window">
      <div className="portfolio-console-layout">
        <div className="portfolio-console-sidebar">
          <LayoutGrid />
          <Braces />
          <ArrowDownUp />
          <FileText />
        </div>
        <div className="portfolio-console-content">
          <div className="portfolio-console-title">
            <span>Usage overview</span>
            <span>筹划中</span>
          </div>
          <div className="portfolio-console-chart">
            <svg viewBox="0 0 220 64" fill="none" preserveAspectRatio="none">
              <title>用量趋势示意</title>
              <path
                className="portfolio-console-chart-grid"
                d="M0 15H220M0 38H220M0 63H220"
              />
              <path
                className="portfolio-console-chart-line"
                d="M0 51 18 48 36 53 54 32 72 36 90 24 108 30 126 18 144 29 162 13 180 20 198 8 220 15"
              />
            </svg>
          </div>
          <div className="portfolio-console-key">
            <Braces />
            <span>API KEYS</span>
            <Lines />
            <i />
          </div>
        </div>
      </div>
    </Window>
  );
}

function FarmScene() {
  return (
    <div className="portfolio-farm">
      <div className="portfolio-farm-field">
        <div className="portfolio-farm-horizon" />
        <div className="portfolio-farm-plots">
          {[
            "north-west",
            "north",
            "north-east",
            "west",
            "center",
            "east",
            "south-west",
            "south",
            "south-east",
          ].map((plot, index) => (
            <span key={plot} style={{ "--plot": index } as CSSProperties}>
              <i />
              <i />
              <i />
            </span>
          ))}
        </div>
      </div>
      <Window label="TERMINAL / ARCHIVE" className="portfolio-farm-terminal">
        <div>
          <span>
            <Terminal />
            farm / session
          </span>
          <p>
            <i />
            automation
          </p>
          <p>
            <i />
            scheduler
          </p>
          <p>
            <i />
            open-source archive
          </p>
          <span className="portfolio-terminal-cursor" />
        </div>
      </Window>
      <span className="portfolio-farm-archived">
        SERVICE CLOSED · SOURCE OPEN
      </span>
    </div>
  );
}

function CampusScene() {
  return (
    <Window label="CAMPUS / WEEKLY" className="portfolio-campus-window">
      <div className="portfolio-campus-top">
        <CalendarDays />
        <span>周历与状态</span>
        <span>WEEK VIEW</span>
      </div>
      <div className="portfolio-campus-calendar">
        {["MON", "TUE", "WED", "THU", "FRI"].map((day, index) => (
          <div className="portfolio-campus-column" key={day}>
            <span>{day}</span>
            <i />
            <i />
            <span
              className={`portfolio-campus-event portfolio-campus-event-${index % 3}`}
            >
              <i />
              <i />
            </span>
          </div>
        ))}
      </div>
      <div className="portfolio-campus-status">
        <StatusDot />
        <span>日程 · 任务 · 通知</span>
        <Bell />
      </div>
    </Window>
  );
}

function CheckinScene() {
  return (
    <div className="portfolio-checkin">
      <Window label="TASKS / DESKTOP" className="portfolio-checkin-window">
        <div className="portfolio-checkin-top">
          <ClipboardCheck />
          <span>任务与状态</span>
          <i />
        </div>
        <div className="portfolio-checkin-list">
          {["SCHEDULE", "ACTIVITY", "NOTICE"].map((label, index) => (
            <div key={label}>
              <span
                className={`portfolio-checkin-check portfolio-checkin-check-${index}`}
              >
                <Check />
              </span>
              <span>
                {label}
                <Lines />
              </span>
              <span className="portfolio-checkin-status" />
            </div>
          ))}
        </div>
      </Window>
      <div className="portfolio-checkin-notification">
        <Bell />
        <span>
          状态通知<small>Task update</small>
        </span>
        <i />
      </div>
    </div>
  );
}

function MiniappScene() {
  return (
    <div className="portfolio-miniapp">
      <span className="portfolio-miniapp-orbit" />
      <div className="portfolio-phone">
        <div className="portfolio-phone-island" />
        <div className="portfolio-phone-top">
          <span>ACTIVITIES</span>
          <i />
          <i />
          <i />
        </div>
        <div className="portfolio-phone-welcome">
          <CalendarDays />
          <span>
            活动与记录<small>AT A GLANCE</small>
          </span>
        </div>
        <div className="portfolio-phone-card">
          <span>当前活动</span>
          <Lines />
          <i />
        </div>
        <div className="portfolio-phone-rows">
          <span>
            <ClipboardCheck />
            <i />
            <ChevronRight />
          </span>
          <span>
            <Bell />
            <i />
            <ChevronRight />
          </span>
        </div>
        <div className="portfolio-phone-tabs">
          <CalendarDays />
          <ClipboardCheck />
          <Bell />
        </div>
        <span className="portfolio-phone-home" />
      </div>
      <span className="portfolio-miniapp-note">
        <Smartphone />
        <span>
          WeChat<small>MINI PROGRAM</small>
        </span>
      </span>
    </div>
  );
}

function ExamScene() {
  return (
    <div className="portfolio-exam">
      <Window label="BROWSER / WORKFLOW" className="portfolio-exam-window">
        <div className="portfolio-exam-document">
          <span>实验室安全 · 流程研究</span>
          <Lines />
          <div className="portfolio-exam-options">
            <span>
              <i />
              <b />
            </span>
            <span>
              <i />
              <b />
            </span>
            <span>
              <i />
              <b />
            </span>
          </div>
        </div>
      </Window>
      <div className="portfolio-exam-pipeline">
        <span>
          <FileText />
          提取
        </span>
        <i />
        <span>
          <Wand2 />
          分析
        </span>
        <i />
        <span>
          <MousePointer2 />
          交互
        </span>
      </div>
    </div>
  );
}

function FpsScene() {
  return (
    <div className="portfolio-fps">
      <div className="portfolio-fps-grid" />
      <div className="portfolio-fps-radar">
        <span />
        <span />
        <span />
        <i />
        <b />
      </div>
      <div className="portfolio-fps-wireframe">
        <span className="portfolio-fps-wireframe-body" />
        <span className="portfolio-fps-wireframe-head" />
        <span className="portfolio-fps-wireframe-floor" />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="portfolio-fps-hud">
        <Crosshair />
        <span>
          EXTERNAL VISUALIZATION<small>RESEARCH / DEMO</small>
        </span>
      </div>
      <span className="portfolio-fps-coordinate">
        VIEW · PROJECTION · OVERLAY
      </span>
    </div>
  );
}

function SpiderScene() {
  return (
    <Window
      label="PYTHON / TEXT EXTRACTION"
      className="portfolio-spider-window"
    >
      <div className="portfolio-spider-command">
        <Terminal />
        <span>crawler / archive</span>
        <span className="portfolio-terminal-cursor" />
      </div>
      <div className="portfolio-spider-columns">
        <div className="portfolio-spider-pages">
          <FileText />
          <span />
          <span />
          <span />
        </div>
        <div className="portfolio-spider-arrow">
          <ChevronRight />
          <i />
        </div>
        <div className="portfolio-spider-results">
          {["TITLE", "URL", "SUMMARY"].map((label, index) => (
            <div key={label} style={{ "--result": index } as CSSProperties}>
              <span>{label}</span>
              <Lines />
            </div>
          ))}
        </div>
      </div>
      <div className="portfolio-spider-footer">
        <Search />
        <span>关键词 · 分页 · 文本清理</span>
        <Braces />
      </div>
    </Window>
  );
}
