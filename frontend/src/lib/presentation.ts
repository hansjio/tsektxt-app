import type { AnalysisResult, AnalysisStatus } from "@/types/analysis";

// Labels follow the thesis: credible / not credible. "Models disagree" when the three do not all agree.
// No combined score: the three models are shown side by side and never ranked.
export type ResultLevel = "credible" | "mixed" | "not_credible";

export interface ResultPresentation {
  level: ResultLevel;
  label: string;
  tone: "calm" | "warning" | "severe";
  interpretation: string;
}

export function getPresentation(result: Pick<AnalysisResult, "status" | "notCredibleVotes">): ResultPresentation {
  if (result.status === "credible") {
    return {
      level: "credible",
      label: "All 3 models: credible",
      tone: "calm",
      interpretation: "All three models labelled this post credible. That only means it resembles posts the sources labelled credible; it does not prove the claim is true.",
    };
  }
  if (result.status === "not_credible") {
    return {
      level: "not_credible",
      label: "All 3 models: not credible",
      tone: "severe",
      interpretation: "All three models labelled this post not credible, i.e. it resembles posts that fact-checkers labelled false or misleading. Verify with official sources before sharing.",
    };
  }
  return {
    level: "mixed",
    label: "Models disagree",
    tone: "warning",
    interpretation: `${result.notCredibleVotes} of 3 models labelled this post not credible. Disagreement is a reason to check the claim yourself; no model here counts as the tie-breaker.`,
  };
}

/** Highlight colour for an IG score, scaled to that model's largest |score|. Red = toward not credible. */
export function igColor(attr: number | null, maxAbs: number) {
  if (attr === null || maxAbs === 0) return undefined;
  const strength = Math.min(Math.abs(attr) / maxAbs, 1);
  if (strength < 0.08) return undefined;
  const rgb = attr > 0 ? "219,74,92" : "13,143,119";
  return `rgba(${rgb},${(0.12 + 0.55 * strength).toFixed(2)})`;
}

export function getStatusLabel(status: AnalysisStatus, notCredibleVotes = 0) {
  return getPresentation({ status, notCredibleVotes }).label;
}
