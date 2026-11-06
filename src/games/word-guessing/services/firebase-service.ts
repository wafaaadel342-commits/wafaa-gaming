import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { GameResultPayload } from "../types";

export const COLLECTIONS = {
  WORDS: "word_guessing_words",
  DAILY_PUZZLES: "word_guessing_daily_puzzles",
  STATS: "word_guessing_player_stats",
  SESSIONS: "word_guessing_sessions",
} as const;

/**
 * Log completed round session to Firestore.
 * Dedicated strictly to the word-guessing game.
 */
export async function logWordGuessingSession(
  result: GameResultPayload,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const currentUserId = auth?.currentUser?.uid || "guest_player";

    // 1. Add session log
    const sessionsCol = collection(db, COLLECTIONS.SESSIONS);
    await addDoc(sessionsCol, {
      userId: currentUserId,
      mode: result.mode,
      dateKey: result.dateKey ?? null,
      won: result.won,
      attemptsCount: result.attemptsCount,
      secretWordId: result.secretWord.id,
      secretWord: result.secretWord.word,
      guesses: result.guesses,
      timeElapsedSeconds: result.timeElapsedSeconds,
      createdAt: serverTimestamp(),
    });

    // 2. Aggregate player stats in Firestore
    if (currentUserId && currentUserId !== "guest_player") {
      const statsRef = doc(db, COLLECTIONS.STATS, currentUserId);
      const prevDoc = await getDoc(statsRef);
      const prev = prevDoc.exists() ? (prevDoc.data() as Record<string, any>) : {};

      const prevPlayed = ((prev["totalGames"] as number) || 0) + 1;
      const prevWins = ((prev["totalWins"] as number) || 0) + (result.won ? 1 : 0);
      const prevStreak = result.won ? (((prev["currentStreak"] as number) || 0) + 1) : 0;
      const prevMaxStreak = Math.max((prev["bestStreak"] as number) || 0, prevStreak);

      await setDoc(
        statsRef,
        {
          userId: currentUserId,
          lastPlayedAt: serverTimestamp(),
          totalGames: prevPlayed,
          totalWins: prevWins,
          currentStreak: prevStreak,
          bestStreak: prevMaxStreak,
        },
        { merge: true },
      );
    }

    return true;
  } catch (error) {
    // Offline / guest fallback
    console.warn("Word Guessing: Firebase log deferred (offline/guest):", error);
    return false;
  }
}
