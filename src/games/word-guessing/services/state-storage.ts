/**
 * State storage for Word Guessing game.
 * Handles localStorage persistence for stats and daily challenge.
 */

import type { WordGuessingStats } from "../types";

const STATS_KEY = "word-guessing-stats-v1";

export function loadStats(): WordGuessingStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getEmptyStats();
    const parsed = JSON.parse(raw) as Partial<WordGuessingStats>;
    return {
      ...getEmptyStats(),
      ...parsed,
      categoryStats: parsed.categoryStats ?? {},
      difficultyStats: parsed.difficultyStats ?? {},
      guessDistribution: parsed.guessDistribution ?? [0, 0, 0, 0, 0, 0],
    };
  } catch {
    return getEmptyStats();
  }
}

export function saveStats(stats: WordGuessingStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getEmptyStats(): WordGuessingStats {
  return {
    totalGames: 0,
    totalWins: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageAttempts: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    categoryStats: {},
    difficultyStats: {},
  };
}