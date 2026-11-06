import { igColor } from "@/lib/presentation";
import type { ModelResult } from "@/types/analysis";

/** Side-by-side detail for the three models: probabilities and every word shaded by its IG score. */
export function ModelComparison({ models, igSteps, maxLength }: { models: ModelResult[]; igSteps: number; maxLength: number }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        The three models are shown side by side and are not ranked. RoBERTa-Tagalog vs XLM-RoBERTa was not statistically significant, and each model was trained once (single seed).
      </p>
      {models.map((m) => {
        const maxAbs = Math.max(0, ...m.words.map((w) => Math.abs(w.attr ?? 0)));
        return (
          <article key={m.key} className="rounded-xl border border-border bg-white p-3">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-sm">
              <span className="font-semibold">{m.name}</span>
              <span className="font-semibold text-muted">
                P(credible) {(m.prob_credible * 100).toFixed(1)}% · P(not credible) {(m.prob_not_credible * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <div className="bg-credible" style={{ width: `${m.prob_credible * 100}%` }} />
              <div className="bg-critical" style={{ width: `${m.prob_not_credible * 100}%` }} />
            </div>
            <p className="mt-3 rounded-lg bg-canvas p-2 text-sm leading-7">
              {m.words.map((w, i) => (
                <span key={i}>
                  <span
                    className="rounded px-0.5"
                    style={{ backgroundColor: igColor(w.attr, maxAbs) }}
                    title={w.attr === null ? `cut off (over ${maxLength} tokens)` : `IG ${w.attr.toFixed(3)}`}
                  >
                    {w.word}
                  </span>{" "}
                </span>
              ))}
            </p>
            {m.truncated ? <p className="mt-2 text-xs text-caution">Longer than {maxLength} tokens: the end was cut off and not scored.</p> : null}
            <p className={`mt-2 text-xs ${m.completeness_rel_error > 0.05 ? "text-caution" : "text-muted"}`}>
              IG completeness error {(m.completeness_rel_error * 100).toFixed(1)}% ({m.ig_steps} steps)
              {m.completeness_rel_error > 0.05 ? " (above 5%: treat these highlights as rough)" : ""}
            </p>
          </article>
        );
      })}
      <p className="rounded-[1rem] bg-canvas p-3 text-xs text-muted">
        Red = pushes toward not credible, teal = toward credible; darker = stronger, scaled per model. Captum Integrated Gradients, starting at {igSteps} steps and doubling until the completeness error is at most 5%; max length {maxLength}.
      </p>
    </div>
  );
}
