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

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

export const CATEGORIES: Array<{ id: WordGuessingCategoryKey; label: string; description: string }> = [
  { id: "everyday-life", label: "الحياة اليومية", description: "كلمات يومية" },
  { id: "nature-and-animals", label: "الطبيعة والحيوانات", description: "طبيعة" },
  { id: "food", label: "الطعام", description: "طعام" },
  { id: "science", label: "العلوم", description: "علوم" },
  { id: "technology", label: "التكنولوجيا", description: "تكنولوجيا" },
  { id: "geography", label: "الجغرافيا", description: "جغرافيا" },
  { id: "history", label: "التاريخ", description: "تاريخ" },
  { id: "culture", label: "الثقافة", description: "ثقافة" },
  { id: "sports", label: "الرياضة", description: "رياضة" },
  { id: "general-vocabulary", label: "المفردات العامة", description: "مفردات" },
  { id: "mixed", label: "مختلط", description: "جميع الفئات" },
];

export const DIFFICULTIES: Array<{ id: WordGuessingDifficulty; label: string; description: string }> = [
  { id: "easy", label: "سهل", description: "كلمات شائعة" },
  { id: "medium", label: "متوسط", description: "كلمات متوسطة" },
  { id: "hard", label: "صعب", description: "كلمات أصعب" },
];

export const HINTS = {
  revealMeaning: "تعريف الكلمة",
  revealCategory: "فئة الكلمة",
  provideClue: "شرح مختصر",
};

export const DAILY_TIMEZONE = "Africa/Cairo";

export type WordGuessingStats = {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  averageAttempts: number;
  guessDistribution: number[];
  categoryStats: Record<string, { games: number; wins: number; avgAttempts: number }>;
  difficultyStats: Record<string, { games: number; wins: number; avgAttempts: number }>;
  lastPlayed?: number;
  dailyChallengeCompleted?: boolean;
  dailyChallengeDate?: string;
};
