/**
 * Isolated Firestore service for the True or False game.
 *
 * Uses the existing Firebase app instance read-only. It never touches any
 * collection belonging to another game. If the dedicated collection is not
 * reachable (for example, before it is provisioned), gameplay falls back to
 * the bundled verified bank and never blocks.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FIRESTORE_CANDIDATES_COLLECTION, FIRESTORE_QUESTIONS_COLLECTION } from "../constants";
import { isCategoryKey, isDifficulty, isSafeUrl } from "../lib/questions";
import type { TrueFalseCandidate, TrueFalseQuestion } from "../types";

function readString(data: DocumentData, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeQuestion(id: string, data: DocumentData): TrueFalseQuestion | null {
  const statement = readString(data, "statement");
  const explanation = readString(data, "explanation");
  const sourceName = readString(data, "sourceName");
  const sourceUrl = readString(data, "sourceUrl");
  const category = data["category"];
  const difficulty = data["difficulty"];
  const answer = data["answer"];
  const correction = readString(data, "correction");

  if (
    !statement ||
    !explanation ||
    !sourceName ||
    !isSafeUrl(sourceUrl) ||
    !isCategoryKey(category) ||
    !isDifficulty(difficulty) ||
    typeof answer !== "boolean" ||
    data["verified"] !== true ||
    data["status"] !== "approved"
  ) {
    return null;
  }

  const normalized: TrueFalseQuestion = {
    id,
    statement,
    answer,
    explanation,
    sourceName,
    sourceUrl,
    category,
    difficulty,
    verified: true,
    status: "approved",
    aiGenerated: data["aiGenerated"] === true,
  };

  if (correction) {
    normalized.correction = correction;
  }

  return normalized;
}

/** Reads a small batch of approved questions from the game's own collection. */
export async function readApprovedQuestions(maximum = 300): Promise<TrueFalseQuestion[]> {
  const snapshot = await getDocs(
    query(
      collection(db, FIRESTORE_QUESTIONS_COLLECTION),
      where("status", "==", "approved"),
      limit(maximum),
    ),
  );

  return snapshot.docs
    .map((document) => normalizeQuestion(document.id, document.data()))
    .filter((question): question is TrueFalseQuestion => question !== null);
}

/**
 * Queues AI-generated candidates for human review. Candidates are saved with
 * `verified: false` and `status: "needs_review"` and can never be read by the
 * gameplay path, which only accepts approved + verified questions.
 */
export async function submitCandidatesForReview(
  candidates: TrueFalseCandidate[],
): Promise<void> {
  if (candidates.length === 0) return;

  await Promise.allSettled(
    candidates.map((candidate) => {
      const payload: Record<string, unknown> = {
        statement: candidate.statement,
        answer: candidate.answer,
        explanation: candidate.explanation,
        sourceName: candidate.sourceName,
        sourceUrl: candidate.sourceUrl,
        category: candidate.category,
        difficulty: candidate.difficulty,
        verified: false,
        status: "needs_review",
        aiGenerated: true,
        createdAt: serverTimestamp(),
      };
      if (candidate.correction) {
        payload["correction"] = candidate.correction;
      }
      return addDoc(collection(db, FIRESTORE_CANDIDATES_COLLECTION), payload);
    }),
  );
}
