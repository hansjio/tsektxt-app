import type { AnalysisResult, AnalysisStatus, FeedbackPayload, HighlightedSpan, ModelResult } from "@/types/analysis";

// Real models only: the local FastAPI backend (backend/server.py). No mock mode, no LLM.
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const STORAGE_KEY = "tsektxt_analyses_v2"; // history lives only in this browser
const SPANS_PER_MODEL = 8;
const MIN_RELATIVE_WEIGHT = 0.15;

interface BackendResponse {
  text: string;
  max_length: number;
  n_steps: number;
  models: ModelResult[];
}

function readAll(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: AnalysisResult[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Could not save history in this browser:", e);
  }
}

function update(id: string, patch: Partial<AnalysisResult>) {
  writeAll(readAll().map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

/** Top IG words per model, as clickable spans. Explanations state only what IG measured. */
function spansFor(model: ModelResult): HighlightedSpan[] {
  const scored = model.words.filter((w) => w.attr !== null) as (ModelResult["words"][number] & { attr: number })[];
  const maxAbs = Math.max(0, ...scored.map((w) => Math.abs(w.attr)));
  if (maxAbs === 0) return [];
  return [...scored]
    .sort((a, b) => Math.abs(b.attr) - Math.abs(a.attr))
    .slice(0, SPANS_PER_MODEL)
    .filter((w) => Math.abs(w.attr) / maxAbs >= MIN_RELATIVE_WEIGHT)
    .map((w, i) => {
      const direction = w.attr > 0 ? "not_credible" : "credible";
      return {
        id: `${model.key}-${w.start}`,
        model: model.key,
        start: w.start,
        end: w.end,
        text: w.word,
        direction,
        weight: Math.abs(w.attr) / maxAbs,
        attribution: w.attr,
        rank: i + 1,
        explanation: `For ${model.name}, this word ranks #${i + 1} by Integrated Gradients (score ${w.attr >= 0 ? "+" : ""}${w.attr.toFixed(3)}). It pushed this model toward "${direction === "not_credible" ? "not credible" : "credible"}". This shows what the model relied on, not whether the claim is true.`,
      } satisfies HighlightedSpan;
    });
}

function toResult(data: BackendResponse): AnalysisResult {
  const votes = data.models.filter((m) => m.label === "not_credible").length;
  const status: AnalysisStatus = votes === data.models.length ? "not_credible" : votes === 0 ? "credible" : "uncertain";
  const title = data.text.length > 60 ? `${data.text.slice(0, 60).trim()}...` : data.text;
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    title,
    sourceText: data.text,
    status,
    notCredibleVotes: votes,
    modelScores: data.models.map((m) => ({ model: m.name, credibleProbability: m.prob_credible, notCredibleProbability: m.prob_not_credible })),
    models: data.models,
    highlightedSpans: data.models.flatMap(spansFor),
    igSteps: data.n_steps,
    maxLength: data.max_length,
  };
}

export async function analyzeText(sourceText: string): Promise<AnalysisResult> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sourceText }),
    });
  } catch {
    throw new Error("Cannot reach the model server. Is the backend window still running? (README, step 3)");
  }
  if (!response.ok) throw new Error(`The model server returned an error (${response.status}).`);
  // The backend strips the text, so offsets refer to the trimmed text.
  const result = toResult((await response.json()) as BackendResponse);
  writeAll([result, ...readAll()]);
  return result;
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  return readAll();
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const found = readAll().find((a) => a.id === id);
  if (!found) throw new Error("Analysis not found in this browser's history.");
  return found;
}

export async function sendFeedback(id: string, payload: FeedbackPayload): Promise<{ ok: true }> {
  update(id, payload);
  return { ok: true };
}

export async function deleteAnalysis(id: string): Promise<{ ok: true }> {
  writeAll(readAll().filter((a) => a.id !== id));
  return { ok: true };
}

export async function renameAnalysis(id: string, title: string): Promise<{ ok: true }> {
  update(id, { title });
  return { ok: true };
}

export async function setSaved(id: string, saved: boolean): Promise<{ ok: true }> {
  update(id, { saved });
  return { ok: true };
}
