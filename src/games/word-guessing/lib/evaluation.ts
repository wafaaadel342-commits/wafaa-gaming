/**
 * Two-pass Wordle-style letter evaluation for Arabic words.
 *
 * Pass 1: mark exact-position matches as GREEN and consume those letters
 * from the secret word's multiset.
 * Pass 2: for remaining guess letters, mark YELLOW only if an unmatched
 * occurrence exists in the secret word's remaining multiset; otherwise GRAY.
 *
 * GREEN > YELLOW > GRAY priority is maintained by design.
 *
 * Completely isolated to this module.
 */

import type { LetterEvaluation } from "../types";
import { normalizeArabicWord } from "./normalization";

const WORD_LENGTH = 5;

/**
 * Evaluate a guess against a secret word using correct Arabic handling.
 * Both inputs are normalized before comparison.
 *
 * @returns evaluations array aligned with guess positions (left→right),
 * plus `isCorrect` flag.
 */
export function evaluateGuess(
  secretWord: string,
  guess: string,
): { evaluations: LetterEvaluation[]; isCorrect: boolean } {
  const secret = normalizeArabicWord(secretWord);
  const g = normalizeArabicWord(guess);

  const secretClusters = graphemeClusterList(secret);
  const guessClusters = graphemeClusterList(g);

  if (guessClusters.length !== WORD_LENGTH || secretClusters.length !== WORD_LENGTH) {
    // Fallback: treat as invalid; return all gray.
    return {
      evaluations: guessClusters.map((letter, i) => ({
        letter,
        letterIndex: i,
        type: "gray",
        matchedInSecret: false,
      })),
      isCorrect: false,
    };
  }

  const evaluations: LetterEvaluation[] = [];

  // Initialize secret letter multiset counts (remaining unmatched letters).
  const remainingCounts = new Map<string, number>();
  for (const letter of secretClusters) {
    remainingCounts.set(letter, (remainingCounts.get(letter) ?? 0) + 1);
  }

  // Pass 1: exact-position matches (GREEN).
  // First pass fills null placeholders; we then fill non-green in pass 2.
  const placeholders = new Array<LetterEvaluation | null>(WORD_LENGTH);

  for (let i = 0; i < WORD_LENGTH; i++) {
    const guessLetter = guessClusters[i]!;
    if (guessLetter === secretClusters[i]!) {
      placeholders[i] = {
        letter: guessLetter,
        letterIndex: i,
        type: "green",
        matchedInSecret: true,
      };
      const current = remainingCounts.get(guessLetter) ?? 0;
      remainingCounts.set(guessLetter, Math.max(0, current - 1));
    }
  }

  // Pass 2: remaining guess letters evaluated against remaining secret counts.
  for (let i = 0; i < WORD_LENGTH; i++) {
    const evalSlot = placeholders[i];
    if (evalSlot) {
      evaluations.push(evalSlot);
      continue;
    }

    const guessLetter = guessClusters[i]!;
    const remaining = remainingCounts.get(guessLetter) ?? 0;

    if (remaining > 0) {
      placeholders[i] = {
        letter: guessLetter,
        letterIndex: i,
        type: "yellow",
        matchedInSecret: true,
      };
      remainingCounts.set(guessLetter, remaining - 1);
    } else {
      placeholders[i] = {
        letter: guessLetter,
        letterIndex: i,
        type: "gray",
        matchedInSecret: false,
      };
    }
    evaluations.push(placeholders[i]!);
  }

  const isCorrect = evaluations.every((e) => e.type === "green");
  return { evaluations, isCorrect };
}

/**
 * Split a normalized Arabic string into its grapheme clusters (letter-by-letter).
 * No diacritics expected after normalization; one base char per cluster.
 */
function graphemeClusterList(input: string): string[] {
  const clusters: string[] = [];
  for (const ch of input) {
    clusters.push(ch);
  }
  return clusters;
}

export { WORD_LENGTH };
