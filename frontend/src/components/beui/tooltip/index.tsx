"use client";

// Adapted from beUI Tooltip.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { cloneElement, isValidElement, useId, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduceMotion = useReducedMotion();

  if (!isValidElement(children)) {
    return children;
  }

  const trigger = cloneElement(children, {
    "aria-describedby": open ? id : undefined,
    onFocus: (event) => {
      children.props.onFocus?.(event);
      setOpen(true);
    },
    onBlur: (event) => {
      children.props.onBlur?.(event);
      setOpen(false);
    },
    onMouseEnter: (event) => {
      children.props.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event) => {
      children.props.onMouseLeave?.(event);
      setOpen(false);
    },
  });

  return (
    <span className="relative inline-flex">
      {trigger}
      {open ? (
        <motion.span
          id={id}
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-56 -translate-x-1/2 rounded-xl border border-border bg-white px-3 py-2 text-xs text-ink shadow-sm",
            className,
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.14, ease: EASE_OUT }}
        >
          {content}
        </motion.span>
      ) : null}
    </span>
  );
}
