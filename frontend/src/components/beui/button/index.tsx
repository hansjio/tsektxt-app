"use client";

// Adapted from beUI Button.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type BeUIButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export const beuiButtonVariants: Record<BeUIButtonVariant, string> = {
  primary: "bg-ink text-white shadow-sm hover:bg-ink/90 active:bg-ink",
  secondary: "border border-white/70 bg-white/70 text-ink shadow-sm backdrop-blur hover:bg-white active:bg-canvas",
  ghost: "text-ink hover:bg-white/60 active:bg-canvas",
  danger: "border border-critical/25 bg-critical/10 text-critical hover:bg-critical/15 active:bg-critical/20",
};

export const beuiButtonBase =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

export type BeUIButtonProps = HTMLMotionProps<"button"> & {
  variant?: BeUIButtonVariant;
};

export function BeUIButton({ className, variant = "primary", disabled, ...props }: BeUIButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(beuiButtonBase, beuiButtonVariants[variant], className)}
      disabled={disabled}
      transition={SPRING_PRESS}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.985 }}
      {...props}
    />
  );
}
