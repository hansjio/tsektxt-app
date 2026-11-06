import Link from "next/link";
import { ArrowRight, BrainCircuit, Languages, SearchCheck, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";

const sections = [
  {
    icon: SearchCheck,
    title: "What the checker does",
    text: "Three fine-tuned classifiers label a Taglish election post as credible or not credible. Labels follow the source (fact-checkers and news outlets), so a verdict says how a post resembles what those sources labelled. It does not verify the claim itself.",
  },
  {
    icon: Languages,
    title: "What Taglish means here",
    text: "Filipino-English code-mixed language common in social posts, captions and comment threads.",
  },
  {
    icon: BrainCircuit,
    title: "Three models, not ranked",
    text: "RoBERTa-Tagalog, mBERT and XLM-RoBERTa, each fine-tuned once (single seed) and read up to 128 tokens. The difference between RoBERTa-Tagalog and XLM-RoBERTa was not statistically significant (McNemar p = 0.55), so the demo shows all three side by side and never picks a winner.",
  },
  {
    icon: ShieldQuestion,
    title: "How the highlights are made",
    text: "Integrated Gradients (Captum) scores each word: positive = pushed the model toward not credible, negative = toward credible. It shows what a model relied on, not whether the post is false.",
  },
];

const steps = [
  ["Input text", "You paste a post. Each model reads its first 128 tokens."],
  ["Three classifications", "Each model returns credible / not credible with probabilities. Not credible is the positive class."],
  ["Word attributions", "Integrated Gradients highlights the words each model leaned on; a completeness check flags rough results."],
];

export function MethodologyContent({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className={compact ? "grid gap-3 md:grid-cols-2" : "mt-10 grid gap-4 md:grid-cols-2"}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-5">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-muted">{section.text}</p>
            </Card>
          );
        })}
      </div>
      <section className="mt-10 rounded-[1.75rem] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur">
        <h2 className="text-2xl font-semibold">How a result should be read</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <div key={title} className="rounded-[1.25rem] bg-white/55 p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-semibold text-white">{index + 1}</span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-6 rounded-[1.75rem] border border-caution/30 bg-caution/5 p-6">
        <h2 className="text-xl font-semibold">Limits</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Single training seed per model; verdicts and highlights can change with another seed.</li>
          <li>Trained on long news articles (about 90% had 100 words or more). Short social posts are outside that range, so verdicts on them are less reliable and confidence can be high and still wrong.</li>
          <li>Labels come from the sources, so the models learn source style as well as content.</li>
          <li>No external AI service is used; there is no generated explanation text.</li>
        </ul>
      </section>
      <Link href="/checker" className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
        Open the checker <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Link>
    </>
  );
}
