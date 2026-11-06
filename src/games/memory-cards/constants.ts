import type { DifficultyConfig, DifficultyLevel, GameSettings } from "./types";

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: "easy",
    title: "سهل",
    description: "٤ أزواج (٨ كروت) — بداية مريحة لتدريب الذاكرة",
    pairsCount: 4,
    previewSeconds: 3,
    scoreMultiplier: 1.0,
    gridColsClass: "grid-cols-2 sm:grid-cols-4",
  },
  medium: {
    level: "medium",
    title: "متوسط",
    description: "٦ أزواج (١٢ كارت) — توازن مثالي بين المتعة والتحدي",
    pairsCount: 6,
    previewSeconds: 3,
    scoreMultiplier: 1.5,
    gridColsClass: "grid-cols-3 sm:grid-cols-4",
  },
  hard: {
    level: "hard",
    title: "صعب",
    description: "٨ أزواج (١٦ كارت) — يتطلب تركيزًا واستدعاءً سريعًا",
    pairsCount: 8,
    previewSeconds: 3.5,
    scoreMultiplier: 2.0,
    gridColsClass: "grid-cols-4 sm:grid-cols-4 md:grid-cols-4",
  },
  expert: {
    level: "expert",
    title: "خبير",
    description: "١٢ زوجًا (٢٤ كارت) — لأصحاب الذاكرة الحديدية والتركيز الفائق",
    pairsCount: 12,
    previewSeconds: 4,
    scoreMultiplier: 2.8,
    gridColsClass: "grid-cols-4 sm:grid-cols-6",
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  mode: "visual",
  difficulty: "medium",
  selectedCategory: "all",
  soundEnabled: true,
  previewEnabled: true,
};

export const STORAGE_KEYS = {
  BEST_SCORES: "memory_cards_best_scores",
  SETTINGS: "memory_cards_settings",
  STATS_HISTORY: "memory_cards_stats_history",
  COMPLETED_COUNT: "memory_cards_completed_count",
} as const;

export const EGYPTIAN_PRAISES = [
  "الله ينور عليك!",
  "يا عيني على التركيز!",
  "عاش يا فنان!",
  "وحش الذاكرة يا بطل!",
  "تسلم دماغك العالية!",
  "عين حورس معاك!",
  "يا سلام على الشطارة!",
  "ما شاء الله عليك، ذاكرة حديد!",
  "تمام التمام، ولا غلطة!",
  "شغل ملوكي أصيل!",
];

export const CATEGORIES_LIST = [
  { id: "all", label: "كل الفئات المصرية" },
  { id: "آثار ومعالم", label: "آثار ومعالم" },
  { id: "أكلات مصرية", label: "أكلات ومشروبات شعبية" },
  { id: "تراث ورموز مصرية", label: "تراث وفولكلور مصري" },
  { id: "جغرافيا مصر", label: "جغرافيا ومدن النيل" },
  { id: "فن وثقافة مصرية", label: "فنون وشخصيات مصرية" },
];

