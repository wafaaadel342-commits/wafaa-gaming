/**
 * Parallel AI Generation System
 *
 * Uses 4 free OpenRouter models in parallel to generate questions faster.
 * Distributes question generation across models dynamically and validates all responses.
 */

import { parseQuestions, type Question } from "./quiz";
import {
  parseWordsResponse,
  parseSentencesResponse,
  type WordLevel,
  type SentenceLevel,
  type RawWordDefinition,
  type RawSentenceDefinition,
} from "./words";

// ============================================================================
// CONFIGURATION: 4 FREE MODELS FOR PARALLEL GENERATION
// ============================================================================

export const PARALLEL_FREE_MODELS = ["openrouter/free"] as const;

/** Forced parallel slots when only 1 model is available */
export const FORCED_PARALLEL_SLOTS = 4;

const OPENROUTER_API_KEY =
  "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";

// Model failure tracking (5-minute cooldown)
const failedModels = new Map<string, number>();

function markModelFailed(modelId: string) {
  failedModels.set(modelId, Date.now() + 5 * 60 * 1000);
}

function isModelAvailable(modelId: string): boolean {
  const until = failedModels.get(modelId);
  if (!until) return true;
  if (Date.now() > until) {
    failedModels.delete(modelId);
    return true;
  }
  return false;
}

// ============================================================================
// DYNAMIC DISTRIBUTION ALGORITHM
// ============================================================================

/**
 * Distributes N questions across 4 models dynamically.
 * Examples:
 * - 5 questions: [2, 2, 1, 0]
 * - 10 questions: [3, 3, 2, 2]
 * - 15 questions: [4, 4, 4, 3]
 * - 20 questions: [5, 5, 5, 5]
 */
export function distributeQuestions(total: number, modelCount: number = 4): number[] {
  const effectiveCount = Math.max(4, modelCount); // Always use at least 4 parallel slots
  const distribution: number[] = [];
  const base = Math.floor(total / effectiveCount);
  const remainder = total % effectiveCount;

  for (let i = 0; i < effectiveCount; i++) {
    distribution.push(base + (i < remainder ? 1 : 0));
  }

  return distribution;
}

// ============================================================================
// CENTRALIZED VALIDATION SYSTEM
// ============================================================================

export interface ValidationResult<T> {
  valid: T[];
  invalid: number;
  duplicates: number;
}

/**
 * Validates and deduplicates questions by checking:
 * - Structure completeness
 * - Correct answer validity
 * - Duplicate detection
 */
export function validateQuestions(
  questions: Question[],
  existingKeys: Set<string>,
  getKey: (q: Question) => string,
): ValidationResult<Question> {
  const valid: Question[] = [];
  let invalid = 0;
  let duplicates = 0;

  for (const q of questions) {
    // Check structure
    if (!q.question || !q.options || q.options.length !== 4) {
      invalid++;
      continue;
    }

    // Check correct answer
    if (q.correctIndex < 0 || q.correctIndex > 3 || !q.options[q.correctIndex]) {
      invalid++;
      continue;
    }

    // Check duplicates
    const key = getKey(q);
    if (existingKeys.has(key)) {
      duplicates++;
      continue;
    }

    existingKeys.add(key);
    valid.push(q);
  }

  return { valid, invalid, duplicates };
}

export function validateWords(
  words: RawWordDefinition[],
  existingKeys: Set<string>,
  level: WordLevel,
): ValidationResult<RawWordDefinition> {
  const valid: RawWordDefinition[] = [];
  let invalid = 0;
  let duplicates = 0;

  for (const w of words) {
    if (!w.word || !w.hint || w.word.length < 3) {
      invalid++;
      continue;
    }

    const key = `word:${w.word.toLowerCase()}`;
    if (existingKeys.has(key)) {
      duplicates++;
      continue;
    }

    existingKeys.add(key);
    valid.push(w);
  }

  return { valid, invalid, duplicates };
}

export function validateSentences(
  sentences: RawSentenceDefinition[],
  existingKeys: Set<string>,
): ValidationResult<RawSentenceDefinition> {
  const valid: RawSentenceDefinition[] = [];
  let invalid = 0;
  let duplicates = 0;

  for (const s of sentences) {
    if (!s.sentence || !s.hint || s.sentence.length < 10) {
      invalid++;
      continue;
    }

    const key = `sent:${s.sentence.toLowerCase().slice(0, 50)}`;
    if (existingKeys.has(key)) {
      duplicates++;
      continue;
    }

    existingKeys.add(key);
    valid.push(s);
  }

  return { valid, invalid, duplicates };
}

// ============================================================================
// SINGLE MODEL CALL WITH TIMEOUT
// ============================================================================

