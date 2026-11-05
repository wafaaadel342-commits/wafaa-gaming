import {
  addQuestionsToBank,
  addSentencesToBank,
  addWordsToBank,
  loadQuizBank,
  loadSentencesBank,
  loadWordsBank,
} from "./anti-repeat";
import { questionToBankItem } from "./providers";
import {
  generateQuestionsParallel,
  generateWordsParallel,
  generateSentencesParallel,
} from "./parallel-ai";
import {
  ALL_CATEGORY_KEYS,
  buildPrompt,
  type CategoryKey,
  type Level,
  type Settings,
} from "./quiz";
import {
  buildSentencesPrompt,
  buildWordsPrompt,
  rawSentenceToBankItem,
  rawWordToBankItem,
  type SentenceLevel,
  type WordLevel,
} from "./words";

export type FillTarget = "all" | "quiz" | "words" | "sentences";

export interface FillProgress {
  completed: number;
  total: number;
  currentTask: string;
}

const LEVELS_CYCLE: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];

// ============================================================================
// GLOBAL REACTIVE STATE FOR BANK FILLER
// ============================================================================

export interface GlobalBankFillerState {
  isFilling: boolean;
  progress: FillProgress | null;
  target: FillTarget;
  totalRequested: number;
  addedCount: number;
  lastError?: string;
}

let globalFillerState: GlobalBankFillerState = {
  isFilling: false,
  progress: null,
  target: "all",
  totalRequested: 200,
  addedCount: 0,
};

const listeners = new Set<(state: GlobalBankFillerState) => void>();
let globalCancelFlag = false;

export function getGlobalBankFillerState(): GlobalBankFillerState {
  return globalFillerState;
}

export function subscribeGlobalBankFiller(
  listener: (state: GlobalBankFillerState) => void,
): () => void {
  listeners.add(listener);
  listener(globalFillerState);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener(globalFillerState);
    } catch (err) {
      console.error("Error in bank filler subscriber:", err);
    }
  }
}

export function cancelGlobalBankFilling(): void {
  globalCancelFlag = true;
  globalFillerState = {
    ...globalFillerState,
    isFilling: false,
  };
  notifyListeners();
}

export async function startGlobalBankFilling(
  settings: Settings,
  target: FillTarget = "all",
  totalRequested = 200,
): Promise<{ added: number; error?: string }> {
  if (globalFillerState.isFilling) {
    return { added: globalFillerState.addedCount };
  }

  globalCancelFlag = false;
  globalFillerState = {
    isFilling: true,
    progress: {
      completed: 0,
      total: totalRequested,
      currentTask: "بدء التعبئة التلقائية المتوازية للبنك...",
    },
    target,
    totalRequested,
    addedCount: 0,
  };
  notifyListeners();

  try {
    const res = await runBankFilling(
      settings,
      target,
      totalRequested,
      (p) => {
        globalFillerState = {
          ...globalFillerState,
          progress: p,
          addedCount: p.completed,
        };
        notifyListeners();
      },
      () => globalCancelFlag,
    );

    globalFillerState = {
      ...globalFillerState,
      isFilling: false,
      progress: null,
      lastError: res.error,
    };
    notifyListeners();
    return res;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "خطأ غير متوقع أثناء التعبئة";
    globalFillerState = {
      ...globalFillerState,
      isFilling: false,
      progress: null,
      lastError: errMsg,
    };
    notifyListeners();
    return { added: globalFillerState.addedCount, error: errMsg };
  }
}

// ============================================================================
// CORE BANK FILLING ENGINE (PARALLEL MULTI-CATEGORY)
// ============================================================================

/**
 * Fills the local content bank in parallel batches.
 * When target === "all", generates Quiz, Words, and Sentences simultaneously.
 * Uses 4 parallel free model slots per category.
 */
