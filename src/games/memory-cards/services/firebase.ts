import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { GameResult } from "../types";

export const MEMORY_CARDS_COLLECTIONS = {
  STATS: "memory_cards_stats",
  USER_PROGRESS: "memory_cards_user_progress",
  DECKS: "memory_cards_decks",
  PAIRS: "memory_cards_pairs",
} as const;

/**
 * Log game session result to Firestore.
 * Completely isolated from other games' collections.
 * Automatically catches and falls back if Firebase is unreachable or offline.
 */
export async function logMemoryGameResult(result: GameResult): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const currentUserId = auth?.currentUser?.uid || "guest_player";

    // 1. Add session log to memory_cards_stats
    const statsCol = collection(db, MEMORY_CARDS_COLLECTIONS.STATS);
    await addDoc(statsCol, {
      userId: currentUserId,
      mode: result.mode,
      difficulty: result.difficulty,
      score: result.score,
      moves: result.moves,
      pairs: result.pairs,
      elapsedSeconds: result.elapsedSeconds,
      accuracy: result.accuracy,
      maxStreak: result.maxStreak,
      isNewBest: result.isNewBest,
      completedAt: result.completedAt,
      createdAt: serverTimestamp(),
    });

    // 2. If logged in user or guest progress tracking
    if (currentUserId) {
      const progressRef = doc(
        db,
        MEMORY_CARDS_COLLECTIONS.USER_PROGRESS,
        currentUserId,
      );
      const prevDoc = await getDoc(progressRef);
      const prevData = prevDoc.exists() ? (prevDoc.data() as Record<string, any>) : {};

      const prevModes = (prevData["gamesPlayedByMode"] as Record<string, number>) || {};
      const currentModeCount = (prevModes[result.mode] || 0) + 1;
      const totalGames = ((prevData["totalGamesPlayed"] as number) || 0) + 1;
      const bestScore = Math.max((prevData["highestScore"] as number) || 0, result.score);

      await setDoc(
        progressRef,
        {
          userId: currentUserId,
          lastPlayedAt: serverTimestamp(),
          totalGamesPlayed: totalGames,
          highestScore: bestScore,
          gamesPlayedByMode: {
            ...prevModes,
            [result.mode]: currentModeCount,
          },
        },
        { merge: true },
      );
    }

    return true;
  } catch (error) {
    // Graceful offline fallback: log error silently, guest local storage already saved
    console.warn("Memory Cards: Firestore session log deferred (offline/guest):", error);
    return false;
  }
}
