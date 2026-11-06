import { Card } from "@/components/ui/card";
import { getStatusLabel } from "@/lib/presentation";
import { excerpt, formatNumericDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { HistoryActionsMenu } from "./HistoryActionsMenu";

export function HistoryCard({ analysis, onDelete, onRename, onToggleSave }: { analysis: AnalysisResult; onDelete: (id: string) => void; onRename?: (id: string) => void; onToggleSave?: (id: string) => void }) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{analysis.title}</h3>
          <p className="mt-1 text-xs text-muted">{formatNumericDate(analysis.createdAt)} · {analysis.notCredibleVotes}/3 not credible</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/80 bg-white/55 px-2 py-1 text-xs font-medium">{getStatusLabel(analysis.status, analysis.notCredibleVotes)}</span>
          <HistoryActionsMenu analysis={analysis} onDelete={onDelete} onRename={onRename} onToggleSave={onToggleSave} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{excerpt(analysis.sourceText)}</p>
    </Card>
  );
}
