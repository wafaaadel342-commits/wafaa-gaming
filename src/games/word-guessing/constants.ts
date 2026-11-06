import type { PlayerStats } from "./types";

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;
export const CAIRO_TIMEZONE = "Africa/Cairo";

export const ARABIC_KEYBOARD_ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ذ", "ء", "ؤ", "ئ", "ر", "ى", "ة", "و", "ز", "ظ"],
];

export const STORAGE_KEYS = {
  DAILY_STATE: "word_guessing_daily_state",
  PRACTICE_STATS: "word_guessing_practice_stats",
  DAILY_STATS: "word_guessing_daily_stats",
  SETTINGS: "word_guessing_settings",
  CATALOG_BEST: "word-guessing-best",
} as const;

export const INITIAL_PLAYER_STATS: PlayerStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};
