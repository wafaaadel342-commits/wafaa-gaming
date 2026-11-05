/** All type definitions for the isolated True or False game. */

export type TrueFalseCategoryKey =
  | "science"
  | "history"
  | "geography"
  | "technology"
  | "general"
  | "nature"
  | "egypt"
  | "mixed";

export type TrueFalseDifficulty = "easy" | "medium" | "hard";
export type TrueFalseDifficultyFilter = TrueFalseDifficulty | "mixed";

export type QuestionCount = 10 | 15 | 20;
export type TimerSeconds = 5 | 10 | 15;

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  correction?: string;
  sourceName: string;
  sourceUrl: string;
  category: TrueFalseCategoryKey;
  difficulty: TrueFalseDifficulty;
  verified: boolean;
  status: "approved";
  aiGenerated?: boolean;
}

export interface TrueFalseSetup {
  category: TrueFalseCategoryKey;
  difficulty: TrueFalseDifficultyFilter;
  questionCount: QuestionCount;
  timerSeconds: TimerSeconds;
}

export interface TrueFalseAnswerRecord {
  question: TrueFalseQuestion;
  chosen: boolean | null;
  correct: boolean;
  timedOut: boolean;
  points: number;
  timeLeftMs: number;
  streakAfter: number;
}

export interface TrueFalseResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  total: number;
  bestStreak: number;
  accuracy: number;
  setup: TrueFalseSetup;
  answers: TrueFalseAnswerRecord[];
}

export interface TrueFalseCandidate {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  correction?: string;
  sourceName: string;
  sourceUrl: string;
  category: TrueFalseCategoryKey;
  difficulty: TrueFalseDifficulty;
  verified: false;
  status: "needs_review";
  aiGenerated: true;
  createdAt: number;
}
