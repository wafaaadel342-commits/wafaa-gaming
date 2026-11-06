import {
  EGYPTIAN_QA_PAIRS,
  EGYPTIAN_VISUAL_SYMBOLS,
} from "../data/egyptian-content";
import type {
  DifficultyLevel,
  GameMode,
  MemoryCard,
  QuestionAnswerPairItem,
  VisualSymbolItem,
} from "../types";

/**
 * Fisher-Yates shuffle implementation.
 */
function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const itemI = result[i];
    const itemJ = result[j];
    if (itemI !== undefined && itemJ !== undefined) {
      result[i] = itemJ;
      result[j] = itemI;
    }
  }
  return result;
}

/**
 * Generate cards for Visual Memory Matching mode.
 */
export function generateVisualCards(
  pairsCount: number,
  categoryFilter: string = "all",
): MemoryCard[] {
  let pool = EGYPTIAN_VISUAL_SYMBOLS;

  if (categoryFilter !== "all") {
    const filtered = pool.filter((item) => item.category === categoryFilter);
    if (filtered.length >= pairsCount) {
      pool = filtered;
    }
  }

  // Shuffle pool to pick distinct symbols
  const shuffledSymbols = shuffleArray(pool);
  const selectedSymbols: VisualSymbolItem[] = shuffledSymbols.slice(
    0,
    Math.min(pairsCount, shuffledSymbols.length),
  );

  const cards: MemoryCard[] = [];

  selectedSymbols.forEach((sym) => {
    const pairId = `pair-vs-${sym.symbol_key}`;

    cards.push({
      id: `card-${sym.symbol_key}-1`,
      pairId,
      mode: "visual",
      cardType: "symbol",
      visual: {
        symbolKey: sym.symbol_key,
        label: sym.label_ar,
        category: sym.category,
      },
      isFlipped: false,
      isMatched: false,
    });

    cards.push({
      id: `card-${sym.symbol_key}-2`,
      pairId,
      mode: "visual",
      cardType: "symbol",
      visual: {
        symbolKey: sym.symbol_key,
        label: sym.label_ar,
        category: sym.category,
      },
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

/**
 * Generate cards for Egyptian Knowledge Matching mode.
 * Guarantees no two questions share identical answers on the same board.
 */
export function generateKnowledgeCards(
  pairsCount: number,
  difficulty: DifficultyLevel,
  categoryFilter: string = "all",
): MemoryCard[] {
  let pool = EGYPTIAN_QA_PAIRS;

  if (categoryFilter !== "all") {
    const filtered = pool.filter((item) => item.category === categoryFilter);
    if (filtered.length >= pairsCount) {
      pool = filtered;
    }
  }

  // Soft difficulty preference
  const targetDiff = difficulty === "expert" ? "hard" : difficulty;
  const matchDifficulty = pool.filter((qa) => qa.difficulty === targetDiff);
  const candidatePool =
    matchDifficulty.length >= pairsCount ? matchDifficulty : pool;

  const shuffledCandidates = shuffleArray(candidatePool);

  const selectedPairs: QuestionAnswerPairItem[] = [];
  const chosenAnswers = new Set<string>();

  for (const item of shuffledCandidates) {
    if (selectedPairs.length >= pairsCount) break;
    const cleanAnswer = item.answer.trim().toLowerCase();
    // Prevent duplicate answer mapping on the same board!
    if (!chosenAnswers.has(cleanAnswer)) {
      chosenAnswers.add(cleanAnswer);
      selectedPairs.push(item);
    }
  }

  // Fallback if not enough unique answers found with filter
  if (selectedPairs.length < pairsCount) {
    for (const item of shuffleArray(EGYPTIAN_QA_PAIRS)) {
      if (selectedPairs.length >= pairsCount) break;
      const cleanAnswer = item.answer.trim().toLowerCase();
      if (!chosenAnswers.has(cleanAnswer)) {
        chosenAnswers.add(cleanAnswer);
        selectedPairs.push(item);
      }
    }
  }

  const cards: MemoryCard[] = [];

  selectedPairs.forEach((qa) => {
    const pairId = `pair-qa-${qa.id}`;

    // Question card
    cards.push({
      id: `card-${qa.id}-q`,
      pairId,
      mode: "knowledge",
      cardType: "question",
      knowledge: {
        text: qa.question,
        role: "question",
        category: qa.category,
        explanation: qa.explanation,
        sourceName: qa.source_name ?? undefined,
      },
      isFlipped: false,
      isMatched: false,
    });

    // Answer card
    cards.push({
      id: `card-${qa.id}-a`,
      pairId,
      mode: "knowledge",
      cardType: "answer",
      knowledge: {
        text: qa.answer,
        role: "answer",
        category: qa.category,
        explanation: qa.explanation,
        sourceName: qa.source_name ?? undefined,
      },
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

/**
 * Unified board generator.
 */
export function generateGameBoard(
  mode: GameMode,
  difficulty: DifficultyLevel,
  pairsCount: number,
  categoryFilter: string = "all",
): MemoryCard[] {
  if (mode === "knowledge") {
    return generateKnowledgeCards(pairsCount, difficulty, categoryFilter);
  }
  return generateVisualCards(pairsCount, categoryFilter);
}
