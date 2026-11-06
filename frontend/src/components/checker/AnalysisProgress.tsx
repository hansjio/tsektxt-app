const steps = ["Running three classifiers", "Computing Integrated Gradients", "Preparing highlights"];

export function AnalysisProgress() {
  return (
    <div className="rounded-[1.5rem] border border-border bg-surface p-5" role="status" aria-live="polite">
      <p className="font-semibold">Running three models...</p>
      <p className="mt-1 text-sm text-muted">Predictions plus Integrated Gradients for RoBERTa-Tagalog, mBERT and XLM-RoBERTa.</p>
      <div className="mt-4 space-y-3" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-[1.25rem] bg-canvas" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-border" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-border" />
        <div className="grid gap-2">
          <div className="h-12 animate-pulse rounded-xl bg-canvas" />
          <div className="h-12 animate-pulse rounded-xl bg-canvas" />
        </div>
      </div>
      <ol className="sr-only">
        {steps.map((step, index) => (
          <li key={step}>{index + 1}. {step}</li>
        ))}
      </ol>
    </div>
  );
}
