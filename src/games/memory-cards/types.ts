export type GameMode = "visual" | "knowledge";

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export type GameStatus = "idle" | "preview" | "playing" | "paused" | "completed";

export interface VisualSymbolItem {
  id: string;
  symbol_key: string;
  label_ar: string;
  category: string;
  illustration_brief: string;
}

export interface QuestionAnswerPairItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source_name?: string | null | undefined;
  source_url?: string | null | undefined;
  source_search_hint?: string | undefined;
  verification_status: "approved" | "source_linked_needs_review" | "needs_review";
}

export type CardType = "symbol" | "question" | "answer";

export interface CardContentVisual {
  symbolKey: string;
  label: string;
  category: string;
}

export interface CardContentKnowledge {
  text: string;
  role: "question" | "answer";
  category: string;
  explanation: string;
  sourceName?: string | undefined;
}

export interface MemoryCard {
  id: string; // Stable unique ID (e.g. card-vs001-1)
  pairId: string; // Shared ID between matching pair
  mode: GameMode;
  cardType: CardType;
  visual?: CardContentVisual | undefined;
  knowledge?: CardContentKnowledge | undefined;
  isFlipped: boolean;
  isMatched: boolean;
  isMismatchPulse?: boolean | undefined;
}

export interface DifficultyConfig {
  level: DifficultyLevel;
  title: string;
  description: string;
  pairsCount: number;
  previewSeconds: number;
  scoreMultiplier: number;
  gridColsClass: string;
}

export interface GameSettings {
  mode: GameMode;
  difficulty: DifficultyLevel;
  selectedCategory: string; // "all" or specific
  soundEnabled: boolean;
  previewEnabled: boolean;
}

export interface GameResult {
  mode: GameMode;
  difficulty: DifficultyLevel;
  score: number;
  moves: number;
  pairs: number;
  elapsedSeconds: number;
  accuracy: number;
  maxStreak: number;
  isNewBest: boolean;
  completedAt: string;
}

export interface BestScoreRecord {
  score: number;
  moves: number;
  elapsedSeconds: number;
  date: string;
}

export type BestScoresMap = Record<
  GameMode,
  Record<DifficultyLevel, BestScoreRecord | null>
>;
