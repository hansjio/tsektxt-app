import { AlertTriangle, SearchCheck, ShieldQuestion } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getPresentation, type ResultPresentation } from "@/lib/presentation";
import { countPostWords, SHORT_POST_WORDS } from "@/lib/reliability";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

const iconMap: Record<ResultPresentation["tone"], typeof SearchCheck> = {
  calm: SearchCheck,
  warning: ShieldQuestion,
  severe: AlertTriangle,
};

const toneClass: Record<ResultPresentation["tone"], string> = {
  calm: "text-credible bg-credible/10",
  warning: "text-caution bg-caution/10",
  severe: "text-critical bg-critical/10",
};

const headerClass: Record<ResultPresentation["level"], string> = {
  credible: "border-credible/15 bg-gradient-to-r from-[#d7ecff] via-[#eef7ff] to-white text-ink",
  mixed: "border-caution/20 bg-gradient-to-r from-[#ffe69a] via-[#fff4ce] to-white text-ink",
  not_credible: "border-critical/20 bg-gradient-to-r from-[#ffd6d8] via-[#ffebec] to-white text-ink",
};

const illustrationMap: Record<ResultPresentation["level"], string> = {
  credible: "/result-illustrations/not-suspicious.svg",
  mixed: "/result-illustrations/likely-suspicious.svg",
  not_credible: "/result-illustrations/suspicious.svg",
};

export function ResultSummaryCard({ result, variant = "default" }: { result: AnalysisResult; variant?: "default" | "plain" }) {
  const p = getPresentation(result);
  const Icon = iconMap[p.tone];
  const words = countPostWords(result.sourceText);
  const low = words > 0 && words < SHORT_POST_WORDS;
  const agree = result.notCredibleVotes === 0 || result.notCredibleVotes === result.models.length;

  return (
    <Card className="overflow-hidden bg-white p-0 shadow-none backdrop-blur-0">
      <div className={variant === "plain" ? "border-b border-border bg-white px-5 py-5 text-ink" : `relative min-h-28 overflow-hidden border-b px-5 py-4 ${headerClass[p.level]}`}>
        <div className="relative z-10 grid min-h-20 grid-cols-[minmax(0,1fr)_92px] items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Three-model result</p>
            <h2 className="mt-2 text-[25px] font-black leading-[0.98] tracking-[0.015em]">{p.label}</h2>
          </div>
          {variant === "plain" ? null : (
            <span className="relative h-24 w-[92px] overflow-hidden" aria-hidden="true">
              <Image src={illustrationMap[p.level]} alt="" fill sizes="92px" className="scale-125 object-contain object-center" />
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        {low ? (
          <div role="note" className="mb-5 rounded-xl border border-caution/30 bg-caution/10 p-4 text-sm leading-relaxed">
            <p className="font-semibold text-ink">Low reliability: this post has {words} words</p>
            <p className="mt-1 text-muted">
              The models were trained on news articles that were mostly {SHORT_POST_WORDS}+ words long. On short posts they often lean
              &quot;not credible&quot; even when a post is accurate. The percentages are calibrated on news articles, so on a post this short they can still be too high. Treat the verdicts below
              as weak signals. To check the claim, look it up on a fact-checking site; if this post links to a longer article, checking that
              full text gives the models more to work with.
            </p>
          </div>
        ) : null}
        <div className="flex items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[p.tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">Classifier verdicts</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.interpretation}</p>
          </div>
        </div>
        <ul className={`mt-5 space-y-3 ${low ? "opacity-60" : ""}`} aria-label={low ? "Verdict per model (low reliability)" : "Verdict per model"}>
          {result.models.map((m) => (
            <li key={m.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold">{m.name}</span>
                <span className={m.label === "not_credible" ? "font-semibold text-critical" : "font-semibold text-credible"}>
                  {m.label === "not_credible" ? "Not credible" : "Credible"} · {(m.prob_not_credible * 100).toFixed(1)}% not credible
                </span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div className="bg-credible" style={{ width: `${m.prob_credible * 100}%` }} />
                <div className="bg-critical" style={{ width: `${m.prob_not_credible * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-5 grid gap-3 rounded-xl border border-border bg-canvas p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Models saying not credible</dt>
            <dd className="font-semibold">{result.notCredibleVotes} of 3</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Agreement</dt>
            <dd className="font-semibold">{agree ? "All three agree" : "Models disagree (weak signal)"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Post length</dt>
            <dd className="font-semibold">{words} words {low ? "(low reliability)" : ""}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Analysis ID</dt>
            <dd className="font-mono text-xs">{result.id.slice(0, 8)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Timestamp</dt>
            <dd>{formatDate(result.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
