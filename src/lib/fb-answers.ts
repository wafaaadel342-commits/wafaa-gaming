/**
 * Client-side answer submission for Firestore-backed questions.
 *
 * The correct answer never reaches the browser: `questions` documents contain
 * no answer data and `questionAnswers` is fully blocked by Security Rules.
 * The `submitAnswer` Cloud Function resolves correctness server-side with the
 * Admin SDK and returns only the result + correct option index after the
 * player has answered.
 *
 * Falls back to `null` when the function cannot be reached, so the UI can
 * degrade gracefully without ever exposing answers.
 */

import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseApp from "./firebase";

export interface AnswerResult {
  isCorrect: boolean;
  correctIndex: number;
}

const PLAYER_ID_KEY = "tahaddi-player-id";

/** Stable anonymous player id (analytics/anti-repeat only — never used for auth). */
export function getPlayerId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) return existing;
    const id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}

/**
 * Submit an answer for server-side verification.
 * @param questionId Firestore question document id.
 * @param choice Selected option index (0–3), or -1 for timeout.
 */
export async function submitFirestoreAnswer(
  questionId: string,
  choice: number,
): Promise<AnswerResult | null> {
  try {
    const functions = getFunctions(firebaseApp, "us-central1");
    const submitAnswer = httpsCallable<
      { questionId: string; choice: number; playerId: string },
      AnswerResult
    >(functions, "submitAnswer");

    const response = await submitAnswer({
      questionId,
      choice,
      playerId: getPlayerId(),
    });

    const data = response.data;
    if (typeof data?.isCorrect !== "boolean" || typeof data?.correctIndex !== "number") {
      return null;
    }
    return data;
  } catch (err) {
    console.warn("[fb-answers] submitAnswer failed:", err);
    return null;
  }
}
