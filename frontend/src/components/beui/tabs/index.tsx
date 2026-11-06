"use client";

// Adapted from beUI Tabs.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { createContext, useContext, useId, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used inside Tabs`);
  }
  return context;
}

export function Tabs({
  value,
  onValueChange,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  const generatedId = useId();

  return (
    <TabsContext.Provider value={{ value, onValueChange, baseId: generatedId }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-full border border-border bg-white p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  value: string;
}) {
  const { value: activeValue, onValueChange, baseId } = useTabsContext("TabsTrigger");
  const selected = activeValue === value;
  const reduceMotion = useReducedMotion();
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={() => onValueChange(value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onValueChange(value);
        }
      }}
      className={cn(
        "relative inline-flex min-h-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        selected ? "text-white" : "text-muted hover:bg-canvas hover:text-ink",
        className,
      )}
      {...props}
    >
      {selected ? (
        <motion.span
          layoutId={`${baseId}-tab-indicator`}
          className="absolute inset-0 rounded-full bg-ink"
          transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }}
          aria-hidden="true"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </button>
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  value: string;
}) {
  const { value: activeValue, baseId } = useTabsContext("TabsContent");
  const selected = activeValue === value;

  return (
    <div
      id={`${baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      className={className}
      {...props}
    />
  );
}
