// About 90% of the training articles had 100+ words (tsektxt-model-training THESIS_INPUTS section 2).
// Posts shorter than this are outside what the models were trained on, so their verdicts are flagged as low reliability.
// This is a display rule only: it never changes a model's prediction.
export const SHORT_POST_WORDS = 100;

export function countPostWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function isLowReliability(text: string): boolean {
  const n = countPostWords(text);
  return n > 0 && n < SHORT_POST_WORDS;
}
