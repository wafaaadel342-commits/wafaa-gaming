/**
 * Arabic Proverbs Question Bank for "أكمل المثل" game.
 *
 * Contains verified Egyptian popular proverbs, classical Arabic proverbs,
 * and well-known proverbs from different Arab regions.
 *
 * IMPORTANT: Never invent a proverb, historical origin, attribution, or source.
 * Mark uncertain information as unverified. Do not publish unverified content
 * as approved. Respect copyright and source licensing. Write original explanations
 * instead of copying modern explanations or entire collections.
 *
 * Distinguish between a proverb's established meaning and stories about its
 * historical origin. Do not present folklore stories as proven history.
 */

import { shuffleQuestionOptions, type Question } from "./quiz";
// Proverb dialect/origin types
export type ProverbOrigin =
  "egyptian" | "classical" | "levantine" | "gulf" | "north-african" | "mixed" | "unknown";

export type ProverbVerification = "verified" | "unverified" | "disputed";

/** Category keys used ONLY by the "أكمل المثل" game. */
export type ProverbCategoryKey =
  "egyptian" | "classical" | "levantine" | "gulf" | "north-african" | "mixed";

export interface ProverbQuestion {
  /** Firestore document id (present only for database-backed questions). */
  id?: string;
  /** The proverb prefix/partial text shown to the player. */
  question: string;
  /** The complete proverb text. */
  fullProverb: string;
  /** The correct completion (the missing part). */
  correctCompletion: string;
  /** Multiple-choice options (4 options, randomized positions). */
  options: string[];
  /** Index of the correct option (0-3) in the original unrandomized order. */
  correctIndex: number;
  /** Explanation of the proverb's meaning. */
  explanation: string;
  /** Real-life example of when the proverb is used. */
  usageExample: string;
  /** Region or cultural origin when documented. */
  origin: ProverbOrigin;
  /** Dialect of the proverb. */
  dialect: string;
  /** Difficulty level. */
  level: "easy" | "medium" | "hard";
  /** Tags for searching/filtering. */
  tags: string[];
  /** Source name (book, collector, etc.). */
  sourceName: string;
  /** Source URL. */
  sourceUrl: string;
  /** License and verification metadata. */
  verification: ProverbVerification;
  /** Creation timestamp. */
  createdAt: number;
  /** Whether the question is approved for gameplay. */
  status: "pending" | "approved" | "rejected" | "needs_review";
}

/**
 * Categories for the proverb game.
 * Each category maps to a specific dialect/regional group.
 */
export const PROVERB_CATEGORIES: Record<
  ProverbCategoryKey,
  {
    key: ProverbCategoryKey;
    label: string;
    description: string;
    origin: ProverbOrigin;
  }
> = {
  egyptian: {
    key: "egyptian",
    label: "أمثال مصرية شعبية",
    description: "أشهر الأمثال والحكم الشعبية المصرية",
    origin: "egyptian",
  },
  classical: {
    key: "classical",
    label: "أمثال عربية فصحى",
    description: "أمثال عربية فصحى كلاسيكية معروفة",
    origin: "classical",
  },
  levantine: {
    key: "levantine",
    label: "أمثال Levantine",
    description: "أشهر الأمثال السورية المصرية والشتامية",
    origin: "levantine",
  },
  gulf: {
    key: "gulf",
    label: "أمثال خليجية",
    description: "أشهر الأمثال الخليجية من بلاد الخليج",
    origin: "gulf",
  },
  "north-african": {
    key: "north-african",
    label: "أمثال شمال أفريقيا",
    description: "أشهر الأمثال من بلاد المغرب والجزيرة العربية",
    origin: "north-african",
  },
  mixed: {
    key: "mixed",
    label: "مixed Arabic Proverbs",
    description: "مجموعة مختلطة من الأمثال العربية المختلفة",
    origin: "mixed",
  },
};

/**
 * Levels for the proverb game (adapted from existing quiz levels).
 */
export const PROVERB_LEVELS = {
  easy: { label: "سهل", description: "أمثال مشهورة ومألوفة", points: 10 },
  medium: { label: "متوسط", description: "تتطلب معرفة التراث العربي", points: 15 },
  hard: { label: "صعب", description: "أمثال دقيقة ونادرة", points: 20 },
};

/**
 * Default setup options for the proverb game.
 */
export interface ProverbSetupOptions {
  questionCount: 10 | 15 | 20;
  categories: ProverbCategoryKey[];
}

export const DEFAULT_PROVERB_SETUP: ProverbSetupOptions = {
  questionCount: 10,
  categories: ["egyptian", "classical", "mixed"],
};

import { CURATED_PROVERB_QUESTIONS } from "./proverbs-bank";

/**
 * Sample proverb questions (verified content).
 * These will be seeded to Firestore or localStorage bank.
 */
export const SAMPLE_PROVERB_QUESTIONS: ProverbQuestion[] = CURATED_PROVERB_QUESTIONS;

/**
 * Helper function to convert ProverbQuestion to Question (for existing quiz infrastructure).
 */
export function proverbQuestionToQuestion(q: ProverbQuestion): Question {
  // Curated proverbs often share the same correct position; shuffle once per
  // served question and remap correctIndex.
  return shuffleQuestionOptions({
    category: q.origin,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    imageQuery: undefined,
    countryCode: undefined,
    topicKey: q.tags.join(","),
  });
}

/**
 * Get the category key from a proverb origin string.
 */
export function originToCategoryKey(origin: ProverbOrigin): ProverbCategoryKey {
  const mapping: Record<ProverbOrigin, ProverbCategoryKey> = {
    egyptian: "egyptian",
    classical: "classical",
    levantine: "levantine",
    gulf: "gulf",
    "north-african": "north-african",
    mixed: "mixed",
    unknown: "mixed",
  };
  return mapping[origin] || "mixed";
}

/**
 * Get the proverb origin from a category key.
 */
export function categoryKeyToOrigin(key: ProverbCategoryKey): ProverbOrigin {
  const mapping: Record<ProverbCategoryKey, ProverbOrigin> = {
    egyptian: "egyptian",
    classical: "classical",
    levantine: "levantine",
    gulf: "gulf",
    "north-african": "north-african",
    mixed: "mixed",
  };
  return mapping[key] || "unknown";
}
