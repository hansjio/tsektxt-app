import { Card } from "@/components/ui/card";
import type { HighlightedSpan, ModelResult } from "@/types/analysis";

/** Strongest Integrated Gradients words per model. */
export function FactorList({ spans, models }: { spans: HighlightedSpan[]; models: ModelResult[] }) {
  return (
    <Card className="w-full p-4 text-left shadow-none sm:p-5">
      <div className="grid w-full gap-4">
        {models.map((m) => {
          const own = spans.filter((s) => s.model === m.key);
          return (
            <section key={m.key} aria-label={`Top words for ${m.name}`}>
              <h3 className="text-sm font-semibold">{m.name}</h3>
              {own.length === 0 ? (
                <p className="mt-1 text-xs text-muted">No word stood out.</p>
              ) : (
                <ol className="mt-2 flex flex-wrap gap-2">
                  {own.map((s) => (
                    <li
                      key={s.id}
                      className={`rounded-full border px-2.5 py-1 text-xs ${s.direction === "not_credible" ? "border-critical/30 bg-critical/10" : "border-credible/30 bg-credible/10"}`}
                      title={s.explanation}
                    >
                      #{s.rank} {s.text} <span className="text-muted">{s.attribution >= 0 ? "+" : ""}{s.attribution.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
        <p className="text-xs text-muted">Positive = pushed toward not credible. These are what each model relied on, not evidence that a claim is false.</p>
      </div>
    </Card>
  );
}
