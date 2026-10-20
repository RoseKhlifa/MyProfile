"use client";

import {
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Github,
  Mail,
  MessageCircle,
  MessagesSquare,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BLOG_URL, CONTACT_DETAILS } from "@/data/resume-data";
import "./contact-details.css";

type CopyTarget = "wechat" | "qq";

const accounts = [
  {
    id: "wechat" as const,
    label: "WeChat",
    value: CONTACT_DETAILS.wechat,
    Icon: MessageCircle,
    copiedMessage: "WeChat 账号已复制",
  },
  {
    id: "qq" as const,
    label: "QQ",
    value: CONTACT_DETAILS.qq,
    Icon: MessagesSquare,
    copiedMessage: "QQ号已复制",
  },
];

export function ContactDetails() {
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [pending, setPending] = useState<CopyTarget | null>(null);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyAccount(target: CopyTarget) {
    const account = accounts.find(({ id }) => id === target);
    if (!account || pending) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setPending(target);
    setCopied(null);
    setFailed(false);
    setStatus("");

    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(account.value);
      setCopied(target);
      setStatus(account.copiedMessage);
      resetTimer.current = setTimeout(() => setCopied(null), 2600);
    } catch {
      setFailed(true);
      setStatus(`请选中${account.label}账号，手动复制。`);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="contact-details-root">
      <ul className="contact-details-list text-xs" aria-label="联系方式">
        <li>
          <a
            className="contact-details-row contact-details-link"
            href={`mailto:${CONTACT_DETAILS.email}`}
            aria-label={`发送邮件至 ${CONTACT_DETAILS.email}`}
          >
            <Mail
              className="contact-details-icon"
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="contact-details-label">Email</span>
            <span className="contact-details-value">
              {CONTACT_DETAILS.email}
            </span>
            <ArrowUpRight
              className="contact-details-arrow"
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </a>
        </li>
        {accounts.map(({ id, label, value, Icon }) => (
          <li key={id} className="contact-details-row">
            <Icon
              className="contact-details-icon"
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="contact-details-label">{label}</span>
            <span className="contact-details-value">{value}</span>
            <button
              className="contact-details-copy"
              type="button"
              aria-label={`复制${label}账号 ${value}`}
              disabled={pending !== null}
              data-copied={copied === id ? "true" : "false"}
              onClick={() => void copyAccount(id)}
            >
              {copied === id ? (
                <Check size={13} strokeWidth={1.6} aria-hidden="true" />
              ) : (
                <Copy size={12} strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>{copied === id ? "已复制" : "复制"}</span>
            </button>
          </li>
        ))}
        <li>
          <a
            className="contact-details-row contact-details-link"
            href={CONTACT_DETAILS.x.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`X ${CONTACT_DETAILS.x.handle}（新标签页）`}
          >
            <span className="contact-details-icon contact-details-x">
              <X size={14} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="contact-details-label">X</span>
            <span className="contact-details-value">
              {CONTACT_DETAILS.x.handle}
            </span>
            <ArrowUpRight
              className="contact-details-arrow"
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </a>
        </li>
        <li>
          <a
            className="contact-details-row contact-details-link"
            href={CONTACT_DETAILS.github.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`GitHub ${CONTACT_DETAILS.github.handle}（新标签页）`}
          >
            <Github
              className="contact-details-icon"
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="contact-details-label">GitHub</span>
            <span className="contact-details-value">
              {CONTACT_DETAILS.github.handle}
            </span>
            <ArrowUpRight
              className="contact-details-arrow"
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </a>
        </li>
      </ul>
      <p className="contact-details-note text-xs">{CONTACT_DETAILS.note}</p>
      <div className="contact-details-bottom text-xs">
        <a
          className="contact-details-blog"
          href={BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen size={14} strokeWidth={1.5} aria-hidden="true" />
          阅读博客{" "}
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">（新标签页）</span>
        </a>
        <output
          className="contact-details-status"
          data-failed={failed ? "true" : "false"}
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </output>
      </div>
    </div>
  );
}
