/**
 * Firebase service for Word Guessing game.
 *
 * Completely isolated from other games. Uses shared Firebase init from
 * @/lib/firebase. Collections:
 * - word_guessing_words
 * - word_guessing_daily_puzzles
 * - word_guessing_player_stats
 * - word_guessing_sessions
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  runTransaction,
  DocumentData,
} from "firebase/firestore";

import type { WordGuessingWord, WordGuessingStats, WordGuessingSetup, WordGuessingResult } from "../types";

const WORDS_COLLECTION = "word_guessing_words";
const DAILY_COLLECTION = "word_guessing_daily_puzzles";
const STATS_COLLECTION = "word_guessing_player_stats";
const SESSIONS_COLLECTION = "word_guessing_sessions";

/** Approved words only - never expose pending/rejected words to public queries */
export async function fetchApprovedWords(): Promise<WordGuessingWord[]> {
  const wordsCol = collection(db, WORDS_COLLECTION);
  const q = query(wordsCol, where("status", "==", "approved"), orderBy("updatedAt", "desc"), limit(2000));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WordGuessingWord));
}

/** Get daily word for a given date - server-side selection */
export async function getDailyWord(dateKey: string): Promise<WordGuessingWord | null> {
  const dailyRef = doc(db, DAILY_COLLECTION, dateKey);
  const dailySnap = await getDoc(dailyRef);

  if (!dailySnap.exists()) return null;

  const dailyData = dailySnap.data() as { wordId?: string };
  if (!dailyData.wordId) return null;

  const wordRef = doc(db, WORDS_COLLECTION, dailyData.wordId);
  const wordSnap = await getDoc(wordRef);
  if (!wordSnap.exists()) return null;

  return { id: wordSnap.id, ...wordSnap.data() } as WordGuessingWord;
}

/** Create daily puzzle entry - secure, no word exposed publicly */
export async function createDailyPuzzle(
  dateKey: string,
  wordId: string
): Promise<void> {
  await setDoc(
    doc(db, DAILY_COLLECTION, dateKey),
    {
      date: dateKey,
      wordId,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 86400000)), // +1 day
    },
    { merge: true }
  );
}

/** Save player stats */
export async function savePlayerStats(userId: string, stats: WordGuessingStats): Promise<void> {
  await setDoc(
    doc(db, STATS_COLLECTION, userId),
    {
      userId,
      stats,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Get player stats */
export async function getPlayerStats(userId: string): Promise<WordGuessingStats | null> {
  const ref = doc(db, STATS_COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return data["stats"] as WordGuessingStats;
}

/** Record a game session */
export async function saveSession(
  userId: string | undefined,
  setup: WordGuessingSetup,
  result: WordGuessingResult
): Promise<void> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
    sessionId,
    userId,
    setup,
    result,
    startedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
    expired: false,
  });
}

/** Count approved words */
export async function countApprovedWords(): Promise<number> {
  const wordsCol = collection(db, WORDS_COLLECTION);
  const q = query(wordsCol, where("status", "==", "approved"), limit(1));
  const snap = await getDocs(q);
  return snap.size;
}