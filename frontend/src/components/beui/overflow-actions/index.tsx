"use client";

// Adapted from beUI Overflow Actions.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type OverflowActionItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function OverflowActions({
  primaryActions,
  overflowActions,
  expanded,
  onExpandedChange,
  className,
}: {
  primaryActions: OverflowActionItem[];
  overflowActions: OverflowActionItem[];
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  function runAction(item: OverflowActionItem) {
    if (item.disabled) return;
    item.onClick?.();
    onExpandedChange(false);
  }

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-white p-1 shadow-sm", className)}>
      {primaryActions.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.ariaLabel}
          disabled={item.disabled}
          onClick={() => runAction(item)}
          className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
      <AnimatePresence initial={false}>
        {expanded
          ? overflowActions.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                aria-label={item.ariaLabel}
                disabled={item.disabled}
                onClick={() => runAction(item)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45"
                initial={reduceMotion ? false : { opacity: 0, x: -6, filter: "blur(4px)" }}
                animate={reduceMotion ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.16, ease: EASE_OUT, delay: reduceMotion ? 0 : index * 0.02 }}
              >
                {item.icon}
                <span className="sr-only sm:not-sr-only">{item.label}</span>
              </motion.button>
            ))
          : null}
      </AnimatePresence>
      <button
        type="button"
        aria-label={expanded ? "Hide extra actions" : "Show extra actions"}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        className="grid min-h-9 min-w-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {expanded ? <X className="h-4 w-4" aria-hidden="true" /> : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
