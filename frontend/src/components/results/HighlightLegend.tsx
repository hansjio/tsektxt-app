export function HighlightLegend() {
  return (
    <div className="flex w-full flex-wrap justify-start gap-3 text-xs text-muted" aria-label="Highlight legend">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded border border-critical/35 bg-critical/20" aria-hidden="true" /> Pushes toward not credible
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded border border-credible/35 bg-credible/20" aria-hidden="true" /> Pushes toward credible
      </span>
      <span>Integrated Gradients, top words per model</span>
    </div>
  );
}
