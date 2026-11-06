import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MethodologyContent } from "@/components/MethodologyContent";

export default function MethodologyPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Methodology</p>
        <h1 className="mt-3 text-5xl font-black tracking-[0.015em]">Plain-language explanation</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          A research demo of the TsekTxt thesis: Taglish election misinformation detection with RoBERTa-Tagalog, mBERT and XLM-RoBERTa, explained with Integrated Gradients.
        </p>
        <MethodologyContent />
      </main>
    </div>
  );
}
