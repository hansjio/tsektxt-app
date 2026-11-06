import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { CheckerWorkspace } from "@/components/checker/CheckerWorkspace";

export default function PublicCheckerPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CheckerWorkspace />
      </main>
    </div>
  );
}
