"use client";

// Adapted from beUI accordion motion patterns.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BouncyAccordion({
  title,
  description,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const reduceMotion = useReducedMotion();

  return (
    <Card className={cn("overflow-hidden p-0 shadow-none", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-canvas/70 focus-visible:outline-primary"
      >
        <span className="min-w-0">
          <span className="block font-semibold">{title}</span>
          {description ? <span className="block text-sm text-muted">{description}</span> : null}
        </span>
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { rotate: open ? 180 : 0, scale: open ? 1.08 : 1 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}
            className="overflow-hidden border-t border-border/70"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
