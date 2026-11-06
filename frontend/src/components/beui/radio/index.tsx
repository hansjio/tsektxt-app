"use client";

// Adapted from beUI Radio Group.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type RadioContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
};

const RadioContext = createContext<RadioContextValue | null>(null);

function useRadioContext() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used inside RadioGroup");
  }
  return context;
}

export function RadioGroup({
  value,
  onValueChange,
  name,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  children: ReactNode;
}) {
  return (
    <RadioContext.Provider value={{ value, onValueChange, name }}>
      <div role="radiogroup" className={className} {...props}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  className,
  disabled,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  value: string;
  disabled?: boolean;
}) {
  const context = useRadioContext();
  const selected = context.value === value;
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full border transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-ink bg-white" : "border-border bg-white",
        className,
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      <motion.span
        className="h-2.5 w-2.5 rounded-full bg-ink"
        initial={false}
        animate={selected ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: EASE_OUT }}
        aria-hidden="true"
      />
    </button>
  );
}
