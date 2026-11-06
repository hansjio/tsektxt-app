import { FileCheck2, Share2, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: FileCheck2,
    title: "Check official records",
    text: "Compare election-result claims with official election office updates.",
  },
  {
    icon: UserCheck,
    title: "Look for source context",
    text: "Confirm who posted it, when it was posted, and whether evidence is shown.",
  },
  {
    icon: Share2,
    title: "Pause before sharing",
    text: "Treat a not-credible verdict as a prompt to verify, not as a final verdict.",
  },
];

export function VerifyNextSteps() {
  return (
    <Card className="w-full p-4 text-left shadow-none sm:p-5">
      <div className="w-full space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex w-full items-start gap-3 rounded-[1.1rem] border border-white/80 bg-white/50 p-3 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-caution/10 text-caution">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted">{step.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
