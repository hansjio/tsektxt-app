"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { AnalysisResults } from "@/components/results/AnalysisResults";
import { getAnalysis } from "@/lib/api/analysis";
import { Skeleton } from "@/components/states/Skeleton";
import type { AnalysisResult } from "@/types/analysis";

export default function SavedAnalysisPage() {
  const params = useParams() as { id: string };
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getAnalysis(params.id)
      .then(setAnalysis)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !analysis) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">Saved three-model check</p>
        <h1 className="mt-2 text-3xl font-bold">{analysis.title}</h1>
      </div>
      <AnalysisResults result={analysis} />
    </div>
  );
}
