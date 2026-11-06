import type { LucideIcon } from "lucide-react";

/** Word guessing game types – completely isolated from other games */

export type WordGuessingCategoryKey =
  | "everyday-life"
  | "nature-and-animals"
  | "food"
  | "science"
  | "technology"
  | "geography"
  | "history"
  | "culture"
  | "sports"
  | "general-vocabulary"
  | "mixed";

export type WordGuessingDifficulty = "easy" | "medium" | "hard";
export type WordGuessingDifficultyFilter = WordGuessingDifficulty | "mixed";

/** Core word object – exact 5 normalized Arabic letters */
export interface WordGuessingWord {
  id: string;
  word: string;
  normalized: string;
  meaning: string;
  shortHint?: string;
  category: WordGuessingCategoryKey;
  difficulty: WordGuessingDifficulty;
  language: "ar";
  dialect: "fus'ha" | "egypt" | "levantine" | "gulf" | "maghreb";
  status: "approved" | "pending" | "rejected" | "needs_review";
  sourceName?: string;
  sourceUrl?: string;
  verificationNote?: string;
  normalizedUsage?: string[];
  createdAt: number;
  updatedAt: number;
}

/** Daily challenge for deterministic per‑date selection */
export interface WordGuessingDaily {
  date: string;
  wordId: string;
  word: WordGuessingWord;
  createdAt: number;
  expiresAt?: number;
}

/** Player attempt record */
export interface WordGuessingAttempt {
  guess: string;
  normalized: string;
  positions: LetterEvaluation[];
  isCorrect: boolean;
  timestamp: number;
}

/** Per‑letter evaluation used for coloring */
export interface LetterEvaluation {
  letter: string;
  letterIndex: number;
  type: "green" | "yellow" | "gray";
  matchedInSecret?: boolean;
}

/** Result for a single game session */
export interface WordGuessingResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  total: number;
  bestStreak: number;
  accuracy: number;
  attempts: WordGuessingAttempt[];
  secretWord: WordGuessingWord;
  timeSpentMs: number;
}

/** Game setup configuration */
export interface WordGuessingSetup {
  mode: "daily" | "practice";
  category: WordGuessingCategoryKey;
  difficulty: WordGuessingDifficultyFilter;
  maxAttempts: number;
  timezone: string;
  hintEnabled: boolean;
  allowGuessSubstitution: boolean;
  streakEnabled: boolean;
}

/** Player statistics aggregated across sessions */
export interface WordGuessingStats {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  averageAttempts: number;
  guessDistribution: number[]; // 1‑6 attempts
  categoryStats: Partial<Record<WordGuessingCategoryKey, {
    games: number;
    wins: number;
    avgAttempts: number;
  }>>;
  difficultyStats: Partial<Record<WordGuessingDifficulty, {
    games: number;
    wins: number;
    avgAttempts: number;
  }>>;
  lastPlayed?: number;
  dailyChallengeCompleted?: boolean;
  dailyChallengeDate?: string;
}

/** Firestore document shapes – isolated from other games */
export interface WordGuessingWordDoc {
  word: string;
  normalized: string;
  meaning: string;
  shortHint?: string;
  category: WordGuessingCategoryKey;
  difficulty: WordGuessingDifficulty;
  language: "ar";
  dialect: string;
  status: "approved" | "pending" | "rejected" | "needs_review";
  sourceName?: string;
  sourceUrl?: string;
  verificationNote?: string;
  normalizedUsage?: string[];
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface WordGuessingDailyDoc {
  date: string;
  wordId: string;
  createdAt: number;
  expiresAt?: number;
}

export interface WordGuessingStatsDoc {
  userId: string;
  stats: WordGuessingStats;
  lastUpdated: number;
}

export interface WordGuessingSessionDoc {
  sessionId: string;
  userId?: string;
  setup: WordGuessingSetup;
  result: WordGuessingResult;
  startedAt: number;
  completedAt?: number;
  expired: boolean;
}