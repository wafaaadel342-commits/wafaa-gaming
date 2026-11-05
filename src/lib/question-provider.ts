/**
 * Unified question provider — selects the delivery backend from Settings.
 *
 *  - `localStorage` mode (default): the existing offline-first behavior —
 *    local content bank + OpenRouter parallel generation. Untouched.
 *  - `firestore` mode (opt-in): reads approved questions from Firebase
 *    Cloud Firestore. OpenRouter keeps generating in the background.
 *
 * The Firestore path is fail-safe: any error falls back to the existing local
 * bank / OpenRouter pipeline so gameplay never depends on Firebase or AI.
 */

import { loadQuizBank, selectRoundBankItems, type BankQuizItem } from "./anti-repeat";
import { prepareRoundQuestions } from "./images";
import { bankItemToQuestion, fetchInitialBatch, fetchRemainingBatch } from "./providers";
import {
  getQuestionDedupeKey,
  type CategoryKey,
  type Level,
  type Question,
  type Settings,
} from "./quiz";
import { dedupeFirestoreQuestions, readRoundBatch } from "./fb-questions";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface FetchOptions {
  level: Level;
  categories: CategoryKey[];
  count: number;
}

/** Cursor for the current round's Firestore pagination (reset each new round). */
let roundCursor: QueryDocumentSnapshot<DocumentData> | null = null;

/** Fetch the first batch of a round. Never blocks on Firestore or AI. */
export async function fetchQuestionsBatch(
  options: FetchOptions,
  settings: Settings,
): Promise<Question[]> {
  if (settings.questionBackend === "firestore") {
    roundCursor = null;
    return fetchFirestoreBatch(options, settings);
  }
  return fetchInitialBatch(options.level, settings, options.categories).then((questions) =>
    questions.slice(0, options.count),
  );
}

/** Prefetch the remaining questions of a round, streaming batches as ready. */
export async function prefetchQuestions(
  options: FetchOptions,
  settings: Settings,
  currentQuestions: Question[],
  onBatchReady?: (batch: Question[]) => void,
): Promise<Question[]> {
  if (settings.questionBackend === "firestore") {
    return prefetchFirestoreBatch(options, settings, currentQuestions, onBatchReady);
  }

  const remaining = options.count - currentQuestions.length;
  if (remaining <= 0) return [];
  return fetchRemainingBatch(
    options.level,
    settings,
    remaining,
    options.categories,
    currentQuestions,
    onBatchReady,
  );
}

// ---------------------------------------------------------------------------
// FIRESTORE PATH
// ---------------------------------------------------------------------------

async function fetchFirestoreBatch(options: FetchOptions, settings: Settings): Promise<Question[]> {
  try {
    const batch = await readRoundBatch(
      options.level,
      options.categories,
      Math.max(options.count, 3),
      roundCursor ?? undefined,
    );
    roundCursor = batch.nextDoc;
    const questions = batch.questions;
    const prepared = await prepareRoundQuestions(questions, questions.length, 3000);
    if (prepared.length >= 2) return prepared.slice(0, options.count);

    // Firestore had too few usable rows (e.g. not seeded yet) — fall back.
    return localFastStart(options, settings);
  } catch (err) {
    console.warn("[question-provider] Firestore initial fetch failed, using local fallback:", err);
    return localFastStart(options, settings);
  }
}

async function prefetchFirestoreBatch(
  options: FetchOptions,
  settings: Settings,
  currentQuestions: Question[],
  onBatchReady?: (batch: Question[]) => void,
): Promise<Question[]> {
  const remaining = options.count - currentQuestions.length;
  if (remaining <= 0) return [];

  try {
    const batch = await readRoundBatch(
      options.level,
      options.categories,
      remaining + 2,
      roundCursor ?? undefined,
    );
    roundCursor = batch.nextDoc;
    const questions = batch.questions;

    const existingKeys = new Set(currentQuestions.map(getQuestionDedupeKey));
    const fresh = dedupeFirestoreQuestions(questions).filter(
      (q) => !existingKeys.has(getQuestionDedupeKey(q)),
    );

    const prepared = await prepareRoundQuestions(fresh, remaining, 3000);
    if (prepared.length > 0) onBatchReady?.(prepared);
    if (prepared.length >= remaining) return prepared.slice(0, remaining);

    // Top up from the existing pipeline so the round can finish.
    const stillNeeded = remaining - prepared.length;
    const topUp = await fetchRemainingBatch(
      options.level,
      settings,
      stillNeeded,
      options.categories,
      [...currentQuestions, ...prepared],
      onBatchReady,
    );
    return [...prepared, ...topUp].slice(0, remaining);
  } catch (err) {
    console.warn("[question-provider] Firestore prefetch failed, using local pipeline:", err);
    return fetchRemainingBatch(
      options.level,
      settings,
      remaining,
      options.categories,
      currentQuestions,
      onBatchReady,
    );
  }
}

/** Instant fast start from the local bank, or the existing AI/fallback pipeline. */
async function localFastStart(options: FetchOptions, settings: Settings): Promise<Question[]> {
  const bank = loadQuizBank();
  const { chosen } = selectRoundBankItems<BankQuizItem>(
    bank,
    options.level,
    Math.max(3, options.count),
    (item) => options.categories.includes(item.category as CategoryKey),
  );

  if (chosen.length >= 2) {
    const prepared = await prepareRoundQuestions(
      chosen.map(bankItemToQuestion),
      chosen.length,
      2500,
    );
    if (prepared.length >= 2) return prepared.slice(0, options.count);
  }

  const generated = await fetchInitialBatch(options.level, settings, options.categories);
  return generated.slice(0, options.count);
}

// ---------------------------------------------------------------------------
// BACKGROUND GENERATION TRIGGER (Firestore low-water mark)
// ---------------------------------------------------------------------------

/**
 * Fire-and-forget request to refill the shared Firestore inventory.
 * Uses the callable Cloud Function; safe to ignore failures.
 * Never awaited by the UI.
 */
export function requestBackgroundGeneration(level: Level, categories: CategoryKey[]): void {
  void (async () => {
    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const { default: firebaseApp } = await import("./firebase");
      const functions = getFunctions(firebaseApp, "us-central1");
      const preflight = httpsCallable(functions, "preflightGenerationJob");
      await preflight({ level, categories });
    } catch (err) {
      // Background only — never surface to the player.
      console.debug("[question-provider] background generation trigger skipped:", err);
    }
  })();
}
