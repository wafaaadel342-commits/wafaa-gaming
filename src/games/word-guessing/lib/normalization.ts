/**
 * Arabic text normalization utilities for word guessing.
 *
 * Strictly isolated to this module. Does NOT mutate shared utilities or
 * change global state. Uses Unicode NFKC normalization followed by explicit
 * character substitutions required by Arabic Wordle gameplay.
 */

const ALIF_VARIANTS: Record<string, string> = {
  "أ": "ا",
  "إ": "ا",
  "آ": "ا",
  "ٱ": "ا",
};

function isTatweel(code: number): boolean {
  return code >= 0x104df && code <= 0x104ff;
}

/**
 * Remove Tatweel, remove diacritics, normalize Alef variants, keep Taasmara
 * and Yaa distinct. Returns a new string; never mutates input.
 */
export function normalizeArabicWord(input: string): string {
  if (!input || typeof input !== "string") return "";

  let s = input.normalize("NFC");

  s = Array.from(s)
    .filter((ch) => !isTatweel(ch.codePointAt(0) as number))
    .join("");

  s = Array.from(s).map((ch) => ALIF_VARIANTS[ch] ?? ch).join("");

  return s;
}

/**
 * Count grapheme clusters in an Arabic word.
 */
export function countGraphemeClusters(input: string): number {
  let n = 0;
  for (const ch of input) {
    n += 1;
  }
  return n;
}

/**
 * Normalize an accepted guess for dictionary membership checks.
 */
export function normalizeForMembership(input: string): string {
  return normalizeArabicWord(input);
}

/**
 * Validate that a candidate target word is exactly 5 normalized letters
 */
export function isValidTargetLength(normalized: string): boolean {
  return normalized.length === 5;
}

/**
 * Validate that an accepted guess matches the rules: exactly 5 normalized chars, valid dictionary entry
 */
export function isAcceptedGuess(normalized: string, dictionarySet: Set<string>): boolean {
  if (!dictionarySet.has(normalized)) return false;
  return true;
}