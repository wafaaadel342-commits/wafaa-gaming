import type { KeyboardKeyStatus, LetterEvaluation } from "../types";
import { getLettersArray, normalizeArabic } from "./normalization";

/**
 * Two-pass Wordle evaluation algorithm.
 * Guarantees correct duplicate letter counting.
 */
export function evaluateGuess(
  guessWord: string,
  secretWord: string,
): LetterEvaluation[] {
  const guessLetters = getLettersArray(guessWord);
  const secretLetters = getLettersArray(secretWord);

  const len = guessLetters.length;
  const result: LetterEvaluation[] = new Array(len);

  // Remaining pool of letters from secret word (unmatched by pass 1)
  const remainingSecretCounts: Record<string, number> = {};

  // Pass 1: Identify all GREEN (exact match) tiles
  for (let i = 0; i < len; i++) {
    const g = guessLetters[i] ?? "";
    const s = secretLetters[i] ?? "";

    if (g === s) {
      result[i] = { letter: g, status: "green" };
    } else {
      // Add to remaining pool
      remainingSecretCounts[s] = (remainingSecretCounts[s] || 0) + 1;
    }
  }

  // Pass 2: Identify YELLOW (in word, different pos) and GRAY
  for (let i = 0; i < len; i++) {
    // If already marked green in pass 1, skip
    if (result[i]?.status === "green") continue;

    const g = guessLetters[i] ?? "";
    const available = remainingSecretCounts[g] || 0;

    if (available > 0) {
      result[i] = { letter: g, status: "yellow" };
      remainingSecretCounts[g] = available - 1;
    } else {
      result[i] = { letter: g, status: "gray" };
    }
  }

  return result;
}

/**
 * Status priority: GREEN (3) > YELLOW (2) > GRAY (1) > DEFAULT (0).
 */
const STATUS_PRIORITY: Record<KeyboardKeyStatus, number> = {
  green: 3,
  yellow: 2,
  gray: 1,
  default: 0,
};

/**
 * Updates keyboard key status without ever downgrading a higher status.
 */
export function updateKeyboardStatuses(
  currentMap: Record<string, KeyboardKeyStatus>,
  evaluations: LetterEvaluation[],
): Record<string, KeyboardKeyStatus> {
  const updated = { ...currentMap };

  for (const item of evaluations) {
    const char = normalizeArabic(item.letter);
    if (!char) continue;

    const currentStatus = updated[char] || "default";
    const currentScore = STATUS_PRIORITY[currentStatus];
    const newScore = STATUS_PRIORITY[item.status];

    if (newScore > currentScore) {
      updated[char] = item.status;
    }
  }

  return updated;
}
