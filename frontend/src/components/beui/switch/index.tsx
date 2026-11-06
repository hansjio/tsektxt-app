"use client";

// Adapted from beUI Switch.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { motion, useReducedMotion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-12 items-center rounded-full border p-1 transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-ink bg-ink" : "border-border bg-white",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <motion.span
        className="h-5 w-5 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
        aria-hidden="true"
      />
    </button>
  );
}
