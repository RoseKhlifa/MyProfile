"use client";

import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Mail,
  QrCode,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { XIcon } from "@/components/icons/x-icon";
import { CONTACT_DETAILS } from "@/data/resume-data";
import "./header-contact.css";

type AccountId = "wechat" | "qq";

export type HeaderContactProps = {
  qrImages?: { wechat?: string; qq?: string };
};

const accounts = [
  {
    id: "wechat",
    label: "WeChat",
    action: "复制微信号",
    value: CONTACT_DETAILS.wechat,
  },
  { id: "qq", label: "QQ", action: "复制QQ号", value: CONTACT_DETAILS.qq },
] as const;

export function HeaderContact({ qrImages }: HeaderContactProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<AccountId | null>(null);
  const [pending, setPending] = useState<AccountId | null>(null);
  const [status, setStatus] = useState("");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
  const suppressFocus = useRef(false);
  const copyRequest = useRef(0);
  const panelId = useId();

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const close = useCallback(
    (restoreFocus = false) => {
      clearCloseTimer();
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = null;
      pinned.current = false;
      copyRequest.current++;
      setOpen(false);
      setCopied(null);
      setPending(null);
      setStatus("");
      if (restoreFocus && document.activeElement !== triggerRef.current) {
        suppressFocus.current = true;
        triggerRef.current?.focus({ preventScroll: true });
        suppressFocus.current = false;
      }
    },
    [clearCloseTimer]
  );

  const reveal = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const deferClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      if (
        !pinned.current &&
        !wrapperRef.current?.contains(document.activeElement)
      ) {
        close();
      }
    }, 150);
  }, [clearCloseTimer, close]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copyRequest.current++;
    };
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const wrapper = wrapperRef.current;
      const panel = panelRef.current;
      if (!wrapper || !panel) return;
      const anchor = wrapper.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 32);
      const left = Math.max(
        16,
        Math.min(anchor.left, window.innerWidth - width - 16)
      );
      panel.style.left = `${left - anchor.left}px`;
      panel.style.setProperty(
        "--header-contact-available-height",
        `${Math.max(120, window.innerHeight - anchor.bottom - 24)}px`
      );
    };
    position();
    const observer = new ResizeObserver(position);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  async function copyAccount(id: AccountId) {
    if (pending) return;
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    const request = ++copyRequest.current;
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    setPending(id);
    setCopied(null);
    setStatus("");
    try {
      await navigator.clipboard.writeText(account.value);
      if (request !== copyRequest.current) return;
      setCopied(id);
      setStatus(`${account.label} 账号已复制`);
      copiedTimer.current = setTimeout(() => setCopied(null), 2600);
    } catch {
      if (request === copyRequest.current) {
        setStatus(`请选中下方 ${account.label} 账号，手动复制。`);
      }
    } finally {
      if (request === copyRequest.current) setPending(null);
    }
  }

  return (
    <div
      className="header-contact"
      ref={wrapperRef}
      onPointerEnter={(event) => {
        if (
          event.pointerType !== "touch" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          reveal();
      }}
      onPointerLeave={deferClose}
      onFocusCapture={() => {
        if (!suppressFocus.current) reveal();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          pinned.current = false;
          deferClose();
        }
      }}
    >
      <button
        ref={triggerRef}
        className="header-contact-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (pinned.current) close();
          else {
            pinned.current = true;
            reveal();
          }
        }}
      >
        Contact me
        <ChevronDown size={11} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className="header-contact-panel"
        role="dialog"
        aria-modal="false"
        aria-label="联系信息"
        aria-hidden={!open}
        inert={!open}
        data-open={open ? "true" : "false"}
      >
        <div className="header-contact-accounts">
          {accounts.map((account) => {
            const image = qrImages?.[account.id];
            const showImage = image && !failedImages[image];
            return (
              <div className="header-contact-account" key={account.id}>
                <span className="header-contact-account-label">
                  {account.label}
                </span>
                {showImage ? (
                  <a
                    className="header-contact-qr"
                    data-image="true"
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`放大查看 ${account.label} 二维码（新标签页）`}
                  >
                    <Image
                      src={image}
                      width={128}
                      height={128}
                      alt={`${account.label} 联系二维码`}
                      loading="lazy"
                      decoding="async"
                      unoptimized={true}
                      onError={() =>
                        setFailedImages((current) => ({
                          ...current,
                          [image]: true,
                        }))
                      }
                    />
                  </a>
                ) : (
                  <span className="header-contact-qr" data-image="false">
                    <QrCode size={30} strokeWidth={1.15} aria-hidden="true" />
                  </span>
                )}
                <button
                  className="header-contact-copy"
                  type="button"
                  onClick={() => void copyAccount(account.id)}
                  aria-label={account.action}
                  aria-busy={pending === account.id}
                  aria-disabled={pending !== null}
                >
                  <span className="header-contact-copy-label">
                    {copied === account.id ? (
                      <Check size={11} aria-hidden="true" />
                    ) : (
                      <Copy size={11} strokeWidth={1.5} aria-hidden="true" />
                    )}
                    {copied === account.id ? "已复制" : account.action}
                  </span>
                </button>
                <span className="header-contact-account-value">
                  {account.value}
                </span>
              </div>
            );
          })}
        </div>
        <div className="header-contact-links">
          <a
            href={CONTACT_DETAILS.x.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`X ${CONTACT_DETAILS.x.handle}（新标签页）`}
          >
            <XIcon
              width={13}
              height={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>{CONTACT_DETAILS.x.handle}</span>
            <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <a href={`mailto:${CONTACT_DETAILS.email}`}>
            <Mail size={13} strokeWidth={1.5} aria-hidden="true" />
            <span>{CONTACT_DETAILS.email}</span>
            <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
        <p className="header-contact-note">{CONTACT_DETAILS.note}</p>
        <output
          className="header-contact-status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </output>
      </div>
    </div>
  );
}