export async function runBankFilling(
  settings: Settings,
  target: FillTarget,
  totalRequested: number,
  onProgress: (p: FillProgress) => void,
  isCancelled: () => boolean,
): Promise<{ added: number; error?: string }> {
  let completed = 0;
  let cycleIndex = 0;

  if (target === "all") {
    // PACED ALL: Generate quiz -> words -> sentences in round-robin batches
    // Keeps requests well below OpenRouter free rate limits
    const perCategoryBatch = 4; // 4 items per category = 12 items per cycle

    while (completed < totalRequested) {
      if (isCancelled()) {
        return { added: completed };
      }

      const currentLevel = LEVELS_CYCLE[cycleIndex % LEVELS_CYCLE.length]!;
      cycleIndex++;

      const remainingNeeded = totalRequested - completed;
      const thisBatchCount = Math.min(perCategoryBatch, Math.ceil(remainingNeeded / 3));
      let batchAdded = 0;

      // 1. Quiz Questions
      if (!isCancelled() && completed < totalRequested) {
        onProgress({
          completed,
          total: totalRequested,
          currentTask: `توليد أسئلة المعرفة (${currentLevel})...`,
        });

        try {
          const quizBank = loadQuizBank();
          const quizAvoid = quizBank.slice(-60).map((q) => q.topicKey || q.question);
          const categories: CategoryKey[] = ALL_CATEGORY_KEYS;

          const quizQuestions = await generateQuestionsParallel(
            (c) => buildPrompt(currentLevel as Level, c, categories, [], quizAvoid),
            thisBatchCount,
          );

          if (quizQuestions.length > 0) {
            const bankItems = quizQuestions.map((q) => questionToBankItem(q, currentLevel as Level));
            addQuestionsToBank(bankItems);
            batchAdded += bankItems.length;
            completed += bankItems.length;
          }
        } catch (err) {
          console.warn("Quiz batch in all-target had error (continuing):", err);
        }
      }

      // Small pause between categories to prevent rate limits
      if (completed < totalRequested && !isCancelled()) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // 2. Words
      if (!isCancelled() && completed < totalRequested) {
        onProgress({
          completed,
          total: totalRequested,
          currentTask: `توليد كلمات (${currentLevel})...`,
        });

        try {
          const wordsBank = loadWordsBank();
          const wordsAvoid = wordsBank.slice(-60).map((w) => w.word);

          const words = await generateWordsParallel(
            (c) => buildWordsPrompt(currentLevel as WordLevel, c, wordsAvoid),
            thisBatchCount,
            currentLevel as WordLevel,
          );

          if (words.length > 0) {
            const bankItems = words.map((w) =>
              rawWordToBankItem(w, currentLevel as WordLevel),
            );
            addWordsToBank(bankItems);
            batchAdded += bankItems.length;
            completed += bankItems.length;
          }
        } catch (err) {
          console.warn("Words batch in all-target had error (continuing):", err);
        }
      }

      // Small pause between categories
      if (completed < totalRequested && !isCancelled()) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // 3. Sentences
      if (!isCancelled() && completed < totalRequested) {
        onProgress({
          completed,
          total: totalRequested,
          currentTask: `توليد جمل (${currentLevel})...`,
        });

        try {
          const sentencesBank = loadSentencesBank();
          const sentencesAvoid = sentencesBank.slice(-50).map((s) => s.sentence);

          const sentences = await generateSentencesParallel(
            (c) => buildSentencesPrompt(currentLevel as SentenceLevel, c, sentencesAvoid),
            thisBatchCount,
            currentLevel as SentenceLevel,
          );

          if (sentences.length > 0) {
            const bankItems = sentences.map(rawSentenceToBankItem);
            addSentencesToBank(bankItems);
            batchAdded += bankItems.length;
            completed += bankItems.length;
          }
        } catch (err) {
          console.warn("Sentences batch in all-target had error (continuing):", err);
        }
      }

      onProgress({
        completed: Math.min(completed, totalRequested),
        total: totalRequested,
        currentTask: `تم حفظ ${batchAdded} عنصراً في البنك. الاستعداد للمستوى التالي...`,
      });

      if (batchAdded === 0) {
        // If nothing was generated in this cycle, wait 3 seconds before next cycle
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else if (completed < totalRequested && !isCancelled()) {
        // Normal breather between cycles
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    return { added: completed };
  }

  // SINGLE TARGET MODE (quiz, words, or sentences)
  const batchSize = 6;
  while (completed < totalRequested) {
    if (isCancelled()) {
      return { added: completed };
    }

    const currentLevel = LEVELS_CYCLE[cycleIndex % LEVELS_CYCLE.length]!;
    cycleIndex++;

    const countThisBatch = Math.min(batchSize, totalRequested - completed);

    if (target === "quiz") {
      onProgress({
        completed,
        total: totalRequested,
        currentTask: `توليد ${countThisBatch} سؤالاً لتحدّي المعرفة (مستوى: ${currentLevel})...`,
      });

      try {
        const bank = loadQuizBank();
        const avoid = bank.slice(-60).map((q) => q.topicKey || q.question);
        const categories: CategoryKey[] = ALL_CATEGORY_KEYS;
        const rawQuestions = await generateQuestionsParallel(
          (c) => buildPrompt(currentLevel as Level, c, categories, [], avoid),
          countThisBatch,
        );
        const bankItems = rawQuestions.map((q) => questionToBankItem(q, currentLevel as Level));
        addQuestionsToBank(bankItems);
        completed += bankItems.length;
      } catch (err) {
        console.warn("Quiz batch fill failed:", err);
        return {
          added: completed,
          error: completed > 0 ? `تمت إضافة ${completed} عنصراً.` : "تعذرت الاستجابة.",
        };
      }
    } else if (target === "words") {
      onProgress({
        completed,
        total: totalRequested,
        currentTask: `توليد ${countThisBatch} كلمة للعبة ركّب الكلمة (مستوى: ${currentLevel})...`,
      });

      try {
        const bank = loadWordsBank();
        const avoid = bank.slice(-60).map((w) => w.word);
        const parsed = await generateWordsParallel(
          (c) => buildWordsPrompt(currentLevel as WordLevel, c, avoid),
          countThisBatch,
          currentLevel as WordLevel,
        );
        const bankItems = parsed.map((w) => rawWordToBankItem(w, currentLevel as WordLevel));
        addWordsToBank(bankItems);
        completed += bankItems.length;
      } catch (err) {
        console.warn("Words batch fill failed:", err);
        return {
          added: completed,
          error: completed > 0 ? `تمت إضافة ${completed} عنصراً.` : "تعذرت الاستجابة.",
        };
      }
    } else {
      // Sentences
      onProgress({
        completed,
        total: totalRequested,
        currentTask: `توليد ${countThisBatch} جملة للعبة ركّب الجملة (مستوى: ${currentLevel})...`,
      });

      try {
        const bank = loadSentencesBank();
        const avoid = bank.slice(-50).map((s) => s.sentence);
        const parsed = await generateSentencesParallel(
          (c) => buildSentencesPrompt(currentLevel as SentenceLevel, c, avoid),
          countThisBatch,
          currentLevel as SentenceLevel,
        );
        const bankItems = parsed.map(rawSentenceToBankItem);
        addSentencesToBank(bankItems);
        completed += bankItems.length;
      } catch (err) {
        console.warn("Sentences batch fill failed:", err);
        return {
          added: completed,
          error: completed > 0 ? `تمت إضافة ${completed} عنصراً.` : "تعذرت الاستجابة.",
        };
      }
    }

    if (completed < totalRequested && !isCancelled()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  return { added: completed };
}
