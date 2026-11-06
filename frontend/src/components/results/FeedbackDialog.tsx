"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { sendFeedback } from "@/lib/api/analysis";
import type { AnalysisStatus } from "@/types/analysis";

const schema = z.object({
  correctedLabel: z.union([z.enum(["credible", "not_credible", "uncertain"]), z.literal("")]).optional(),
  note: z.string().max(500).optional(),
});

type FeedbackForm = z.infer<typeof schema>;

export function FeedbackDialog({ analysisId }: { analysisId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, formState } = useForm<FeedbackForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function quickFeedback(helpful: boolean) {
    await sendFeedback(analysisId, { helpful });
    setMessage(helpful ? "Thanks. Marked as helpful." : "Thanks. Marked as not helpful.");
  }

  async function onSubmit(values: FeedbackForm) {
    await sendFeedback(analysisId, {
      correctedLabel: values.correctedLabel === "" ? undefined : (values.correctedLabel as AnalysisStatus | undefined),
      note: values.note,
    });
    setMessage("Saved in this browser only (nothing is sent anywhere).");
    reset();
    setOpen(false);
  }

  const dialog = open
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.25rem] border border-white/75 bg-white shadow-soft sm:max-h-[min(38rem,calc(100dvh-3rem))]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
              <div>
                <h3 id="feedback-title" className="text-lg font-semibold">Report an incorrect result</h3>
                <p className="mt-1 text-sm text-muted">Your note is stored only in this browser. It is not sent to the research team.</p>
              </div>
              <button
                type="button"
                aria-label="Close feedback dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl leading-none text-muted transition-colors hover:bg-canvas hover:text-ink"
                onClick={() => setOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="result-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <label className="block text-sm font-medium" htmlFor="correctedLabel">Optional corrected label</label>
              <select
                id="correctedLabel"
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-ink"
                {...register("correctedLabel")}
              >
                <option value="">No label selected</option>
                <option value="credible">Likely credible</option>
                <option value="not_credible">Likely not credible</option>
                <option value="uncertain">Needs more context</option>
              </select>

              <label className="mt-4 block text-sm font-medium" htmlFor="note">Optional note</label>
              <textarea
                id="note"
                rows={5}
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-border bg-canvas p-3 text-sm text-ink"
                placeholder="Add a short note about what should be corrected."
                {...register("note")}
              />
              {formState.errors.note ? <p className="mt-2 text-sm text-critical">{formState.errors.note.message}</p> : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/70 bg-white/95 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={formState.isSubmitting}>Save note</Button>
            </div>
          </form>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-white p-4">
      <h2 className="font-semibold">Was this result useful?</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void quickFeedback(true)}>Helpful</Button>
        <Button variant="secondary" onClick={() => void quickFeedback(false)}>Not helpful</Button>
        <Button variant="ghost" onClick={() => setOpen(true)}>Report an incorrect result</Button>
      </div>
      {message ? <p className="mt-3 text-sm text-credible" role="status">{message}</p> : null}
      {dialog}
    </div>
  );
}
