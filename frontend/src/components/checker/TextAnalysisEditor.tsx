"use client";

import { Eye, EyeOff, FileText, RotateCcw, Trash2 } from "lucide-react";
import { type DragEvent, type ChangeEvent, useMemo, useRef, useState } from "react";
import { OverflowActions } from "@/components/beui/overflow-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/beui/tabs";
import { countWords } from "@/lib/utils";
import { InlineHighlightedText } from "@/components/results/InlineHighlightedText";
import type { AnalysisResult } from "@/types/analysis";
import { SHORT_POST_WORDS } from "@/lib/reliability";

export function TextAnalysisEditor({
  value,
  onChange,
  onAnalyze,
  onLoadSample,
  loading,
  result,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onLoadSample: () => void;
  loading: boolean;
  result?: AnalysisResult | null;
}) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modelKey, setModelKey] = useState("");
  const [highlightMode, setHighlightMode] = useState<"before" | "after">("after");
  const [actionsOpen, setActionsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => countWords(value), [value]);
  // About 90% of the training articles had 100+ words (THESIS_INPUTS section 2), so shorter posts are outside what the models saw.
  const tooShort = words > 0 && words < SHORT_POST_WORDS;

  const uploadAccept = ".txt";
  const uploadDescription = "Attach a plain-text (.txt) file with one post.";
  const UploadIcon = FileText;
  const shownModel = result?.models.find((m) => m.key === modelKey) ?? result?.models[0];

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setUploadMessage("Unsupported file. Use a .txt file (or paste the text).");
      return;
    }
    setUploadMessage(`Loaded ${file.name}.`);
    void file.text().then((content) => onChange(content));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-white p-4 sm:p-5" aria-labelledby="editor-heading">
      <div className="flex flex-col items-center gap-3 text-center">
        <div>
          <h1 id="editor-heading" className="text-2xl font-black tracking-[0.015em] sm:text-3xl">Check Taglish content</h1>
          <p className="mt-1 text-sm text-muted">Paste a Taglish election-related post. RoBERTa-Tagalog, mBERT and XLM-RoBERTa each give a verdict, with Integrated Gradients highlights.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-between">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          {result ? (
            <Tabs value={shownModel?.key ?? ""} onValueChange={setModelKey}>
              <TabsList aria-label="Model whose highlights are shown">
                {result.models.map((m) => (
                  <TabsTrigger key={m.key} value={m.key} className="min-h-10 px-3 text-xs sm:px-4">
                    {m.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <span className="text-xs text-muted">Highlights appear here after the check.</span>
          )}
          {result ? (
            <Tabs value={highlightMode} onValueChange={(next) => setHighlightMode(next as "before" | "after")}>
              <TabsList aria-label="Highlight mode">
                <TabsTrigger value="before" className="min-h-10 px-3 sm:px-4">
                  <EyeOff className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Before</span>
                </TabsTrigger>
                <TabsTrigger value="after" className="min-h-10 px-3 sm:px-4">
                  <Eye className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">After</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}
        </div>
        <div className="sm:hidden">
          <OverflowActions
            expanded={actionsOpen}
            onExpandedChange={setActionsOpen}
            primaryActions={[
              {
                id: "load-sample",
                label: "Sample",
                icon: <RotateCcw className="h-4 w-4" aria-hidden="true" />,
                onClick: onLoadSample,
                ariaLabel: "Load sample",
              },
            ]}
            overflowActions={[
              {
                id: "clear",
                label: "Clear",
                icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                onClick: () => onChange(""),
                disabled: !value,
                ariaLabel: "Clear",
              },
              {
                id: "upload",
                label: "File",
                icon: <UploadIcon className="h-4 w-4" aria-hidden="true" />,
                onClick: () => fileRef.current?.click(),
                ariaLabel: "Upload file",
              },
            ]}
          />
        </div>
      </div>
          <div className="relative mt-4">
            <div className="absolute right-4 top-4 z-10 hidden flex-wrap justify-end gap-2 sm:flex">
              <Button variant="secondary" className="min-h-9 px-3 py-1.5" onClick={onLoadSample}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Load sample
              </Button>
              <Button variant="ghost" className="min-h-9 px-3 py-1.5" onClick={() => onChange("")} disabled={!value}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
            {result && highlightMode === "after" ? (
              <InlineHighlightedText
                text={value}
                spans={result.highlightedSpans.filter((sp) => sp.model === shownModel?.key)}
                modelName={shownModel?.name}
                onChange={onChange}
                className="max-h-[300px] min-h-[240px] w-full overflow-y-auto rounded-[1.5rem] border border-border bg-white p-5 pt-5 text-ink sm:max-h-none sm:min-h-[360px] sm:pt-16"
              />
            ) : (
              <textarea
                aria-describedby="editor-help editor-count"
                className="max-h-[300px] min-h-[240px] w-full resize-y rounded-[1.5rem] border border-border bg-white p-5 pt-5 leading-7 text-ink transition placeholder:text-muted focus:border-primary sm:max-h-none sm:min-h-[360px] sm:pt-16"
                placeholder="Paste a Taglish election-related post, caption, or thread excerpt..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                readOnly={Boolean(result && highlightMode === "before")}
              />
            )}
          </div>
      <div id="editor-count" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{words} words - {value.length} characters</span>
        <span id="editor-help">{tooShort ? "Under 100 words: shorter than most training articles, so verdicts are less reliable." : "Models read the first 128 tokens."}</span>
      </div>
      <div className="mt-4 flex justify-center sm:mt-5">
        <Button onClick={onAnalyze} disabled={loading || value.trim().length === 0} className="w-full sm:w-auto sm:min-w-56">
          {loading ? "Running 3 models..." : "Check with all three models"}
        </Button>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-4 hidden rounded-[1.25rem] border border-dashed p-4 text-sm transition sm:block ${dragging ? "border-primary bg-white/70" : "border-white/80 bg-white/45"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UploadIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-xs text-muted">{uploadDescription}</p>
          </div>
          <input ref={fileRef} type="file" accept={uploadAccept} className="sr-only" onChange={onFileChange} aria-label="Upload text file" />
          <Button variant="secondary" className="whitespace-nowrap hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white" onClick={() => fileRef.current?.click()}>
            <UploadIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload file
          </Button>
        </div>
        {uploadMessage ? <p className="mt-3 text-sm text-primary" role="status">{uploadMessage}</p> : null}
      </div>
    </section>
  );
}
