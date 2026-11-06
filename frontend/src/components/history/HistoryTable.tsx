import { getStatusLabel } from "@/lib/presentation";
import { excerpt, formatNumericDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { HistoryActionsMenu } from "./HistoryActionsMenu";

export function HistoryTable({ analyses, onDelete, onRename, onToggleSave }: { analyses: AnalysisResult[]; onDelete: (id: string) => void; onRename: (id: string) => void; onToggleSave?: (id: string) => void }) {
  return (
    <div className="hidden overflow-visible rounded-[1.5rem] border border-white/70 bg-white/70 shadow-sm backdrop-blur md:block">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[17%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead className="bg-white/45 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Analysis</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Not credible votes</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {analyses.map((analysis) => (
            <tr key={analysis.id}>
              <td className="px-4 py-4">
                <p className="truncate font-semibold">{analysis.title}</p>
                <p className="mt-1 line-clamp-2 text-muted">{excerpt(analysis.sourceText, 78)}</p>
              </td>
              <td className="px-4 py-4 align-middle">{getStatusLabel(analysis.status, analysis.notCredibleVotes)}</td>
              <td className="px-4 py-4 align-middle">{analysis.notCredibleVotes} of 3</td>
              <td className="px-4 py-4 align-middle">{formatNumericDate(analysis.createdAt)}</td>
              <td className="px-4 py-4 text-right align-middle">
                <HistoryActionsMenu analysis={analysis} onDelete={onDelete} onRename={onRename} onToggleSave={onToggleSave} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
