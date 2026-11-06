"use client";

// Adapted from beUI Drawer.
// Source: https://github.com/starc007/ui-components
// License: MIT

import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type DrawerSide = "left" | "right";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerElement: HTMLElement | null;
  setTriggerElement: (element: HTMLElement | null) => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

let lockCount = 0;
let previousOverflow = "";

function lockBodyScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
    }
  };
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));
}

function useDrawerContext(component: string) {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error(`${component} must be used inside Drawer`);
  }
  return context;
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const controlled = open !== undefined;
  const currentOpen = controlled ? open : internalOpen;

  function setOpen(nextOpen: boolean) {
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <DrawerContext.Provider value={{ open: currentOpen, setOpen, titleId, descriptionId, triggerElement, setTriggerElement }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
  asChild = false,
  children,
}: {
  asChild?: boolean;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}) {
  const { open, setOpen, setTriggerElement } = useDrawerContext("DrawerTrigger");

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      "aria-expanded": open,
      onClick: (event) => {
        children.props.onClick?.(event);
        setTriggerElement(event.currentTarget);
        setOpen(true);
      },
    });
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={(event) => {
        setTriggerElement(event.currentTarget);
        setOpen(true);
      }}
    >
      {children}
    </button>
  );
}

export function DrawerContent({
  side = "right",
  size,
  className,
  overlayClassName,
  children,
  style,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  side?: DrawerSide;
  size?: string;
  overlayClassName?: string;
  children: ReactNode;
}) {
  const { open, setOpen, titleId, descriptionId, triggerElement } = useDrawerContext("DrawerContent");
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const returnFocusTarget = triggerElement ?? previouslyFocused;

    const focusTimer = window.setTimeout(() => {
      const focusable = panelRef.current ? getFocusableElements(panelRef.current) : [];
      (focusable[0] ?? panelRef.current)?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      unlock();
      window.setTimeout(() => {
        returnFocusTarget?.focus();
      }, 0);
    };
  }, [open, setOpen, triggerElement]);

  if (typeof document === "undefined") return null;

  const offscreen = side === "right" ? "100%" : "-100%";
  const widthStyle = size ? { ...style, width: size } : style;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80]" data-drawer-root="">
          <motion.button
            type="button"
            aria-label="Close drawer overlay"
            className={cn("absolute inset-0 h-full w-full cursor-default bg-ink/35 backdrop-blur-sm", overlayClassName)}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className={cn(
              "absolute inset-y-0 flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden bg-white shadow-sm outline-none",
              "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
              side === "right"
                ? "right-0 border-l border-border/70 pl-4 pr-[max(1rem,env(safe-area-inset-right))]"
                : "left-0 border-r border-border/70 pl-[max(1rem,env(safe-area-inset-left))] pr-4",
              className,
            )}
            style={widthStyle}
            initial={reduceMotion ? { opacity: 0 } : { x: offscreen }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: offscreen }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE_OUT }}
            {...props}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border/70 pb-4", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDrawerContext("DrawerTitle");
  return <h2 id={titleId} className={cn("text-xl font-black tracking-[0.015em]", className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDrawerContext("DrawerDescription");
  return <p id={descriptionId} className={cn("mt-1 text-sm text-muted", className)} {...props} />;
}

export function DrawerClose({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
}) {
  const { setOpen } = useDrawerContext("DrawerClose");

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    >
      {children ?? <X className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
