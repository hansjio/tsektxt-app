import Link from "next/link";
import { Info } from "lucide-react";
import { brand } from "@/config/brand";

export function ResponsibleUseNotice() {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-white p-4 text-sm">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-muted">
          {brand.disclaimer}{" "}
          <Link href="/methodology" className="font-semibold text-primary underline underline-offset-4">
            Read methodology
          </Link>
        </p>
      </div>
    </div>
  );
}
