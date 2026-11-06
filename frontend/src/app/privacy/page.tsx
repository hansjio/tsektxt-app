import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Privacy</p>
        <h1 className="mt-3 text-5xl font-black tracking-[0.015em]">Privacy and local data</h1>
        <Card className="mt-8 p-6">
          <p className="text-muted">
            Everything runs on this computer. Posts you check are sent only to the local model server (localhost). History, saved checks and feedback notes are stored only in this browser; delete them any time in Settings. No accounts, analytics or external AI services are used.
          </p>
          <p className="mt-4 text-muted">
            The first run downloads the three models from Hugging Face; after that no internet is needed.
          </p>
        </Card>
      </main>
    </div>
  );
}
