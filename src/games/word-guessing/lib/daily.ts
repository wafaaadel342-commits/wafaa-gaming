import { CAIRO_TIMEZONE } from "../constants";
import type { LetterEvaluation, TargetWordItem } from "../types";
import { TARGET_WORDS } from "./word-bank-loader";

/**
 * Returns current calendar date in Africa/Cairo timezone as YYYY-MM-DD.
 */
export function getCairoDateKey(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Deterministic integer hash for date string.
 */
function hashDateString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministically picks the daily secret word for a given date in Cairo timezone.
 */
export function getDailySecretWord(dateKey: string = getCairoDateKey()): TargetWordItem {
  const hash = hashDateString(`wafaa-daily-${dateKey}`);
  const index = hash % TARGET_WORDS.length;
  return TARGET_WORDS[index] ?? TARGET_WORDS[0]!;
}

/**
 * Generates clean shareable emoji grid without spoiling the answer.
 */
export function generateShareableEmojiGrid(
  dateKey: string,
  won: boolean,
  evaluationsGrid: LetterEvaluation[][],
): string {
  const attempts = won ? `${evaluationsGrid.length}/6` : "X/6";
  const header = `خمن الكلمة (${dateKey}) ${attempts}`;

  const rows = evaluationsGrid.map((row) =>
    row
      .map((cell) => {
        if (cell.status === "green") return "🟩";
        if (cell.status === "yellow") return "🟨";
        return "⬛";
      })
      .join(""),
  );

  return `${header}\n\n${rows.join("\n")}\n\nالعب وتعلم — Play & Learn`;
}
