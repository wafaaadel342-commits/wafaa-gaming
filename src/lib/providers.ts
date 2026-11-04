import {
  addQuestionsToBank,
  cyrb53,
  fillFromLeastRecentlySeen,
  loadQuizBank,
  selectRoundBankItems,
  type BankQuizItem,
} from "./anti-repeat";
import { prepareRoundQuestions } from "./images";
import { fetchOpenRouterModels } from "./models";
import {
  buildPrompt,
  DEFAULT_OPENROUTER_KEY,
  getQuestionDedupeKey,
  getRecent,
  parseQuestions,
  QuizError,
  rememberQuestions,
  type CategoryKey,
  type Level,
  type Question,
  type Settings,
} from "./quiz";

export interface Candidate {
  provider: "openrouter";
  modelId: string;
  apiKey: string;
}

// Known reliable free OpenRouter models ordered by quality/speed
// openrouter/free is a meta-router that automatically routes to available free models
export const DEFAULT_FREE_MODELS: string[] = [
  "openrouter/free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "liquid/lfm-2.5-2.6b:free",
  "nvidia/nemotron-3.5-super-vl:free",
  "cohere/north-mini-code:free",
];

// In-memory model failure tracking (5-minute skip)
const failedModels = new Map<string, number>();

function markModelFailed(modelId: string) {
  failedModels.set(modelId, Date.now() + 5 * 60 * 1000);
}

function isModelCoolingDown(modelId: string): boolean {
  const until = failedModels.get(modelId);
  if (!until) return false;
  if (Date.now() > until) {
    failedModels.delete(modelId);
    return false;
  }
  return true;
}

