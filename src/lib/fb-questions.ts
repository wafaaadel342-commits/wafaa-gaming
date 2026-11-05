/**
 * Firestore-backed question provider — database-first question delivery.
 *
 * Provides the same `Question` contract used by the existing localStorage bank
 * system, but reads from Firebase Cloud Firestore.
 *
 * Guarantees:
 *  - Only `status === "approved"` questions are returned to the client.
 *  - `correctIndex` is NEVER part of the client-visible `questions` documents.
 *    Answers live in `questionAnswers`, which Security Rules block entirely;
 *    they are resolved server-side through Cloud Functions / Admin SDK.
 *  - Small batches + cursor pagination (`startAfter`), never the full bank.
 *  - No gameplay path waits for Firestore: callers keep the local bank and
 *    OpenRouter path as fallback.
 */

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  ALL_CATEGORY_KEYS,
  getQuestionDedupeKey,
  type CategoryKey,
  type Level,
  type Question,
} from "./quiz";

/** Shape of the client-visible `questions/{id}` document. */
export interface FirestoreQuestionDoc {
  category: string;
  categoryKey: string;
  question: string;
  options: string[];
  explanation: string;
  level: Level;
  topicKey?: string;
  countryCode?: string;
  imageQuery?: string;
  imageCategory: boolean;
  status: "pending" | "approved" | "rejected" | "needs_review" | "disabled";
  sourceType: "ai_generated" | "dataset" | "manual";
  sourceId?: string;
  sourceQuestionId?: string;
  qualityScore?: number;
  usageCount: number;
  contentHash: string;
  languageVariant: string;
  createdAt: unknown;
  updatedAt: unknown;
  approvedAt: unknown;
  /** Proverb-specific fields (present when category is proverb-related). */
  proverbOrigin?: string;
  proverbDialect?: string;
  proverbLevel?: string;
  proverbTags?: string;
  proverbSourceName?: string;
  proverbSourceUrl?: string;
  proverbVerification?: string;
}

const IMAGE_CATEGORIES = new Set<string>([
  "flags",
  "historical_figures",
  "cartoons",
  "football_players",
  "landmarks",
  "aerial_city",
]);

/** Columns the client is allowed to read (explicit whitelist — defence in depth). */
function docToQuestion(doc: QueryDocumentSnapshot<DocumentData>): Question {
  const d = doc.data() as Partial<FirestoreQuestionDoc>;

  const categoryKey = (d.categoryKey || d.category || "general_knowledge") as string;
  const safeCategory: CategoryKey = ALL_CATEGORY_KEYS.includes(categoryKey as CategoryKey)
    ? (categoryKey as CategoryKey)
    : "general_knowledge";

  return {
    id: doc.id,
    category: safeCategory,
    question: typeof d.question === "string" ? d.question : "",
    options: Array.isArray(d.options)
      ? d.options.filter((o) => typeof o === "string").slice(0, 4)
      : [],
    explanation: typeof d.explanation === "string" ? d.explanation : "",
    // -1 means "not revealed yet": the real answer is resolved server-side by
    // the submitAnswer Cloud Function after the player answers.
    correctIndex: -1,
    // The Firestore doc carries `level`; Question in quiz.ts has no level field,
    // so it is attached dynamically and read by the caller when needed.
    level: (d.level as Level) || "medium",
    topicKey: d.topicKey,
    countryCode: d.countryCode,
    imageQuery: d.imageQuery,
  } as Question & { level: Level };
}

/** Structured result of a batched Firestore read. */
export interface FirestoreBatch {
  questions: Question[];
  /** Cursor to pass to the next call via `lastDoc`. */
  nextDoc: QueryDocumentSnapshot<DocumentData> | null;
}

/**
 * Read a small approved batch with cursor pagination.
 *
 * @param count  Max questions to return (keep small: 4–12).
 * @param constraints  Query constraints (must include status == approved).
 * @param lastDoc  Cursor from the previous batch, if any.
 */
export async function readApprovedBatch(
  count: number,
  constraints: QueryConstraint[],
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  const baseQuery = query(collection(db, "questions"), ...constraints, limit(count));
  const finalQuery = lastDoc ? query(baseQuery, startAfter(lastDoc)) : baseQuery;
  const snapshot = await getDocs(finalQuery);

  if (snapshot.empty) return { questions: [], nextDoc: null };

  const questions = snapshot.docs.map(docToQuestion).filter((q) => q.options.length === 4);
  return {
    questions: dedupeFirestoreQuestions(questions),
    nextDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

/** Text-only approved questions (no image resolution required). */
export function readTextQuestionsBatch(
  count: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  return readApprovedBatch(
    count,
    [where("status", "==", "approved"), orderBy("approvedAt", "asc")],
    lastDoc,
  );
}

/** Image-category approved questions. */
export function readImageQuestionsBatch(
  count: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  return readApprovedBatch(
    count,
    [
      where("status", "==", "approved"),
      where("imageCategory", "==", true),
      orderBy("approvedAt", "asc"),
    ],
    lastDoc,
  );
}

/** Approved questions for one category. */
export function readCategoryBatch(
  categoryKey: CategoryKey,
  count: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  return readApprovedBatch(
    count,
    [
      where("status", "==", "approved"),
      where("categoryKey", "==", categoryKey),
      orderBy("approvedAt", "asc"),
    ],
    lastDoc,
  );
}

/** Approved questions for one level. */
export function readLevelBatch(
  level: Level,
  count: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  return readApprovedBatch(
    count,
    [where("status", "==", "approved"), where("level", "==", level), orderBy("approvedAt", "asc")],
    lastDoc,
  );
}

/**
 * Approved questions for a round: level + selected categories.
 * Firestore `in` queries support at most 30 values — far more than the
 * 9 categories in this app.
 */
export function readRoundBatch(
  level: Level,
  categories: CategoryKey[],
  count: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<FirestoreBatch> {
  if (categories.length === 0) return readLevelBatch(level, count, lastDoc);

  return readApprovedBatch(
    count,
    [
      where("status", "==", "approved"),
      where("level", "==", level),
      where("categoryKey", "in", categories),
      orderBy("approvedAt", "asc"),
    ],
    lastDoc,
  );
}

/** De-duplicate by the same key convention as src/lib/quiz.ts. */
export function dedupeFirestoreQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const q of questions) {
    const key = getQuestionDedupeKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/** Deterministic content hash used as the Firestore document id. */
export function contentHashFor(q: {
  category: string;
  question: string;
  options: string[];
  explanation: string;
}): string {
  const payload = JSON.stringify([q.category, q.question, q.options.join("|"), q.explanation]);
  try {
    if (typeof Buffer !== "undefined") return Buffer.from(payload).toString("base64url");
    return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return payload;
  }
}

export function isImageCategory(category: string): boolean {
  return IMAGE_CATEGORIES.has(category);
}