async function callSingleModel(
  modelId: string,
  prompt: string,
  timeoutMs: number = 20000,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        "X-Title": "Alab-Wa-Talam Educational Games",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";

    if (!text.trim()) {
      throw new Error("Empty response");
    }

    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ============================================================================
// PARALLEL GENERATION: QUIZ QUESTIONS
// ============================================================================

export interface ParallelGenerationProgress {
  totalRequested: number;
  totalGenerated: number;
  validQuestions: number;
  modelsCompleted: number;
  modelsTotal: number;
  currentBatch: Question[];
}

export async function generateQuestionsParallel(
  buildPrompt: (count: number) => string,
  totalCount: number,
  onProgress?: (progress: ParallelGenerationProgress) => void,
  getQuestionKey?: (q: Question) => string,
): Promise<Question[]> {
  const availableModels = PARALLEL_FREE_MODELS.filter(isModelAvailable);

  if (availableModels.length === 0) {
    // Reset cooldowns if all models are unavailable
    failedModels.clear();
    availableModels.push(...PARALLEL_FREE_MODELS);
  }

  // Ensure we use at least FORCED_PARALLEL_SLOTS concurrent slots
  const effectiveSlots: string[] =
    availableModels.length === 1
      ? Array(FORCED_PARALLEL_SLOTS).fill(availableModels[0])
      : availableModels;

  const distribution = distributeQuestions(totalCount, effectiveSlots.length);
  const existingKeys = new Set<string>();
  const allValidQuestions: Question[] = [];
  let modelsCompleted = 0;

  const keyFn = getQuestionKey || ((q: Question) => q.question);

  // Launch all model requests in parallel
  const modelPromises = effectiveSlots.map(async (modelId, index) => {
    const count = distribution[index];
    if (!count || count === 0) return [];

    try {
      const prompt = buildPrompt(count);
      const rawText = await callSingleModel(modelId, prompt, 25000);
      const questions = parseQuestions(rawText, 1);

      return questions;
    } catch (err) {
      console.warn(`Model ${modelId} failed:`, err);
      markModelFailed(modelId);
      return [];
    }
  });

  // Wait for all models to complete
  const results = await Promise.allSettled(modelPromises);

  // Process results in order
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    modelsCompleted++;

    if (result.status === "fulfilled" && result.value.length > 0) {
      const validation = validateQuestions(result.value, existingKeys, keyFn);
      allValidQuestions.push(...validation.valid);

      if (onProgress) {
        onProgress({
          totalRequested: totalCount,
          totalGenerated: allValidQuestions.length,
          validQuestions: allValidQuestions.length,
          modelsCompleted,
          modelsTotal: availableModels.length,
          currentBatch: [...allValidQuestions],
        });
      }
    }
  }

  return allValidQuestions.slice(0, totalCount);
}

// ============================================================================
// PARALLEL GENERATION: WORDS
// ============================================================================

export async function generateWordsParallel(
  buildPrompt: (count: number) => string,
  totalCount: number,
  level: WordLevel,
  onProgress?: (words: RawWordDefinition[]) => void,
): Promise<RawWordDefinition[]> {
  const availableModels = PARALLEL_FREE_MODELS.filter(isModelAvailable);

  if (availableModels.length === 0) {
    failedModels.clear();
    availableModels.push(...PARALLEL_FREE_MODELS);
  }

  const effectiveSlots: string[] =
    availableModels.length === 1
      ? Array(FORCED_PARALLEL_SLOTS).fill(availableModels[0])
      : availableModels;

  const distribution = distributeQuestions(totalCount, effectiveSlots.length);
  const existingKeys = new Set<string>();
  const allValidWords: RawWordDefinition[] = [];

  const modelPromises = effectiveSlots.map(async (modelId, index) => {
    const count = distribution[index];
    if (!count || count === 0) return [];

    try {
      const prompt = buildPrompt(count);
      const rawText = await callSingleModel(modelId, prompt, 22000);
      const words = parseWordsResponse(rawText, level);

      return words;
    } catch (err) {
      console.warn(`Model ${modelId} failed (words):`, err);
      markModelFailed(modelId);
      return [];
    }
  });

  const results = await Promise.allSettled(modelPromises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      const validation = validateWords(result.value, existingKeys, level);
      allValidWords.push(...validation.valid);

      if (onProgress) {
        onProgress([...allValidWords]);
      }
    }
  }

  return allValidWords.slice(0, totalCount);
}

// ============================================================================
// PARALLEL GENERATION: SENTENCES
// ============================================================================