/** Record the last successfully used model for display in Settings */
export function recordLastUsedModel(modelLabel: string) {
  try {
    const raw = localStorage.getItem("tahaddi-settings");
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.lastUsedModel = modelLabel;
    localStorage.setItem("tahaddi-settings", JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

/**
 * Returns candidate free models for OpenRouter.
 * Checks for dynamically detected free models and combines them with DEFAULT_FREE_MODELS.
 */
function getFreeModelPool(): string[] {
  const modelsSet = new Set<string>(DEFAULT_FREE_MODELS);

  try {
    const raw = localStorage.getItem("tahaddi-models-openrouter");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.models)) {
        for (const m of parsed.models) {
          if (m?.isFree && typeof m.id === "string" && m.id.endsWith(":free")) {
            modelsSet.add(m.id);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // Pre-fetch latest free models in the background for subsequent calls
  if (typeof window !== "undefined") {
    void fetchOpenRouterModels().catch(() => {});
  }

  return Array.from(modelsSet);
}

/**
 * Builds candidate pool of free OpenRouter models, filtering out cooling down models.
 * Automatically tries the best available free model first, with others as fallbacks.
 */
function buildCandidates(settings?: Settings): Candidate[] {
  const apiKey =
    (settings?.openrouterKey && settings.openrouterKey.trim()) || DEFAULT_OPENROUTER_KEY;

  const pool = getFreeModelPool();

  // Filter out models that are cooling down
  let available = pool.filter((m) => !isModelCoolingDown(m));

  // If all free models are cooling down, reset and try all again
  if (available.length === 0) {
    failedModels.clear();
    available = [...pool];
  }

  return available.map((modelId) => ({
    provider: "openrouter",
    modelId,
    apiKey,
  }));
}

/** Single candidate attempt with timeout */
async function callCandidate(
  candidate: Candidate,
  prompt: string,
  timeoutMs: number,
  minCount: number,
): Promise<Question[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidate.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        "X-Title": "Thaqqif Nafsak Quiz Game",
      },
      body: JSON.stringify({
        model: candidate.modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Empty response from OpenRouter");

    return parseQuestions(text, minCount);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Executes a request trying candidates from the free OpenRouter pool with automatic failover.
 */
export async function executeWithFailover(
  settings: Settings,
  prompt: string,
  timeoutMs: number,
  minCount: number,
): Promise<Question[]> {
  const candidates = buildCandidates(settings);
  if (candidates.length === 0) {
    throw new QuizError("MISSING_KEY");
  }

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const questions = await callCandidate(candidate, prompt, timeoutMs, minCount);
      recordLastUsedModel(`OpenRouter (${candidate.modelId})`);
      return questions;
    } catch (err) {
      console.warn(`Model ${candidate.modelId} failed, switching to next free model:`, err);
      lastError = err;
      markModelFailed(candidate.modelId);
    }
  }

  // All candidates failed
  if (lastError instanceof QuizError) throw lastError;
  throw new QuizError("SERVER");
}

/** Single raw candidate attempt returning raw text with timeout */
async function callRawCandidate(
  candidate: Candidate,
  prompt: string,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidate.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        "X-Title": "Thaqqif Nafsak Quiz Game",
      },
      body: JSON.stringify({
        model: candidate.modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Empty response from OpenRouter");

    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Executes a raw prompt with automatic failover across free OpenRouter candidates.
 */
export async function executeRawWithFailover(
  settings: Settings,
  prompt: string,
  timeoutMs = 25000,
): Promise<string> {
  const candidates = buildCandidates(settings);
  if (candidates.length === 0) {
    throw new QuizError("MISSING_KEY");
  }

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const text = await callRawCandidate(candidate, prompt, timeoutMs);
      recordLastUsedModel(`OpenRouter (${candidate.modelId})`);
      return text;
    } catch (err) {
      console.warn(`Model ${candidate.modelId} failed, switching to next free model:`, err);
      lastError = err;
      markModelFailed(candidate.modelId);
    }
  }

  if (lastError instanceof QuizError) throw lastError;
  throw new QuizError("SERVER");
}

/** Convert Question to BankQuizItem without resolved imageUrl */
export function questionToBankItem(q: Question, level: Level): BankQuizItem {
  const key = getQuestionDedupeKey(q);
  return {
    id: cyrb53(key),
    key,
    level,
    category: q.category,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    topicKey: q.topicKey,
    countryCode: q.countryCode,
    imageQuery: q.imageQuery,
    addedAt: Date.now(),
  };
}

/** Convert BankQuizItem to Question */
export function bankItemToQuestion(item: BankQuizItem): Question {
  return {
    category: item.category,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
    topicKey: item.topicKey,
    countryCode: item.countryCode,
    imageQuery: item.imageQuery,
  };
}

/**
 * Step 1: Initial batch load (fast start).
 * First checks bank for 2-3 matching unseen questions.
 * If bank is short, generates 3 questions from AI and stores in bank.
 * Starts immediately as soon as 2 questions are ready.
 */
export async function fetchInitialBatch(
  level: Level,
  settings: Settings,
  categories: CategoryKey[],
): Promise<Question[]> {
  // 1. Check persistent bank first (0ms instantaneous start if available)
  const bank = loadQuizBank();
  const { chosen } = selectRoundBankItems<BankQuizItem>(bank, level, 3, (item) =>
    categories.includes(item.category as CategoryKey),
  );

  if (chosen.length >= 2) {
    const questions = chosen.map(bankItemToQuestion);
    const prepared = await prepareRoundQuestions(questions, Math.min(chosen.length, 3), 2500);
    if (prepared.length >= 2) {
      rememberQuestions(prepared);
      return prepared;
    }
  }

  // 2. Shortfall: request 3 questions from AI for instant start
  const recent = getRecent();
  const avoidKeys = bank.slice(-60).map((b) => b.topicKey || b.question);
  const prompt = buildPrompt(level, 3, categories, recent, avoidKeys);

  const tryFetch = async (): Promise<Question[]> => {
    const raw = await executeWithFailover(settings, prompt, 18000, 1);
    // Store in bank immediately before resolving images (so spares are preserved)
    addQuestionsToBank(raw.map((q) => questionToBankItem(q, level)));
    const prepared = await prepareRoundQuestions(raw, 2, 3500);
    return prepared;
  };

  try {
    const result = await tryFetch();
    if (result.length >= 2) {
      rememberQuestions(result);
      return result;
    }

    // If 1 question prepared, supplement with least-recently-seen bank item to avoid waiting
    if (result.length === 1) {
      const fallback = fillFromLeastRecentlySeen<BankQuizItem>(
        bank,
        level,
        1,
        new Set(result.map(getQuestionDedupeKey)),
        (item) => categories.includes(item.category as CategoryKey),
      );
      if (fallback.length > 0) {
        const combined = [...result, ...fallback.map(bankItemToQuestion)];
        rememberQuestions(combined);
        return combined;
      }
    }

    if (result.length === 0) {
      throw new QuizError("INVALID_RESPONSE");
    }
    rememberQuestions(result);
    return result;
  } catch (e) {
    // If AI fails, check if we have any least-recently-seen bank items as fallback
    const fallbackBankItems = fillFromLeastRecentlySeen<BankQuizItem>(
      bank,
      level,
      2,
      new Set(),
      (item) => categories.includes(item.category as CategoryKey),
    );
    if (fallbackBankItems.length >= 2) {
      const prepared = await prepareRoundQuestions(
        fallbackBankItems.map(bankItemToQuestion),
        2,
        3000,
      );
      if (prepared.length >= 2) {
        rememberQuestions(prepared);
        return prepared;
      }
    }
    throw e;
  }
}

/**
 * Step 2: Progressive background loader for all remaining questions.
 * Streams questions incrementally to onBatchReady as soon as they are ready.
 * Generates in fast chunks of 3-4 questions so user never hits a bottleneck.
 */
export async function fetchRemainingBatch(
  level: Level,
  settings: Settings,
  remainingNeeded: number,
  categories: CategoryKey[],
  existingQuestions: Question[],
  onBatchReady?: (batch: Question[]) => void,
): Promise<Question[]> {
  if (remainingNeeded <= 0) return [];

  const bank = loadQuizBank();
  const existingKeys = new Set(existingQuestions.map(getQuestionDedupeKey));
  const accumulated: Question[] = [];

  // 1. Immediately yield matching bank items if any exist
  const { chosen: bankChosen, shortfall } = selectRoundBankItems<BankQuizItem>(
    bank,
    level,
    remainingNeeded,
    (item) => categories.includes(item.category as CategoryKey) && !existingKeys.has(item.key),
  );

  if (bankChosen.length > 0) {
    const bankQuestions = bankChosen.map(bankItemToQuestion);
    const preparedBank = await prepareRoundQuestions(bankQuestions, bankQuestions.length, 3000);
    if (preparedBank.length > 0) {
      for (const q of preparedBank) {
        existingKeys.add(getQuestionDedupeKey(q));
        accumulated.push(q);
      }
      rememberQuestions(preparedBank);
      onBatchReady?.(preparedBank);
    }
  }

  let stillNeeded = remainingNeeded - accumulated.length;

  // 2. Fetch remaining shortfall in progressive chunks of 3-4 questions
  while (stillNeeded > 0) {
    const chunkSize = Math.min(4, stillNeeded);
    const countToGenerate = chunkSize + 2; // +2 spares
    const recent = getRecent();
    const avoidTitles = [
      ...existingQuestions.map((q) => q.question),
      ...accumulated.map((q) => q.question),
      ...bank.slice(-60).map((b) => b.topicKey || b.question),
    ];

    const prompt = buildPrompt(level, countToGenerate, categories, recent, avoidTitles);

    try {
      const raw = await executeWithFailover(settings, prompt, 30000, 1);
      // Store to persistent bank
      addQuestionsToBank(raw.map((q) => questionToBankItem(q, level)));

      // Prepare images with fast timeout
      const prepared = await prepareRoundQuestions(raw, chunkSize, 3500);

      // Filter duplicates
      const uniqueNew = prepared.filter((q) => !existingKeys.has(getQuestionDedupeKey(q)));

      if (uniqueNew.length > 0) {
        for (const q of uniqueNew) {
          existingKeys.add(getQuestionDedupeKey(q));
          accumulated.push(q);
        }
        stillNeeded -= uniqueNew.length;
        rememberQuestions(uniqueNew);
        // Progressively notify UI
        onBatchReady?.(uniqueNew);
      } else {
        // Break if AI returned only duplicates to avoid infinite loop
        break;
      }
    } catch (err) {
      console.warn("Background chunk fetch error:", err);
      // Fallback from least-recently-seen bank if AI encounters rate limits or errors
      const fallback = fillFromLeastRecentlySeen<BankQuizItem>(
        bank,
        level,
        stillNeeded,
        existingKeys,
        (item) => categories.includes(item.category as CategoryKey),
      );
      if (fallback.length > 0) {
        const preparedFallback = await prepareRoundQuestions(
          fallback.map(bankItemToQuestion),
          fallback.length,
          3000,
        );
        for (const q of preparedFallback) {
          existingKeys.add(getQuestionDedupeKey(q));
          accumulated.push(q);
        }
        rememberQuestions(preparedFallback);
        onBatchReady?.(preparedFallback);
      }
      break;
    }
  }

  return accumulated;
}
