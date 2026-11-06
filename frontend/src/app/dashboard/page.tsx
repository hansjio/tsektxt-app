"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/states/Skeleton";
import { dashboardStats } from "@/config/navigation";
import { getAnalyses } from "@/lib/api/analysis";
import { getStatusLabel } from "@/lib/presentation";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: analyses.length,
    credible: analyses.filter((item) => item.status === "credible").length,
    notCredible: analyses.filter((item) => item.status === "not_credible").length,
    uncertain: analyses.filter((item) => item.status === "uncertain").length,
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-xl sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Demo dashboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.015em]">Welcome back.</h1>
          <p className="mt-2 text-muted">Start a new three-model check or revisit recent results.</p>
        </div>
        <ButtonLink href="/dashboard/checker" className="w-full gap-2 whitespace-nowrap sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          New analysis
        </ButtonLink>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        {dashboardStats.map((stat) => {
          return (
            <Card key={stat.key} className="min-h-32 p-3 sm:p-5">
              <Image src={stat.imageSrc} alt="" width={48} height={48} className="h-11 w-11 object-contain sm:h-12 sm:w-12" aria-hidden="true" />
              <p className="mt-3 text-sm leading-snug text-muted sm:mt-4">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold sm:mt-2">{counts[stat.key as keyof typeof counts]}</p>
            </Card>
          );
        })}
      </section>
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Recent analyses</h2>
          <Link href="/dashboard/history" className="text-sm font-semibold text-primary hover:text-ink">
            View history
          </Link>
        </div>
        <div className="grid gap-3">
          {analyses.slice(0, 4).map((analysis) => (
            <Link key={analysis.id} href={`/dashboard/history/${analysis.id}`} className="rounded-[1.25rem] border border-white/70 bg-white/68 p-4 shadow-sm transition hover:bg-white/90">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{analysis.title}</p>
                  <p className="text-sm text-muted">{formatDate(analysis.createdAt)}</p>
                </div>
                <span className="text-sm font-semibold">{getStatusLabel(analysis.status, analysis.notCredibleVotes)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
