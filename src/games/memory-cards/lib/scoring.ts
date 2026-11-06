import { DIFFICULTY_CONFIGS } from "../constants";
import type { DifficultyLevel } from "../types";

export interface ScoreCalculationInput {
  difficulty: DifficultyLevel;
  totalPairs: number;
  moves: number;
  elapsedSeconds: number;
  maxStreak: number;
}

export interface ScoreBreakdown {
  baseScore: number;
  streakBonus: number;
  speedBonus: number;
  efficiencyBonus: number;
  difficultyMultiplier: number;
  totalScore: number;
  accuracy: number;
  isPerfect: boolean;
}

export function calculateGameScore(input: ScoreCalculationInput): ScoreBreakdown {
  const { difficulty, totalPairs, moves, elapsedSeconds, maxStreak } = input;
  const config = DIFFICULTY_CONFIGS[difficulty];
  const multiplier = config.scoreMultiplier;

  // Base score: 150 points per pair
  const baseScore = totalPairs * 150;

  // Streak bonus: reward long runs of continuous matches
  let streakBonus = 0;
  if (maxStreak >= 4) {
    streakBonus = 250;
  } else if (maxStreak === 3) {
    streakBonus = 150;
  } else if (maxStreak === 2) {
    streakBonus = 75;
  }

  // Speed bonus: baseline target is (pairs * 6) seconds
  const targetSeconds = totalPairs * 6;
  const timeDifference = targetSeconds - elapsedSeconds;
  const speedBonus = timeDifference > 0 ? Math.round(timeDifference * 15) : 0;

  // Accuracy / Efficiency calculation
  // Perfect game has moves === totalPairs (100% accuracy)
  const accuracy = moves > 0 ? Math.min(100, Math.round((totalPairs / moves) * 100)) : 100;
  const isPerfect = moves === totalPairs && totalPairs > 0;
  const efficiencyBonus = isPerfect ? 500 : accuracy >= 80 ? 200 : accuracy >= 60 ? 100 : 0;

  const rawTotal = (baseScore + streakBonus + speedBonus + efficiencyBonus) * multiplier;
  const totalScore = Math.max(100, Math.round(rawTotal));

  return {
    baseScore,
    streakBonus,
    speedBonus,
    efficiencyBonus,
    difficultyMultiplier: multiplier,
    totalScore,
    accuracy,
    isPerfect,
  };
}

