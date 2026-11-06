"use client";

import Link from "next/link";
import { Bookmark, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/analysis";

export function HistoryActionsMenu({
  analysis,
  onDelete,
  onRename,
  onToggleSave,
}: {
  analysis: AnalysisResult;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
  onToggleSave?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ left: 0, top: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function updateMenuPosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = 208;
      const menuHeight = 184;
      const margin = 12;
      const left = Math.min(
        Math.max(margin, rect.right - menuWidth),
        window.innerWidth - menuWidth - margin
      );
      const hasRoomBelow = rect.bottom + menuHeight + margin <= window.innerHeight;
      const top = hasRoomBelow
        ? rect.bottom + 8
        : Math.max(margin, rect.top - menuHeight - 8);

      setMenuStyle({ left, top });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <>
          <button type="button" aria-label="Close actions" className="fixed inset-0 z-[90] cursor-default" onClick={close} />
          <div
            className="fixed z-[100] w-52 overflow-hidden rounded-[1rem] border border-border bg-white p-1 text-sm shadow-soft"
            style={menuStyle}
          >
            <Link
              href={`/dashboard/history/${analysis.id}`}
              className="flex min-h-10 items-center gap-2 rounded-[0.75rem] px-3 font-semibold transition-colors hover:bg-canvas"
              onClick={close}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open analysis
            </Link>
            {onToggleSave ? (
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold transition-colors hover:bg-canvas"
                onClick={() => {
                  close();
                  onToggleSave(analysis.id);
                }}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                {analysis.saved ? "Remove from Saved" : "Save"}
              </button>
            ) : null}
            {onRename ? (
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold transition-colors hover:bg-canvas"
                onClick={() => {
                  close();
                  onRename(analysis.id);
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Rename
              </button>
            ) : null}
            <button
              type="button"
              className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold transition-colors hover:bg-canvas"
              onClick={() => {
                close();
                void navigator.clipboard?.writeText(analysis.sourceText);
              }}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicate text
            </button>
            <button
              type="button"
              className="flex min-h-10 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left font-semibold text-critical transition-colors hover:bg-critical/10"
              onClick={() => {
                close();
                onDelete(analysis.id);
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <div className="relative inline-flex justify-end">
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        className="min-h-10 w-10 px-0"
        aria-label={`Open actions for ${analysis.title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </Button>
      {menu}
    </div>
  );
}
