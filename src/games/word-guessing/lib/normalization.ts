/**
 * Arabic Normalization Module.
 * Dedicated specifically for the Arabic Word Guessing game.
 * Ensures consistent handling across validation, comparison, and counting.
 */

const DIACRITICS_REGEX = /[\u064B-\u065F\u0670]/g;
const INVISIBLE_CHARS_REGEX = /[\u200B-\u200F\u202A-\u202E\uFEFF]/g;
const TATWEEL_REGEX = /\u0640/g;
const ALEF_VARIANTS_REGEX = /[أإآٱ]/g;

/**
 * Normalizes an Arabic word strictly for matching:
 * - NFKC decomposition/composition
 * - Strips zero-width & directional controls
 * - Strips Tashkeel
 * - Strips Tatweel (ـ)
 * - Normalizes Alef variants (أ، إ، آ، ٱ) into bare Alef (ا)
 * - Keeps ة distinct from ه
 * - Keeps ى distinct from ي
 * - Keeps ؤ and ئ distinct
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  let s = text.normalize("NFKC");
  s = s.replace(INVISIBLE_CHARS_REGEX, "");
  s = s.replace(DIACRITICS_REGEX, "");
  s = s.replace(TATWEEL_REGEX, "");
  s = s.replace(ALEF_VARIANTS_REGEX, "ا");
  return s.trim();
}

/**
 * Grapheme-aware segmentation for Arabic text using Intl.Segmenter.
 */
export function getArabicGraphemes(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  // Fallback
  return Array.from(text);
}

/**
 * Returns grapheme count of normalized word.
 */
export function getNormalizedLength(word: string): number {
  const norm = normalizeArabic(word);
  return getArabicGraphemes(norm).length;
}

/**
 * Splits normalized word into array of exactly 5 letters.
 */
export function getLettersArray(word: string): string[] {
  const norm = normalizeArabic(word);
  return getArabicGraphemes(norm);
}
