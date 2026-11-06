"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Skeleton } from "@/components/states/Skeleton";
import { HistoryCard } from "@/components/history/HistoryCard";
import { HistoryTable } from "@/components/history/HistoryTable";
import { deleteAnalysis, getAnalyses, renameAnalysis, setSaved } from "@/lib/api/analysis";
import type { AnalysisResult, AnalysisStatus } from "@/types/analysis";

type Sort = "newest" | "oldest" | "confidence";
type Filter = "all" | AnalysisStatus;

export function HistoryClient({ savedOnly = false }: { savedOnly?: boolean }) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getAnalyses()
      .then(setAnalyses)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load history."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return analyses
      .filter((item) => !savedOnly || item.saved)
      .filter((item) => filter === "all" || item.status === filter)
      .filter((item) => item.title.toLowerCase().includes(lower) || item.sourceText.toLowerCase().includes(lower))
      .sort((a, b) => {
        if (sort === "confidence") return b.notCredibleVotes - a.notCredibleVotes;
        const delta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "newest" ? delta : -delta;
      });
  }, [analyses, filter, query, sort, savedOnly]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteAnalysis(pendingDelete);
    setAnalyses((items) => items.filter((item) => item.id !== pendingDelete));
    setPendingDelete(null);
    setNotice("Analysis deleted from this browser.");
  }

  async function toggleSave(id: string) {
    const existing = analyses.find((item) => item.id === id);
    if (!existing) return;
    await setSaved(id, !existing.saved);
    setAnalyses((items) => items.map((item) => (item.id === id ? { ...item, saved: !existing.saved } : item)));
    setNotice(existing.saved ? "Removed from Saved." : "Added to Saved.");
  }

  async function rename(id: string) {
    const existing = analyses.find((item) => item.id === id);
    if (!existing) return;
    const newTitle = `${existing.title} (renamed)`;
    await renameAnalysis(id, newTitle);
    setAnalyses((items) => items.map((item) => (item.id === id ? { ...item, title: newTitle } : item)));
    setNotice("Analysis renamed.");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) return <ErrorState title="History unavailable" description={error} />;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card className="grid grid-cols-2 gap-2 p-3 md:grid-cols-[1fr_145px_130px]">
        <label className="col-span-2 text-xs font-medium md:col-span-1">
          Search
          <input className="mt-1.5 min-h-9 w-full rounded-full border border-white/80 bg-white/65 px-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or excerpt" />
        </label>
        <label className="text-xs font-medium">
          Result
          <select className="mt-1.5 min-h-9 w-full rounded-full border border-white/80 bg-white/65 px-3 text-sm" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
            <option value="all">All results</option>
            <option value="credible">All 3: credible</option>
            <option value="not_credible">All 3: not credible</option>
            <option value="uncertain">Models disagree</option>
          </select>
        </label>
        <label className="text-xs font-medium">
          Sort
          <select className="mt-1.5 min-h-9 w-full rounded-full border border-white/80 bg-white/65 px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="confidence">Most models not credible</option>
          </select>
        </label>
      </Card>
      {notice ? <p className="text-sm text-credible" role="status">{notice}</p> : null}
      {filtered.length === 0 ? (
        <EmptyState title="No analyses found" description="Try another search or result filter." />
      ) : (
        <>
          <HistoryTable analyses={filtered} onDelete={setPendingDelete} onRename={rename} onToggleSave={toggleSave} />
          <div className="grid gap-3 md:hidden">
            {filtered.map((analysis) => (
              <HistoryCard key={analysis.id} analysis={analysis} onDelete={setPendingDelete} onRename={rename} onToggleSave={toggleSave} />
            ))}
          </div>
        </>
      )}
      {pendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <Card className="max-w-sm p-5">
            <h2 id="delete-title" className="text-lg font-semibold">Delete analysis?</h2>
            <p className="mt-2 text-sm text-muted">This removes the check from this browser's history.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => void confirmDelete()}>Delete</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
