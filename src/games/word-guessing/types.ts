export type TileStatus = "empty" | "tapped" | "green" | "yellow" | "gray";

export type KeyboardKeyStatus = "default" | "green" | "yellow" | "gray";

export type GameMode = "daily" | "practice";

export type GamePlayStatus =
  | "idle"
  | "playing"
  | "submitting"
  | "won"
  | "lost";

export interface TargetWordItem {
  id: string;
  word: string;
  normalized: string;
  meaning: string;
  hint: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface LetterEvaluation {
  letter: string;
  status: "green" | "yellow" | "gray";
}

export interface GuessRowData {
  letters: string[];
  evaluations: LetterEvaluation[] | null;
  isSubmitted: boolean;
  isInvalidShake?: boolean | undefined;
}

export interface DailyChallengeState {
  dateKey: string; // YYYY-MM-DD in Africa/Cairo
  completed: boolean;
  won: boolean;
  guesses: string[];
  secretWordId: string;
  solvedInAttempts: number;
  timestamp: number;
}

export interface PlayerStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1 -> count, 2 -> count ...
  lastPlayedDateKey?: string | undefined;
}

export interface HintUsage {
  revealedCategory: boolean;
  revealedClue: boolean;
  revealedLetterIndex: number | null; // index of letter revealed
}

export interface GameResultPayload {
  mode: GameMode;
  dateKey?: string | undefined;
  won: boolean;
  attemptsCount: number;
  secretWord: TargetWordItem;
  guesses: string[];
  evaluationsGrid: LetterEvaluation[][];
  timeElapsedSeconds: number;
}
