/**
 * Deterministic daily secret word selection for the Arabic Word Guessing game.
 *
 * Uses Africa/Cairo as the default timezone (configurable), then derives a
 * deterministic hash of (dateKey + secretSalt) to pick an approved word.
 *
 * The secret word must never appear in publicly readable documents.
 */

import { normalizeArabicWord } from "./normalization";

export const DAILY_TIMEZONE = "Africa/Cairo";
export const SECRET_SALT = "wafaa-game-word-guessing-secret-v1";

export interface DailyWordSource {
  dateKey: string;
  hash: number;
}

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash ^= ch;
    hash = Math.imul(hash, 16777619);
  }
  return hash ^ (hash >>> 15);
}

/** Calendar date in the chosen timezone, formatted YYYY-MM-DD (UTC-safe key). */
export function getDailyDateKey(timezone: string, now: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(now);
    const year = parts.find((p) => p.type === "year")?.value ?? "1970";
    const month = parts.find((p) => p.type === "month")?.value ?? "01";
    const day = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${year}-${month}-${day}`;
  } catch {
    const d = now;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

/**
 * Deterministic selection: hash of `dateKey + SECRET_SALT` → index into the
 * approved word list. Stable across refreshes and machines.
 */
export function selectDailyWordKey(dateKey: string, approvedWordIds: string[]): number {
  const hash = hashString(`${dateKey}|${SECRET_SALT}`);
  const idx = Math.abs(hash) % Math.max(approvedWordIds.length, 1);
  return idx;
}

export function dailyKeyFor(now: Date = new Date(), timezone = DAILY_TIMEZONE): string {
  return getDailyDateKey(timezone, now);
}