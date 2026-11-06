"use client";

// Adapted from beUI Popover.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { isValidElement, useId, useRef, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function GooeyPopover({
  trigger,
  children,
  contentClassName,
}: {
  trigger: ReactElement<HTMLAttributes<HTMLElement>>;
  children: ReactNode;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();

  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }

  if (!isValidElement(trigger)) return trigger;

  return (
    <span
      className="relative inline-flex"
      onClick={() => setOpen((value) => !value)}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={scheduleClose}
    >
      {trigger}
      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="dialog"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className={cn(
              "absolute left-1/2 top-full z-40 mt-2 w-[min(18rem,80vw)] -translate-x-1/2 rounded-[1.15rem] border border-border bg-white/95 p-4 text-left shadow-sm backdrop-blur-xl",
              contentClassName,
            )}
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.96, filter: "blur(5px)" }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96, filter: "blur(5px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
          >
            {children}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
