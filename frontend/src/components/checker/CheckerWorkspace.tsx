"use client";

import { useEffect, useState } from "react";
import { FlaskConical, PanelRightClose, PanelRightOpen } from "lucide-react";
import { AnimatedToastStack, type AnimatedToast } from "@/components/beui/animated-toast-stack";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/beui/drawer";
import { AnalysisProgress } from "@/components/checker/AnalysisProgress";
import { TextAnalysisEditor } from "@/components/checker/TextAnalysisEditor";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { analyzeText } from "@/lib/api/analysis";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

function ResearchDemoBanner() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-caution/30 bg-caution/8 px-4 py-2.5 text-sm text-ink">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden="true" />
      <span className="text-muted">
        <strong className="text-ink">Research demo, not a fact-checker.</strong> Three real models run on this computer. Labels follow the source, models are single-seed, and they are not ranked. They were trained on long news articles, so short social posts are outside what they know: confidence can be high and still wrong, and a link in the text can change the result.
      </span>
    </div>
  );
}

function ExamplePicker({ shown, onPick }: { shown: number | null; onPick: (index: number) => void }) {
  const current = shown === null ? null : brand.examples[shown];
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm">
      <p className="font-semibold text-ink">Real example posts</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {brand.examples.map((ex, i) => (
          <Button key={ex.url} variant={shown === i ? "primary" : "secondary"} className="min-h-9 px-3 py-1.5" onClick={() => onPick(i)}>
            {ex.name}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-muted">
        {current ? (
          <>
            Real public post by {current.source}, 2022.{" "}
            <a className="underline" href={current.url} target="_blank" rel="noreferrer">
              Source link
            </a>
            . No label is claimed here.
          </>
        ) : (
          "Real public posts from news outlets and an official account, each with its source link. The Sample button loads invented test text."
        )}
      </p>
    </div>
  );
}

export function CheckerWorkspace({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultsOpen, setResultsOpen] = useState(true);
  const [resultDrawerOpen, setResultDrawerOpen] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [exampleShown, setExampleShown] = useState<number | null>(null);
  const [toasts, setToasts] = useState<AnimatedToast[]>([]);

  useEffect(() => {
    function handleDashboardDrawerOpen(event: Event) {
      const detail = (event as CustomEvent<{ drawer: string }>).detail;
      if (detail?.drawer !== "results") setResultDrawerOpen(false);
    }
    window.addEventListener("tsek:dashboard-drawer-open", handleDashboardDrawerOpen);
    return () => window.removeEventListener("tsek:dashboard-drawer-open", handleDashboardDrawerOpen);
  }, []);

  function updateResultDrawerOpen(open: boolean) {
    setResultDrawerOpen(open);
    if (open) window.dispatchEvent(new CustomEvent("tsek:dashboard-drawer-open", { detail: { drawer: "results" } }));
  }

  async function runAnalysis() {
    setError("");
    if (!text.trim()) {
      const message = "Paste a post first (or click Load sample).";
      setError(message);
      setToasts([{ id: "analysis-empty", title: "Nothing to check", description: message, status: "error", duration: 4200 }]);
      return;
    }
    setLoading(true);
    setToasts([{ id: "analysis-loading", title: "Running 3 models", description: "Predictions plus Integrated Gradients. This can take a moment on a CPU.", status: "loading", duration: 0 }]);
    try {
      const next = await analyzeText(text);
      setText(next.sourceText); // backend trims the text; keep highlight offsets aligned
      setResult(next);
      setToasts([{ id: `analysis-ready-${next.id}`, title: "Results ready", description: "Saved to History in this browser.", status: "success", duration: 4200 }]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Analysis failed.";
      setError(message);
      setToasts([{ id: "analysis-error", title: "Analysis failed", description: message, status: "error", duration: 5200 }]);
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setText(brand.samples[sampleIndex % brand.samples.length]);
    setResult(null);
    setError("");
    setToasts([{ id: "sample-loaded", title: "Sample loaded", description: "Invented test text, not a real post.", status: "success", duration: 3500 }]);
    setResultsOpen(true);
    setSampleIndex((i) => i + 1);
    setExampleShown(null);
  }

  function loadExample(index: number) {
    setText(brand.examples[index].text);
    setResult(null);
    setError("");
    setResultsOpen(true);
    setExampleShown(index);
  }

  function updateText(nextText: string) {
    setText(nextText);
    setExampleShown(null);
    setResult(null);
    setError("");
  }

  return (
    <div className={cn("relative grid gap-5", resultsOpen ? "xl:grid-cols-[minmax(560px,1fr)_440px]" : "xl:grid-cols-1")}>
      <AnimatedToastStack toasts={toasts} onDismiss={(id) => setToasts((items) => items.filter((t) => t.id !== id))} />
      <div className="absolute right-0 top-0 z-10 hidden xl:block">
        <Button
          variant="secondary"
          onClick={() => setResultsOpen((v) => !v)}
          aria-expanded={resultsOpen}
          aria-controls="analysis-result-sidebar"
          aria-label={resultsOpen ? "Hide result panel" : "Show result panel"}
          className="min-h-10 w-10 px-0"
          title={resultsOpen ? "Hide result panel" : "Show result panel"}
        >
          {resultsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute -top-3 right-0 z-10 xl:hidden">
        <Drawer open={resultDrawerOpen} onOpenChange={updateResultDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="secondary" aria-label="Show results" className="min-h-10 gap-2 px-3" title="Show results">
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Results</span>
              {result ? (
                <span className="absolute -right-1 -top-1 flex h-3 w-3" aria-label="New results available">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical/50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-critical" />
                </span>
              ) : null}
            </Button>
          </DrawerTrigger>
          <DrawerContent side="right" size="min(92vw,32rem)" className="z-[90] px-4">
            <DrawerHeader className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle>Analysis results</DrawerTitle>
                <DrawerDescription>Three verdicts, highlights and explanations</DrawerDescription>
              </div>
              <DrawerClose aria-label="Close results" />
            </DrawerHeader>
            <div className="result-scrollbar min-h-0 flex-1 overflow-y-auto py-4">
              <ResultPanelContent loading={loading} error={error} result={result} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-4 pt-10 xl:pt-0">
        <ResearchDemoBanner />
        <ExamplePicker shown={exampleShown} onPick={loadExample} />
        <TextAnalysisEditor value={text} onChange={updateText} onAnalyze={() => void runAnalysis()} onLoadSample={loadSample} loading={loading} result={result} />
      </div>
      {resultsOpen ? (
        <aside
          id="analysis-result-sidebar"
          className="result-scrollbar hidden space-y-4 xl:-my-6 xl:sticky xl:top-0 xl:block xl:h-[calc(100vh+3rem)] xl:overflow-auto xl:border-l xl:border-border/70 xl:bg-white xl:px-4 xl:py-5"
          aria-label="Result panel"
        >
          <ResultPanelContent loading={loading} error={error} result={result} />
        </aside>
      ) : null}
    </div>
  );
}

function ResultPanelContent({ loading, error, result }: { loading: boolean; error: string; result: AnalysisResult | null }) {
  return (
    <div className="space-y-4">
      {loading ? <AnalysisProgress /> : null}
      {error ? <ErrorState title="Analysis could not finish" description={error} /> : null}
      {!loading && !error && result ? (
        <AnalysisResults result={result} />
      ) : !loading && !error ? (
        <EmptyState title="Add a post to see results" description="Paste a Taglish election post (or load a dummy one), then run the check to see all three verdicts and highlighted words." />
      ) : null}
    </div>
  );
}
