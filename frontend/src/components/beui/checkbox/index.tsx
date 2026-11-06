"use client";

// Adapted from beUI Checkbox.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { Check, Minus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({ checked, onCheckedChange, className, disabled, ...props }: CheckboxProps) {
  const reduceMotion = useReducedMotion();
  const active = checked === true || checked === "indeterminate";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === "indeterminate" ? "mixed" : checked}
      disabled={disabled}
      className={cn(
        "grid h-5 w-5 place-items-center rounded-md border transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        active ? "border-ink bg-ink text-white" : "border-border bg-white text-transparent",
        className,
      )}
      onClick={() => onCheckedChange?.(checked !== true)}
      {...props}
    >
      <motion.span
        initial={false}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: EASE_OUT }}
        aria-hidden="true"
      >
        {checked === "indeterminate" ? <Minus className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
      </motion.span>
    </button>
  );
}
