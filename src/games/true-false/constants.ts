import type {
  QuestionCount,
  TimerSeconds,
  TrueFalseCategoryKey,
  TrueFalseDifficulty,
  TrueFalseDifficultyFilter,
  TrueFalseSetup,
} from "./types";

export const GAME_ROUTE = "/true-or-false";
export const BEST_STORAGE_KEY = "true-false-best";
export const PREFERENCES_STORAGE_KEY = "true-false-preferences";
export const PENDING_CANDIDATES_KEY = "true-false-pending-candidates";
export const FIRESTORE_QUESTIONS_COLLECTION = "trueFalseQuestions";
export const FIRESTORE_CANDIDATES_COLLECTION = "trueFalseCandidates";

export const CATEGORY_ORDER: TrueFalseCategoryKey[] = [
  "science",
  "history",
  "geography",
  "technology",
  "general",
  "nature",
  "egypt",
  "mixed",
];

export const CATEGORY_LABELS: Record<TrueFalseCategoryKey, string> = {
  science: "العلوم",
  history: "التاريخ",
  geography: "الجغرافيا",
  technology: "التكنولوجيا",
  general: "معلومات عامة",
  nature: "الطبيعة",
  egypt: "الثقافة المصرية",
  mixed: "أسئلة منوعة",
};

export const CATEGORY_DESCRIPTIONS: Record<TrueFalseCategoryKey, string> = {
  science: "فيزياء وكيمياء وأحياء",
  history: "أحداث وحضارات وشخصيات",
  geography: "قارات وبحار وعواصم",
  technology: "حاسوب وإنترنت وابتكارات",
  general: "حقائق يومية ومؤسسات",
  nature: "حيوانات ونباتات وبيئة",
  egypt: "حضارة مصر وتاريخها",
  mixed: "مزيج من كل الفئات",
};

export const DIFFICULTY_ORDER: TrueFalseDifficultyFilter[] = [
  "easy",
  "medium",
  "hard",
  "mixed",
];

export const DIFFICULTY_LABELS: Record<TrueFalseDifficultyFilter, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
  mixed: "مختلط",
};

export const DIFFICULTY_DESCRIPTIONS: Record<TrueFalseDifficultyFilter, string> = {
  easy: "حقائق أساسية واضحة",
  medium: "معلومات تحتاج تركيزًا",
  hard: "تفاصيل أدق وأعمق",
  mixed: "مستويات متنوعة",
};

/** Base points follow the platform convention: 10 / 15 / 20. */
export const DIFFICULTY_POINTS: Record<TrueFalseDifficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 20,
};

export const SPEED_BONUS_MAX = 5;
export const STREAK_BONUS_STEP = 2;
export const STREAK_BONUS_CAP = 5;

export const QUESTION_COUNT_OPTIONS: QuestionCount[] = [10, 15, 20];
export const TIMER_OPTIONS: TimerSeconds[] = [5, 10, 15];

export const DEFAULT_SETUP: TrueFalseSetup = {
  category: "mixed",
  difficulty: "mixed",
  questionCount: 10,
  timerSeconds: 10,
};

export const FEEDBACK_AUTO_ADVANCE_MS = 7000;
