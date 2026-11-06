"use client";

// Adapted from beUI Animated Badge.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { CheckCircle2, Info, Loader2, ShieldAlert, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type AnimatedBadgeStatus = "neutral" | "info" | "success" | "warning" | "danger" | "loading";
export type AnimatedBadgeSize = "sm" | "md";

export type AnimatedBadgeProps = Omit<HTMLMotionProps<"span">, "children"> & {
  status?: AnimatedBadgeStatus;
  size?: AnimatedBadgeSize;
  icon?: ReactNode;
  children?: ReactNode;
};

const statusClasses: Record<AnimatedBadgeStatus, string> = {
  neutral: "border-white/70 bg-white/70 text-muted",
  info: "border-primary/20 bg-primary/10 text-primary",
  success: "border-credible/20 bg-credible/10 text-credible",
  warning: "border-caution/25 bg-caution/15 text-caution",
  danger: "border-critical/25 bg-critical/10 text-critical",
  loading: "border-primary/20 bg-primary/10 text-primary",
};

const sizeClasses: Record<AnimatedBadgeSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

const defaultIcon: Record<AnimatedBadgeStatus, ReactNode> = {
  neutral: null,
  info: <Info className="h-3.5 w-3.5" aria-hidden="true" />,
  success: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
  warning: <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />,
  danger: <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />,
  loading: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />,
};

export function AnimatedBadge({
  className,
  status = "neutral",
  size = "sm",
  icon,
  children,
  ...props
}: AnimatedBadgeProps) {
  const reduceMotion = useReducedMotion();
  const resolvedIcon = icon === undefined ? defaultIcon[status] : icon;

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur",
        statusClasses[status],
        sizeClasses[size],
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0.85, y: 1 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      {...props}
    >
      {resolvedIcon}
      {children}
    </motion.span>
  );
}
