/**
 * Word guessing game state hook - completely isolated.
 *
 * Persists stats to localStorage.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { WordGuessingStats, WordGuessingWord, WordGuessingResult } from "../types";
import { loadStats, saveStats, getEmptyStats } from "../services/state-storage";

export function useWordGuessingGame(wordBank: Map<string, WordGuessingWord>) {
  const [stats, setStats] = useState<WordGuessingStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    setStats(loadStats());
    setLoaded(true);
  }, [loadStats]);

  const updateStats = useCallback((result: WordGuessingResult) => {
    const current = stats ?? loadStats();
    const won = result.attempts.some((a) => a.isCorrect);

    const distribution = [...(current.guessDistribution ?? [0, 0, 0, 0, 0, 0])];
    if (won && result.attempts.length > 0) {
      distribution[result.attempts.length - 1] = (distribution[result.attempts.length - 1] ?? 0) + 1;
    }

    const nextBest = Math.max(current.bestStreak ?? 0, (current.currentStreak ?? 0) + (won ? 1 : 0));
    const updated: WordGuessingStats = {
      ...current,
      totalGames: (current.totalGames ?? 0) + 1,
      totalWins: (current.totalWins ?? 0) + (won ? 1 : 0),
      currentStreak: won ? (current.currentStreak ?? 0) + 1 : 0,
      bestStreak: nextBest,
      averageAttempts: ((current.averageAttempts ?? 0) * (current.totalGames ?? 0) + result.attempts.length) / ((current.totalGames ?? 0) + 1),
      guessDistribution: distribution,
      categoryStats: current.categoryStats ?? {},
      difficultyStats: current.difficultyStats ?? {},
      lastPlayed: Date.now(),
      dailyChallengeCompleted: won,
      dailyChallengeDate: new Date().toDateString(),
    };

    setStats(updated);
    saveStats(updated);
    return updated;
  }, [stats, loadStats, saveStats]);

  const resetDailyCompleted = useCallback(() => {
    localStorage.removeItem("word-guessing-daily-completed");
  }, []);

  const isDailyCompleted = useCallback(() => {
    try {
      const key = localStorage.getItem("word-guessing-daily-completed");
      if (!key) return false;
      const parsed = JSON.parse(key);
      return parsed.date === new Date().toDateString();
    } catch {
      return false;
    }
  }, []);

  const markDailyCompleted = useCallback(() => {
    localStorage.setItem("word-guessing-daily-completed", JSON.stringify({ date: new Date().toDateString() }));
  }, []);

  return {
    stats: loaded ? stats : getEmptyStats(),
    loaded,
    updateStats,
    resetDailyCompleted,
    isDailyCompleted,
    markDailyCompleted,
  };
}