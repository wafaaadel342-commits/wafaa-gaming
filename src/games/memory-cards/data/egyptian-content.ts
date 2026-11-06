import type { QuestionAnswerPairItem, VisualSymbolItem } from "../types";
import dataset from "./egyptian-content.json";

export const EGYPTIAN_QA_PAIRS: QuestionAnswerPairItem[] =
  dataset.question_answer_pairs as QuestionAnswerPairItem[];

export const EGYPTIAN_VISUAL_SYMBOLS: VisualSymbolItem[] =
  dataset.visual_symbol_pairs as VisualSymbolItem[];

export const TOTAL_QA_PAIRS_COUNT = EGYPTIAN_QA_PAIRS.length;
export const TOTAL_VISUAL_SYMBOLS_COUNT = EGYPTIAN_VISUAL_SYMBOLS.length;

