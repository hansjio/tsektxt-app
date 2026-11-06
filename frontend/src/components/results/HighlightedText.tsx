"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/beui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HighlightedSpan, ModelResult } from "@/types/analysis";
import { HighlightLegend } from "./HighlightLegend";
import { InlineHighlightedText } from "./InlineHighlightedText";

export function HighlightedText({ text, spans, models }: { text: string; spans: HighlightedSpan[]; models: ModelResult[] }) {
  const [showAll, setShowAll] = useState(false);
  const [modelKey, setModelKey] = useState(models[0]?.key ?? "");
  const current = models.find((m) => m.key === modelKey);
  const own = spans.filter((s) => s.model === modelKey);

  return (
    <Card className="w-full p-3 text-left shadow-none sm:p-5">
      <Tabs value={modelKey} onValueChange={setModelKey}>
        <TabsList aria-label="Model whose highlights are shown" className="mb-3 flex-wrap">
          {models.map((m) => (
            <TabsTrigger key={m.key} value={m.key} className="min-h-9 px-3 text-xs">
              {m.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <InlineHighlightedText
        text={text}
        spans={own}
        modelName={current?.name}
        className="w-full rounded-[1.25rem] border border-white/80 bg-white/55 p-4 text-left shadow-inner max-sm:-mx-1 max-sm:w-[calc(100%+0.5rem)]"
      />
      <div className="mt-4 flex w-full flex-col items-start gap-3">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-muted">Select a marked word to see its Integrated Gradients score for this model.</p>
          <Button type="button" variant="secondary" className="min-h-9 shrink-0 px-3 py-1.5 text-xs" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            <ListChecks className="mr-2 h-4 w-4" aria-hidden="true" />
            {showAll ? "Hide all words" : "See all words"}
          </Button>
        </div>
        <HighlightLegend />
      </div>
      {showAll ? (
        <div className="mt-4 grid gap-3" aria-label="All highlighted words">
          {own.map((span) => (
            <article key={span.id} className="rounded-[1rem] border border-border/70 bg-white/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">#{span.rank} {span.text}</h3>
                <span className="rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">{Math.round(span.weight * 100)}% weight</span>
              </div>
              <p className="mt-2 text-sm text-muted">{span.explanation}</p>
            </article>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
