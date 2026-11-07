// "uncertain" = the three models do not all agree. There is no combined score and no "best" model.
export type AnalysisStatus = "credible" | "not_credible" | "uncertain";

/** One word of the post with its Integrated Gradients score (positive = pushes toward NOT credible). */
export interface WordScore {
  word: string;
  start: number;
  end: number;
  attr: number | null; // null = cut off by the 128-token limit
}

/** What one fine-tuned model returned (raw from the backend). */
export interface ModelResult {
  key: string;
  name: string;
  label: "credible" | "not_credible";
  prob_credible: number;
  prob_not_credible: number;
  prob_credible_raw?: number; // raw softmax, before temperature scaling
  prob_not_credible_raw?: number;
  calibrated?: boolean; // true when results/calibration.json was found (temperature scaling applied)
  temperature?: number;
  truncated: boolean;
  words: WordScore[];
  completeness_rel_error: number;
  ig_steps: number; // steps actually used (adaptive)
}

export interface ModelScore {
  model: string;
  credibleProbability: number;
  notCredibleProbability: number;
}

/** A highlighted word for ONE model, built from its IG scores. */
export interface HighlightedSpan {
  id: string;
  model: string; // model key, e.g. "xlmr"
  start: number;
  end: number;
  text: string;
  direction: "credible" | "not_credible";
  weight: number; // |IG| relative to this model's largest |IG| (0..1)
  attribution: number; // raw IG score
  rank: number; // 1 = strongest word for this model
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  title: string;
  sourceText: string;
  status: AnalysisStatus;
  /** How many of the 3 models say NOT credible (0-3). A vote count, not a score. */
  notCredibleVotes: number;
  modelScores: ModelScore[];
  models: ModelResult[];
  highlightedSpans: HighlightedSpan[];
  igSteps: number;
  maxLength: number;
  saved?: boolean;
  helpful?: boolean;
  correctedLabel?: AnalysisStatus;
  note?: string;
}

/** Stored only in this browser; never sent anywhere. */
export interface FeedbackPayload {
  helpful?: boolean;
  correctedLabel?: AnalysisStatus;
  note?: string;
}
