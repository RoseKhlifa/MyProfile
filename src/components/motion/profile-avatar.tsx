"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotionMode } from "./enhancements";
import "./profile-avatar.css";

export function ProfileAvatar({
  src,
  name,
}: {
  src: StaticImageData;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { reduced } = useMotionMode();
  useEffect(() => {
    if (!present) return;
    dialogRef.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [present]);
  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        className="cv-avatar-trigger size-28 shrink-0 rounded-xl bg-muted object-cover ring-1 ring-muted"
        aria-label="查看头像大图"
        aria-haspopup="dialog"
        whileHover={reduced ? undefined : { y: -3, rotate: -2 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 230, damping: 20 }}
        onClick={() => {
          setOpen(true);
          setPresent(true);
        }}
      >
        <Image
          src={src}
          alt={`${name} 的头像`}
          width={112}
          height={112}
          preload={true}
          className="cv-avatar-image size-28 rounded-xl object-cover"
        />
        <span className="cv-avatar-sheen" aria-hidden="true" />
      </motion.button>
      {present && (
        <dialog
          ref={dialogRef}
          className="cv-avatar-dialog"
          aria-label="头像大图"
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          <AnimatePresence
            onExitComplete={() => {
              dialogRef.current?.close();
              setPresent(false);
              triggerRef.current?.focus({ preventScroll: true });
            }}
          >
            {open && (
              <motion.div
                className="cv-avatar-portrait"
                key="portrait"
                initial={{
                  opacity: 0,
                  scale: reduced ? 1 : 0.96,
                  y: reduced ? 0 : 18,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                transition={{ duration: reduced ? 0 : 0.32 }}
              >
                <Image
                  src={src}
                  alt={`${name} 的头像完整图片`}
                  sizes="(max-width: 600px) 90vw, 500px"
                  className="cv-avatar-full"
                />
                <button
                  type="button"
                  className="cv-avatar-close"
                  aria-label="关闭头像大图"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </dialog>
      )}
    </>
  );
}

export function InteractiveName({ name }: { name: string }) {
  const { reduced } = useMotionMode();
  return (
    <span className="cv-name" data-reduced={reduced}>
      <span className="sr-only">{name}</span>
      <span aria-hidden="true">
        {Array.from(name).map((letter, index) => (
          <motion.span
            key={`${index}-${letter}`}
            className="cv-name-letter"
            whileHover={
              reduced ? undefined : { y: -4, rotate: index % 2 === 0 ? -6 : 6 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
