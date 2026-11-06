import { HistoryClient } from "@/components/history/HistoryClient";

export default function SavedPage() {
  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-bold">Saved analyses</h1>
        <p className="mt-2 text-muted">Checks you saved (menu → Save in History). Stored only in this browser.</p>
      </div>
      <HistoryClient savedOnly />
    </div>
  );
}
