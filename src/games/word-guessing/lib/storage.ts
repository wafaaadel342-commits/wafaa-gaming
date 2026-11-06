import { INITIAL_PLAYER_STATS, STORAGE_KEYS } from "../constants";
import type { DailyChallengeState, PlayerStats } from "../types";
import { getCairoDateKey } from "./daily";

export function loadDailyState(): DailyChallengeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
    if (!raw) return null;
    const state: DailyChallengeState = JSON.parse(raw);
    // If state belongs to today
    if (state.dateKey === getCairoDateKey()) {
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDailyState(state: DailyChallengeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATE, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadPlayerStats(isDaily: boolean): PlayerStats {
  if (typeof window === "undefined") return INITIAL_PLAYER_STATS;
  try {
    const key = isDaily ? STORAGE_KEYS.DAILY_STATS : STORAGE_KEYS.PRACTICE_STATS;
    const raw = localStorage.getItem(key);
    if (!raw) return INITIAL_PLAYER_STATS;
    return { ...INITIAL_PLAYER_STATS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_PLAYER_STATS;
  }
}

export function recordGameStats(
  isDaily: boolean,
  won: boolean,
  attemptsCount: number,
  dateKey?: string,
): PlayerStats {
  const current = loadPlayerStats(isDaily);
  const nextPlayed = current.played + 1;
  const nextWins = won ? current.wins + 1 : current.wins;

  let nextStreak = current.currentStreak;
  if (won) {
    nextStreak += 1;
  } else {
    nextStreak = 0;
  }
  const nextMaxStreak = Math.max(current.maxStreak, nextStreak);

  const nextDistribution = { ...current.guessDistribution };
  if (won && attemptsCount >= 1 && attemptsCount <= 6) {
    nextDistribution[attemptsCount] = (nextDistribution[attemptsCount] || 0) + 1;
  }

  const updatedStats: PlayerStats = {
    played: nextPlayed,
    wins: nextWins,
    currentStreak: nextStreak,
    maxStreak: nextMaxStreak,
    guessDistribution: nextDistribution,
    lastPlayedDateKey: dateKey,
  };

  if (typeof window !== "undefined") {
    try {
      const key = isDaily ? STORAGE_KEYS.DAILY_STATS : STORAGE_KEYS.PRACTICE_STATS;
      localStorage.setItem(key, JSON.stringify(updatedStats));

      // Sync best streak / score to catalog best key "word-guessing-best"
      const best = Math.max(nextMaxStreak, nextWins);
      localStorage.setItem(STORAGE_KEYS.CATALOG_BEST, JSON.stringify(best));
    } catch {
      // Ignore storage errors
    }
  }

  return updatedStats;
}

