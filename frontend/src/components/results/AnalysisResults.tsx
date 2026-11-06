import { FactorList } from "@/components/results/FactorList";
import { FeedbackDialog } from "@/components/results/FeedbackDialog";
import { HighlightedText } from "@/components/results/HighlightedText";
import { ModelComparison } from "@/components/results/ModelComparison";
import { ResponsibleUseNotice } from "@/components/results/ResponsibleUseNotice";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { ResultAccordion } from "@/components/results/ResultAccordion";
import { VerifyNextSteps } from "@/components/results/VerifyNextSteps";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisResults({ result, summaryVariant = "default" }: { result: AnalysisResult; summaryVariant?: "default" | "plain" }) {
  return (
    <section className="space-y-4" aria-label="Analysis results">
      <ResultSummaryCard result={result} variant={summaryVariant} />
      <ResultAccordion title="Responsible use" description="What this research demo can and cannot do" defaultOpen>
        <ResponsibleUseNotice />
      </ResultAccordion>
      <ResultAccordion title="Highlighted source text" description="Integrated Gradients words, one model at a time" defaultOpen>
        <HighlightedText text={result.sourceText} spans={result.highlightedSpans} models={result.models} />
      </ResultAccordion>
      <ResultAccordion title="Key words per model" description="Strongest Integrated Gradients words">
        <FactorList spans={result.highlightedSpans} models={result.models} />
      </ResultAccordion>
      <ResultAccordion title="Three-model comparison" description="Probabilities and full word shading, side by side">
        <ModelComparison models={result.models} igSteps={result.igSteps} maxLength={result.maxLength} />
      </ResultAccordion>
      <ResultAccordion title="Verify next steps" description="Actions to take before sharing">
        <VerifyNextSteps />
      </ResultAccordion>
      <ResultAccordion title="Feedback" description="Your notes, saved only in this browser">
        <FeedbackDialog analysisId={result.id} />
      </ResultAccordion>
    </section>
  );
}
