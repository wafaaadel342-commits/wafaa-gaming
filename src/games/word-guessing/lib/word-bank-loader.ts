/**
 * Word bank loader - handles both local JSON file and Firebase backend.
 * Completely isolated from other games.
 */

import { normalizeArabicWord } from "./normalization";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { WordGuessingWord } from "../types";

const FIRESTORE_WORD_COLLECTION = "word_guessing_words";

/**
 * Load the word bank from Firebase Firestore.
 * Returns a map of wordId → WordGuessingWord.
 */
export async function loadWordBankFromFirebase(): Promise<Map<string, WordGuessingWord>> {
  const wordsCol = await getDocs(collection(db, FIRESTORE_WORD_COLLECTION));
  const wordMap = new Map<string, WordGuessingWord>();

  for (const doc of wordsCol.docs) {
    const data = doc.data() as WordGuessingWord & { id?: string };
    const normalized = normalizeArabicWord(data.normalized || data.word || "");
    if (normalized.length !== 5) continue;

    wordMap.set(doc.id, {
      id: doc.id,
      word: data.word || "",
      normalized,
      meaning: data.meaning || "",
      shortHint: data.shortHint || data.meaning || "",
      category: data.category as import("../types").WordGuessingCategoryKey,
      difficulty: data.difficulty as import("../types").WordGuessingDifficulty,
      language: "ar",
      dialect: (data.dialect as import("../types").WordGuessingWord["dialect"]) ?? "fus'ha",
      status: (data.status as import("../types").WordGuessingWord["status"]) ?? "approved",
      sourceName: data.sourceName ?? "",
      sourceUrl: data.sourceUrl ?? "",
      verificationNote: data.verificationNote ?? "",
      normalizedUsage: data.normalizedUsage ?? [],
      createdAt: data.createdAt ?? Date.now(),
      updatedAt: data.updatedAt ?? Date.now(),
    });
  }

  return wordMap;
}

/**
 * Get daily word key for a given date.
 */
export async function getDailyWordKey(
  dateKey: string,
  wordMap: Map<string, WordGuessingWord>,
): Promise<string | null> {
  const approvedWords: string[] = [];
  for (const [id, word] of wordMap.entries()) {
    if (word.status === "approved") approvedWords.push(id);
  }

  if (approvedWords.length === 0) return null;

  // Use deterministic selection
  const hash = dateKey.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const idx = Math.abs(hash) % approvedWords.length;
  return approvedWords[idx] ?? null;
}

/**
 * Load word for a given word ID from the word map.
 */
export async function loadWordById(
  wordId: string,
  wordMap: Map<string, WordGuessingWord>,
): Promise<WordGuessingWord | null> {
  const word = wordMap.get(wordId);
  if (!word) return null;
  return { ...word };
}