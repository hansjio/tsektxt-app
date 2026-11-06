"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HighlightedSpan } from "@/types/analysis";

export function InlineHighlightedText({
  text,
  spans,
  className,
  onChange,
  modelName = "",
}: {
  text: string;
  spans: HighlightedSpan[];
  className?: string;
  onChange?: (value: string) => void;
  modelName?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const explanationId = useId();
  const activeSpan = useMemo(
    () => spans.find((span) => span.id === (hoveredId ?? pinnedId)) ?? null,
    [hoveredId, pinnedId, spans],
  );

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  }, []);

  const scheduleHoverClose = useCallback(() => {
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => setHoveredId(null), 120);
  }, [cancelHoverClose]);

  const parts = useMemo(() => {
    const ordered = [...spans].sort((a, b) => a.start - b.start);
    const built = ordered.reduce<{ cursor: number; nodes: ReactNode[] }>(
      (acc, span) => ({
        cursor: span.end,
        nodes: [
          ...acc.nodes,
          text.slice(acc.cursor, span.start),
          <button
            key={span.id}
            type="button"
            aria-pressed={pinnedId === span.id}
            aria-describedby={activeSpan?.id === span.id ? explanationId : undefined}
            onClick={() => setPinnedId((current) => (current === span.id ? null : span.id))}
            onMouseEnter={() => {
              cancelHoverClose();
              setHoveredId(span.id);
            }}
            onMouseLeave={scheduleHoverClose}
            onFocus={() => {
              cancelHoverClose();
              setHoveredId(span.id);
            }}
            onBlur={scheduleHoverClose}
            onKeyDown={(event) => {
              if (!onChange || (event.key !== "Backspace" && event.key !== "Delete")) return;
              event.preventDefault();
              setPinnedId(null);
              setHoveredId(null);
              onChange(`${text.slice(0, span.start)}${text.slice(span.end)}`);
            }}
            className={cn(
              "mx-0.5 rounded-md border px-1.5 py-0.5 text-left underline decoration-2 underline-offset-4 transition-colors hover:bg-white focus-visible:outline-primary",
              span.direction === "credible"
                ? "border-credible/35 bg-credible/10 decoration-credible"
                : "border-critical/35 bg-critical/10 decoration-critical",
              (pinnedId === span.id || hoveredId === span.id) && "bg-white ring-1 ring-primary/30",
            )}
            aria-label={`${span.text}, ${span.direction === "credible" ? "toward credible" : "toward not credible"}, ${Math.round(span.weight * 100)} percent relative weight`}
          >
            {span.text}
          </button>,
        ],
      }),
      { cursor: 0, nodes: [] },
    );

    return [...built.nodes, text.slice(built.cursor)];
  }, [activeSpan?.id, cancelHoverClose, explanationId, hoveredId, onChange, pinnedId, scheduleHoverClose, spans, text]);

  return (
    <div className={cn("w-full text-left", className)}>
      <div className="w-full leading-8">{parts}</div>
      {activeSpan ? (
        <div
          id={explanationId}
          data-highlight-explanation-card=""
          role="status"
          onMouseEnter={cancelHoverClose}
          onMouseLeave={scheduleHoverClose}
          onFocus={cancelHoverClose}
          onBlur={scheduleHoverClose}
          className={cn(
            "mt-4 w-full rounded-[1rem] border bg-white/80 p-4 text-left shadow-none",
            activeSpan.direction === "credible" ? "border-credible/25" : "border-critical/25",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{activeSpan.text}</p>
              <p className="mt-1 text-[13px] text-muted">
                {modelName ? `${modelName} - ` : ""}#{activeSpan.rank} - pushes toward {activeSpan.direction === "credible" ? "credible" : "not credible"} - relative weight {Math.round(activeSpan.weight * 100)}%
              </p>
            </div>
            {pinnedId === activeSpan.id ? (
              <button
                type="button"
                className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-primary"
                onClick={() => setPinnedId(null)}
              >
                Close
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-sm">{activeSpan.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
