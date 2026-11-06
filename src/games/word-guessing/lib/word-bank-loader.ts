import wordsData from "../data/words-data.json";
import type { TargetWordItem } from "../types";
import { getNormalizedLength, normalizeArabic } from "./normalization";

export const TARGET_WORDS: TargetWordItem[] =
  wordsData.target_words as TargetWordItem[];

// Fast O(1) set lookup for accepted guesses
const ACCEPTED_GUESSES_SET = new Set<string>(
  wordsData.accepted_guesses.map((w: string) => normalizeArabic(w)),
);

// Ensure all target words are also in the accepted set
for (const t of TARGET_WORDS) {
  ACCEPTED_GUESSES_SET.add(normalizeArabic(t.normalized || t.word));
}

/**
 * Validates whether a typed Arabic word is a legitimate 5-letter guess.
 */
export function isValidGuess(word: string): boolean {
  if (!word) return false;
  const norm = normalizeArabic(word);
  if (getNormalizedLength(norm) !== 5) return false;
  return ACCEPTED_GUESSES_SET.has(norm);
}

/**
 * Select a random target word for Practice mode.
 */
export function getRandomPracticeWord(excludeIds?: string[]): TargetWordItem {
  let pool = TARGET_WORDS;
  if (excludeIds && excludeIds.length > 0) {
    const filtered = TARGET_WORDS.filter((w) => !excludeIds.includes(w.id));
    if (filtered.length > 0) pool = filtered;
  }
  const index = Math.floor(Math.random() * pool.length);
  const picked = pool[index];
  return picked ?? TARGET_WORDS[0]!;
}

/**
 * Find target word by its id.
 */
export function getTargetWordById(id: string): TargetWordItem | undefined {
  return TARGET_WORDS.find((w) => w.id === id);
}