export async function generateSentencesParallel(
  buildPrompt: (count: number) => string,
  totalCount: number,
  level: SentenceLevel,
  onProgress?: (sentences: RawSentenceDefinition[]) => void,
): Promise<RawSentenceDefinition[]> {
  const availableModels = PARALLEL_FREE_MODELS.filter(isModelAvailable);

  if (availableModels.length === 0) {
    failedModels.clear();
    availableModels.push(...PARALLEL_FREE_MODELS);
  }

  const effectiveSlots: string[] =
    availableModels.length === 1
      ? Array(FORCED_PARALLEL_SLOTS).fill(availableModels[0])
      : availableModels;

  const distribution = distributeQuestions(totalCount, effectiveSlots.length);
  const existingKeys = new Set<string>();
  const allValidSentences: RawSentenceDefinition[] = [];

  const modelPromises = effectiveSlots.map(async (modelId, index) => {
    const count = distribution[index];
    if (!count || count === 0) return [];

    try {
      const prompt = buildPrompt(count);
      const rawText = await callSingleModel(modelId, prompt, 25000);
      const sentences = parseSentencesResponse(rawText, level);

      return sentences;
    } catch (err) {
      console.warn(`Model ${modelId} failed (sentences):`, err);
      markModelFailed(modelId);
      return [];
    }
  });

  const results = await Promise.allSettled(modelPromises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      const validation = validateSentences(result.value, existingKeys);
      allValidSentences.push(...validation.valid);

      if (onProgress) {
        onProgress([...allValidSentences]);
      }
    }
  }

  return allValidSentences.slice(0, totalCount);
}

// ============================================================================
// PROGRESSIVE STREAMING WITH FAST DISPLAY
// ============================================================================

export interface StreamingConfig<T> {
  totalCount: number;
  initialBatchSize: number; // Show first N items immediately
  buildPrompt: (count: number) => string;
  parseResponse: (text: string) => T[];
  validateItem: (item: T, existingKeys: Set<string>) => boolean;
  getKey: (item: T) => string;
  onInitialBatch?: (items: T[]) => void;
  onBackgroundBatch?: (items: T[]) => void;
}

export async function generateWithFastDisplay<T>(config: StreamingConfig<T>): Promise<T[]> {
  const {
    totalCount,
    initialBatchSize,
    buildPrompt,
    parseResponse,
    validateItem,
    getKey,
    onInitialBatch,
    onBackgroundBatch,
  } = config;

  const existingKeys = new Set<string>();
  const allValid: T[] = [];

  // Step 1: Generate initial batch for fast display (use 1-2 fast models)
  const initialCount = Math.min(initialBatchSize, totalCount);
  const fastModels = PARALLEL_FREE_MODELS.slice(0, 2).filter(isModelAvailable);

  if (fastModels.length > 0) {
    const initialDist = distributeQuestions(initialCount, fastModels.length);

    const initialPromises = fastModels.map(async (modelId, index) => {
      const count = initialDist[index];
      if (!count) return [];

      try {
        const prompt = buildPrompt(count);
        const rawText = await callSingleModel(modelId, prompt, 18000);
        return parseResponse(rawText);
      } catch (err) {
        console.warn(`Fast model ${modelId} failed:`, err);
        markModelFailed(modelId);
        return [];
      }
    });

    const initialResults = (await Promise.race([
      Promise.all(initialPromises),
      new Promise<T[][]>((resolve) => setTimeout(() => resolve([]), 20000)),
    ])) as T[][];

    // Process initial results
    for (const items of initialResults) {
      for (const item of items) {
        if (allValid.length >= initialCount) break;
        if (validateItem(item, existingKeys)) {
          existingKeys.add(getKey(item));
          allValid.push(item);
        }
      }
    }

    if (allValid.length >= 2 && onInitialBatch) {
      onInitialBatch([...allValid]);
    }
  }

  // Step 2: Generate remaining in background (use all 4 models)
  const remaining = totalCount - allValid.length;

  if (remaining > 0) {
    const availableModels = PARALLEL_FREE_MODELS.filter(isModelAvailable);
    const bgDist = distributeQuestions(remaining, availableModels.length);

    const backgroundPromises = availableModels.map(async (modelId, index) => {
      const count = bgDist[index];
      if (!count) return [];

      try {
        const prompt = buildPrompt(count);
        const rawText = await callSingleModel(modelId, prompt, 25000);
        return parseResponse(rawText);
      } catch (err) {
        console.warn(`Background model ${modelId} failed:`, err);
        markModelFailed(modelId);
        return [];
      }
    });

    const bgResults = await Promise.all(backgroundPromises);

    for (const items of bgResults) {
      for (const item of items) {
        if (allValid.length >= totalCount) break;
        if (validateItem(item, existingKeys)) {
          existingKeys.add(getKey(item));
          allValid.push(item);
        }
      }

      if (onBackgroundBatch && items.length > 0) {
        onBackgroundBatch([...allValid]);
      }
    }
  }

  return allValid.slice(0, totalCount);
}
