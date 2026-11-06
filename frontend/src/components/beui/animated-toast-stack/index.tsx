"use client";

// Adapted from beUI Animated Toast Stack.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { AlertCircle, Check, Info, LoaderCircle, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type AnimatedToast = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status?: "info" | "loading" | "success" | "error";
  duration?: number;
};

const iconMap = {
  info: Info,
  loading: LoaderCircle,
  success: Check,
  error: AlertCircle,
};

const toneClass = {
  info: "bg-primary/10 text-primary",
  loading: "bg-primary/10 text-primary",
  success: "bg-credible/10 text-credible",
  error: "bg-critical/10 text-critical",
};

export function AnimatedToastStack({
  toasts,
  onDismiss,
}: {
  toasts: AnimatedToast[];
  onDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    const timers = toasts
      .filter((toast) => toast.duration !== 0)
      .map((toast) => window.setTimeout(() => onDismiss(toast.id), toast.duration ?? 3600));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [mounted, onDismiss, toasts]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[100] flex w-[min(92vw,24rem)] flex-col gap-2" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.slice(-3).map((toast) => {
          const status = toast.status ?? "info";
          const Icon = iconMap[status];
          return (
            <motion.div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border bg-white/95 p-3 text-left shadow-sm backdrop-blur-xl"
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: EASE_OUT }}
            >
              <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full", toneClass[status])}>
                <Icon className={cn("h-4 w-4", status === "loading" && "animate-spin")} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description ? <p className="mt-0.5 text-xs text-muted">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
