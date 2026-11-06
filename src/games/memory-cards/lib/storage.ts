import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../constants";
import type {
  BestScoreRecord,
  BestScoresMap,
  DifficultyLevel,
  GameMode,
  GameResult,
  GameSettings,
} from "../types";

const INITIAL_BEST_SCORES: BestScoresMap = {
  visual: { easy: null, medium: null, hard: null, expert: null },
  knowledge: { easy: null, medium: null, hard: null, expert: null },
};

export function loadStoredSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: GameSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export function loadBestScores(): BestScoresMap {
  if (typeof window === "undefined") return INITIAL_BEST_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_SCORES);
    if (!raw) return INITIAL_BEST_SCORES;
    return { ...INITIAL_BEST_SCORES, ...JSON.parse(raw) };
  } catch {
    return INITIAL_BEST_SCORES;
  }
}

export function saveBestScore(
  result: GameResult,
): { isNewBest: boolean; updatedScores: BestScoresMap } {
  const current = loadBestScores();
  const existingRecord = current[result.mode]?.[result.difficulty];
  const isNewBest = !existingRecord || result.score > existingRecord.score;

  if (isNewBest) {
    const newRecord: BestScoreRecord = {
      score: result.score,
      moves: result.moves,
      elapsedSeconds: result.elapsedSeconds,
      date: new Date().toISOString(),
    };

    const updated: BestScoresMap = {
      ...current,
      [result.mode]: {
        ...current[result.mode],
        [result.difficulty]: newRecord,
      },
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.BEST_SCORES, JSON.stringify(updated));

        // Update games catalog best score key "memory-cards-best"
        const allScores: number[] = [];
        (["visual", "knowledge"] as GameMode[]).forEach((m) => {
          (["easy", "medium", "hard", "expert"] as DifficultyLevel[]).forEach((d) => {
            const sc = updated[m]?.[d]?.score;
            if (typeof sc === "number") allScores.push(sc);
          });
        });
        const highest = allScores.length > 0 ? Math.max(...allScores) : result.score;
        localStorage.setItem("memory-cards-best", JSON.stringify(highest));
      } catch {
        // Ignore storage errors
      }
    }

    return { isNewBest: true, updatedScores: updated };
  }

  return { isNewBest: false, updatedScores: current };
}

export function appendStatsHistory(result: GameResult): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS_HISTORY);
    const history: GameResult[] = raw ? JSON.parse(raw) : [];
    history.unshift(result);
    // Keep last 30 games
    localStorage.setItem(
      STORAGE_KEYS.STATS_HISTORY,
      JSON.stringify(history.slice(0, 30)),
    );
  } catch {
    // Ignore storage errors
  }
}

export function loadStatsHistory(): GameResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

