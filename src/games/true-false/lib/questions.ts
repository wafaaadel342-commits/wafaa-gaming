import { CATEGORY_ORDER, DIFFICULTY_ORDER } from "../constants";
import type {
  TrueFalseCategoryKey,
  TrueFalseDifficulty,
  TrueFalseDifficultyFilter,
  TrueFalseQuestion,
  TrueFalseSetup,
} from "../types";

export function isCategoryKey(value: unknown): value is TrueFalseCategoryKey {
  return typeof value === "string" && (CATEGORY_ORDER as string[]).includes(value);
}

export function isDifficulty(value: unknown): value is TrueFalseDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export function isDifficultyFilter(value: unknown): value is TrueFalseDifficultyFilter {
  return typeof value === "string" && (DIFFICULTY_ORDER as string[]).includes(value);
}

export function isSafeUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value);
}

/** A question may enter gameplay only when fully verified and sourced. */
export function isPlayableQuestion(question: TrueFalseQuestion): boolean {
  return (
    question.verified === true &&
    question.status === "approved" &&
    typeof question.statement === "string" &&
    question.statement.trim().length >= 8 &&
    typeof question.answer === "boolean" &&
    typeof question.explanation === "string" &&
    question.explanation.trim().length >= 8 &&
    typeof question.sourceName === "string" &&
    question.sourceName.trim().length > 0 &&
    isSafeUrl(question.sourceUrl) &&
    isCategoryKey(question.category) &&
    isDifficulty(question.difficulty)
  );
}

export function normalizeStatement(value: string): string {
  return value
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function dedupeQuestions(questions: TrueFalseQuestion[]): TrueFalseQuestion[] {
  const seenIds = new Set<string>();
  const seenStatements = new Set<string>();
  const result: TrueFalseQuestion[] = [];

  for (const question of questions) {
    const statementKey = normalizeStatement(question.statement);
    if (seenIds.has(question.id) || seenStatements.has(statementKey)) continue;
    seenIds.add(question.id);
    seenStatements.add(statementKey);
    result.push(question);
  }

  return result;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    const target = copy[randomIndex];
    if (current === undefined || target === undefined) continue;
    copy[index] = target;
    copy[randomIndex] = current;
  }
  return copy;
}

/**
 * Builds a fresh round. Category and difficulty are prioritised, then the
 * player's remaining slots are filled from the wider verified bank so a
 * 10/15/20-question round is always possible.
 */
export function buildRound(
  bank: TrueFalseQuestion[],
  setup: TrueFalseSetup,
): TrueFalseQuestion[] {
  const verified = dedupeQuestions(bank.filter(isPlayableQuestion));
  const categoryPool =
    setup.category === "mixed"
      ? verified
      : verified.filter((question) => question.category === setup.category);

  let pool = categoryPool;

  if (setup.difficulty !== "mixed") {
    const exactDifficulty = categoryPool.filter(
      (question) => question.difficulty === setup.difficulty,
    );
    const restOfCategory = categoryPool.filter(
      (question) => question.difficulty !== setup.difficulty,
    );
    pool = [...exactDifficulty, ...restOfCategory];
  }

  if (pool.length < setup.questionCount) {
    const poolIds = new Set(pool.map((question) => question.id));
    pool = [...pool, ...verified.filter((question) => !poolIds.has(question.id))];
  }

  return shuffle(pool).slice(0, Math.min(setup.questionCount, pool.length));
}

export function validateSetup(value: unknown): TrueFalseSetup | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const category = raw["category"];
  const difficulty = raw["difficulty"];
  const questionCount = raw["questionCount"];
  const timerSeconds = raw["timerSeconds"];

  if (
    !isCategoryKey(category) ||
    !isDifficultyFilter(difficulty) ||
    (questionCount !== 10 && questionCount !== 15 && questionCount !== 20) ||
    (timerSeconds !== 5 && timerSeconds !== 10 && timerSeconds !== 15)
  ) {
    return null;
  }

  return {
    category,
    difficulty,
    questionCount,
    timerSeconds,
  };
}
