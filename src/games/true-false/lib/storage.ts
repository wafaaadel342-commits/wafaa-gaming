import {
  BEST_STORAGE_KEY,
  DEFAULT_SETUP,
  PREFERENCES_STORAGE_KEY,
} from "../constants";
import type { TrueFalseDifficultyFilter, TrueFalseSetup } from "../types";
import { validateSetup } from "./questions";

export type BestScores = Record<TrueFalseDifficultyFilter, number>;

const EMPTY_BEST: BestScores = { easy: 0, medium: 0, hard: 0, mixed: 0 };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadBestScores(): BestScores {
  if (!canUseStorage()) return { ...EMPTY_BEST };
  try {
    const raw = localStorage.getItem(BEST_STORAGE_KEY);
    if (!raw) return { ...EMPTY_BEST };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: BestScores = { ...EMPTY_BEST };
    for (const key of Object.keys(result) as TrueFalseDifficultyFilter[]) {
      const value = parsed[key];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        result[key] = Math.floor(value);
      }
    }
    return result;
  } catch {
    return { ...EMPTY_BEST };
  }
}

export function saveBestScore(
  difficulty: TrueFalseDifficultyFilter,
  score: number,
): BestScores {
  const current = loadBestScores();
  const next: BestScores = {
    ...current,
    [difficulty]: Math.max(current[difficulty], Math.max(0, Math.floor(score))),
  };
  if (canUseStorage()) {
    try {
      localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private mode; gameplay must continue.
    }
  }
  return next;
}

export function overallBest(best: BestScores): number {
  return Math.max(best.easy, best.medium, best.hard, best.mixed);
}

export function loadPreferences(): TrueFalseSetup {
  if (!canUseStorage()) return { ...DEFAULT_SETUP };
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETUP };
    const parsed = validateSetup(JSON.parse(raw));
    return parsed ?? { ...DEFAULT_SETUP };
  } catch {
    return { ...DEFAULT_SETUP };
  }
}

export function savePreferences(setup: TrueFalseSetup): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // ignore
  }
}

