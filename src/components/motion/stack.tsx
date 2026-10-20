import {
  ArrowUpRight,
  Blocks,
  Compass,
  Database,
  FileCode2,
  type LucideIcon,
  PanelsTopLeft,
  Server,
  TerminalSquare,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { INTERESTS, STACK_GROUPS } from "@/data/stack";
import "./stack.css";

const icons = {
  interface: PanelsTopLeft,
  backend: Server,
  storage: Database,
  clients: TerminalSquare,
  content: FileCode2,
  deployment: Blocks,
} satisfies Record<(typeof STACK_GROUPS)[number]["id"], LucideIcon>;

export function Stack() {
  return (
    <Section title="Stack & Interests" titleId="stack-section">
      <p className="text-xs text-muted-foreground">
        项目中使用的技术，以及持续关注的方向。
      </p>
      <ul className="cv-stack-grid" aria-label="当前项目技术栈">
        {STACK_GROUPS.map((group) => {
          const Icon = icons[group.id];
          return (
            <li key={group.id} className="cv-stack-group">
              <h3 className="cv-stack-heading text-sm text-body">
                <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
                {group.title}
              </h3>
              <ul className="cv-stack-items text-xs">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <a
                      className="cv-stack-link"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.name} 官方文档（新标签页）`}
                    >
                      {item.name}
                      <ArrowUpRight
                        size={10}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="cv-stack-group cv-stack-interests">
        <h3 className="cv-stack-heading text-sm text-body">
          <Compass size={14} strokeWidth={1.5} aria-hidden="true" />
          关注方向
        </h3>
        <ul
          className="cv-stack-interest-items text-xs"
          aria-label="感兴趣的领域"
        >
          {INTERESTS.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
