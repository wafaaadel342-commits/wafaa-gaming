import {
  DIFFICULTY_POINTS,
  SPEED_BONUS_MAX,
  STREAK_BONUS_CAP,
  STREAK_BONUS_STEP,
} from "../constants";
import type { TrueFalseQuestion } from "../types";

export interface PointsBreakdown {
  base: number;
  speed: number;
  streak: number;
  total: number;
}

/**
 * Uses the platform's base-point convention (10/15/20) and adds a small
 * speed bonus plus a capped streak bonus. Score is applied exactly once by
 * the game reducer.
 */
export function calculatePoints(
  question: TrueFalseQuestion,
  timeLeftMs: number,
  timerSeconds: number,
  streakAfter: number,
): PointsBreakdown {
  const base = DIFFICULTY_POINTS[question.difficulty];
  const totalTime = Math.max(1, timerSeconds * 1000);
  const ratio = Math.max(0, Math.min(1, timeLeftMs / totalTime));
  const speed = Math.round(SPEED_BONUS_MAX * ratio);
  const streakSteps = Math.min(Math.max(0, streakAfter - 1), STREAK_BONUS_CAP);
  const streak = streakSteps * STREAK_BONUS_STEP;

  return { base, speed, streak, total: base + speed + streak };
}
