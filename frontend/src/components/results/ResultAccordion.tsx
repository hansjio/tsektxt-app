import { BouncyAccordion } from "@/components/beui/bouncy-accordion";
import type { ReactNode } from "react";

export function ResultAccordion({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <BouncyAccordion title={title} description={description} defaultOpen={defaultOpen}>
      {children}
    </BouncyAccordion>
  );
}
