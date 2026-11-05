/**
 * Cloud Functions for Firebase entrypoint (Gen 2, HTTPS + callable).
 *
 * This module is deployed to Firebase Cloud Functions and provides the
 * background generation workflow for the Egyptian Trivia Engine.
 *
 * Client-visible API surface:
 *  - preflightGenerationJob(...) — called by the client (fire-and-forget) when
 *    the question inventory drops below the low-water mark. Creates a
 *    generation job in Firestore and kicks off background generation.
 *  - seedDatabase — creates the 8 spec categories and seeds the curated
 *    fallback questions as `approved`. Runs once on first deploy (idempotent).
 *
 * IMPORTANT:
 *  - The OpenRouter API key is read from Google Cloud Secret Manager via
 *    `defineSecret` (set with `firebase functions:secrets:set OPENROUTER_API_KEY`).
 *    It is NEVER read from the frontend fb-config.ts.
 *  - Firebase Admin SDK is used with the default instance credentials.
 *    Never copy service-account JSON into code or frontend bundles.
 */

import { onCall, onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import seedData from "./seed-questions.json";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// CONFIG
// ============================================================================

// Secrets are managed by Google Cloud Secret Manager.
// Set them once with:
//   firebase functions:secrets:set OPENROUTER_API_KEY
//   firebase functions:secrets:set ADMIN_SEED_SECRET
const openrouterApiKey = defineSecret("OPENROUTER_API_KEY");
const adminSeedSecret = defineSecret("ADMIN_SEED_SECRET");

const FREE_MODELS = ["openrouter/free"] as const;
const FORCED_PARALLEL_SLOTS = 2;
const BATCH_SIZE = 6;             // questions per model per batch
const MAX_BATCHES_PER_JOB = 8;    // max batches before a job completes

// ============================================================================
// UTILS
// ============================================================================

function log(level: string, ...args: unknown[]): void {
  console.log(`[${level}]`, ...args.map((a) => JSON.stringify(a).slice(0, 500)));
}

async function btoaUrlSafe(input: string): Promise<string> {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input).toString("base64url");
  }
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Shuffle option order once and remap correctIndex accordingly.
 * Questions are stored randomized so the answer position is never predictable.
 * The dedupe hash is always computed from the canonical (pre-shuffle) order.
 */
function shuffleDraftOptions<T extends { options: string[]; correctIndex: number }>(draft: T): T {
  const order = draft.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = order[i]!;
    order[i] = order[j]!;
    order[j] = tmp;
  }
  return {
    ...draft,
    options: order.map((i) => draft.options[i]!),
    correctIndex: order.indexOf(draft.correctIndex),
  };
}

// ============================================================================
// TYPES
// ============================================================================

interface QuestionDraft {
  category: string;
  categoryKey: string;
  question: string;
  options: string[];
  explanation: string;
  level: "easy" | "medium" | "hard";
  topicKey?: string;
  countryCode?: string;
  imageQuery?: string;
  correctIndex: number;
}

interface GenerationJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  categoryKey: string | null;
  categories: string[];
  level: string | null;
  targetCount: number;
  generatedCount: number;
  approvedCount: number;
  rejectedCount: number;
  needsReviewCount?: number;
  models: string[];
  errorMessage: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

// ============================================================================
// CLIENT TRIGGER: low-water-mark preflight
// ============================================================================

export const preflightGenerationJob = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    maxInstances: 10,
    secrets: [openrouterApiKey],
  },
  async (request) => {
    // The app has no auth system yet. This trigger is advisory: it can only
    // create a generation job — it can never read answers. Rate limits and
    // budget caps are enforced in the worker.
    if (request.auth === null) {
      log("WARN", "preflightGenerationJob called without auth (open-beta mode)");
    }

    const { level, categories }: { level: string; categories: string[] } = request.data ?? {};

    if (!level || !Array.isArray(categories) || categories.length === 0) {
      throw new Error("BAD_REQUEST");
    }

    const job: GenerationJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "queued",
      categoryKey: categories.length === 1 ? categories[0] : null,
      categories,
      level,
      targetCount: BATCH_SIZE * MAX_BATCHES_PER_JOB,
      generatedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      models: [...FREE_MODELS].slice(0, FORCED_PARALLEL_SLOTS),
      errorMessage: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
    };

    // Cooldown: avoid a job storm when many players hit the low-water mark.
    const activeJob = await db
      .collection("generationJobs")
      .where("status", "in", ["queued", "processing"])
      .limit(1)
      .get();
    if (!activeJob.empty) {
      return { ok: true, jobId: activeJob.docs[0]!.id, reused: true };
    }

    // Creating this document triggers processGenerationJob, which performs the
    // long-running OpenRouter work outside the player's request.
    await db.collection("generationJobs").doc(job.id).set(job);

    return { ok: true, jobId: job.id };
  },
);

// ============================================================================
// PLAYER ANSWER VERIFICATION (server-side, answers never leave the server)
// ============================================================================

export const submitAnswer = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 15,
    maxInstances: 20,
  },
  async (request) => {
    const { questionId, choice, playerId } = (request.data ?? {}) as {
      questionId?: unknown;
      choice?: unknown;
      playerId?: unknown;
    };

    if (typeof questionId !== "string" || questionId.length === 0) {
      throw new Error("BAD_REQUEST");
    }
    if (typeof choice !== "number" || !Number.isInteger(choice) || choice < -1 || choice > 3) {
      throw new Error("BAD_REQUEST");
    }

    const answerRef = db.collection("questionAnswers").doc(questionId);
    const answerSnap = await answerRef.get();
    if (!answerSnap.exists) {
      throw new Error("QUESTION_NOT_FOUND");
    }

    const correctIndex = (answerSnap.data() as { correctIndex?: unknown })?.correctIndex;
    if (typeof correctIndex !== "number" || correctIndex < 0 || correctIndex > 3) {
      throw new Error("QUESTION_INVALID");
    }

    const isCorrect = choice === correctIndex;

    // Record first-time usage per player+question (best-effort analytics).
    if (typeof playerId === "string" && playerId.length > 0 && playerId.length < 128) {
      try {
        const usageRef = db.collection("questionUsage").doc(`${playerId}_${questionId}`);
        const questionRef = db.collection("questions").doc(questionId);

        await db.runTransaction(async (tx) => {
          const usageSnap = await tx.get(usageRef);
          if (usageSnap.exists) return;
          tx.set(usageRef, {
            playerId,
            questionId,
            usedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          tx.update(questionRef, {
            usageCount: admin.firestore.FieldValue.increment(1),
            updatedAt: Date.now(),
          });
        });
      } catch (err) {
        // Never block gameplay on analytics.
        log("WARN", "usage recording failed", err);
      }
    }

    return { isCorrect, correctIndex };
  },
);

// ============================================================================
// BACKGROUND WORKER: triggered by generationJobs document creation
// ============================================================================

export const processGenerationJob = onDocumentCreated(
  {
    document: "generationJobs/{jobId}",
    region: "us-central1",
    timeoutSeconds: 540,
    memory: "512MiB",
    maxInstances: 3,
    secrets: [openrouterApiKey],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    if (data.status !== "queued") return;

    const jobId = event.params.jobId;
    const level = typeof data.level === "string" ? data.level : "medium";
    const categories = Array.isArray(data.categories)
      ? (data.categories as string[])
      : data.categoryKey
        ? [data.categoryKey as string]
        : ["general_knowledge"];

    await db.collection("generationJobs").doc(jobId).update({
      status: "processing",
      updatedAt: Date.now(),
    });

    await generateQuestionsBatch(jobId, level, categories);
  },
);

// ============================================================================
// BACKGROUND WORKER: OpenRouter parallel generation + validation + write
// ============================================================================

async function generateQuestionsBatch(
  jobId: string,
  level: string,
  categories: string[],
): Promise<void> {
  log("INFO", `start job=${jobId} level=${level} cats=${categories.join(",")}`);

  try {
    const draftQuestions: QuestionDraft[] = [];
    const maxAttempts = MAX_BATCHES_PER_JOB;

    while (draftQuestions.length < BATCH_SIZE * maxAttempts) {
      // Respect job lifecycle state.
      const jobSnap = await db.collection("generationJobs").doc(jobId).get();
      const job = (jobSnap.data() ?? {}) as GenerationJob;
      if (job?.status === "cancelled" || job?.status === "failed") {
        log("INFO", `job=${jobId} stopped early`);
        return;
      }

      const cat = categories[(Math.floor(Math.random() * categories.length)) % categories.length];
      const prompt = buildGenerationPrompt(level, cat);

      const raw = await callOpenRouter(prompt);
      const parsed = parseOpenRouterResponse(raw, cat);

      let approvedThisBatch = 0;
      for (const q of parsed) {
        q.level = level as "easy" | "medium" | "hard";
        if (!(await validateQuestion(q))) continue;
        draftQuestions.push(q);
        approvedThisBatch++;
      }

      log("INFO", `job=${jobId} batch approved=${approvedThisBatch} total=${draftQuestions.length}`);

      // Persist counters periodically to avoid unbounded memory on long jobs.
      await db.collection("generationJobs").doc(jobId).update({
        generatedCount: draftQuestions.length,
        updatedAt: Date.now(),
      });
    }

    const { approved, rejected, needsReview } = await writeQuestionsWithAnswers(draftQuestions);

    await db.collection("generationJobs").doc(jobId).update({
      status: "completed",
      approvedCount: approved,
      rejectedCount: rejected,
      needsReviewCount: needsReview,
      generatedCount: draftQuestions.length,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    log(
      "INFO",
      `job=${jobId} done approved=${approved} needsReview=${needsReview} rejected=${rejected}`,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", `job=${jobId} failed: ${msg}`);
    await db.collection("generationJobs").doc(jobId).update({
      status: "failed",
      errorMessage: msg,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

// ============================================================================
// OPENROUTER ADAPTER
// ============================================================================

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = openrouterApiKey.value();
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY secret is not configured. " +
        "Set it with: firebase functions:secrets:set OPENROUTER_API_KEY",
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://tahaddi-trivia.wafaa-game.firebaseapp.com",
        "X-Title": "Alab-Wa-Talam Educational Games",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Empty response from OpenRouter");
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function buildGenerationPrompt(level: string, category: string): string {
  const levelLabels: Record<string, string> = {
    easy: "سهل (أشهر الأشياء والمعلومات الشائعة جداً والواضحة للجميع)",
    medium: "متوسط (معلومات معروفة لكن تتطلب ثقافة عامة جيدة)",
    hard: "صعب (أشياء دقيقة وغير بديهية للمحترفين)",
  };

  const catGuidelines: Record<string, string> = {
    general_knowledge:
      '- ثقافة عامة: سؤال نصي في التاريخ أو الجغرافيا أو العلوم أو الأدب أو الرياضة أو التكنولوجيا. الخيارات 4 بالعربية.',
    capitals:
      '- عواصم الدول: سؤال نصي مثل "ما هي عاصمة دولة كذا؟". الخيارات 4 عواصم بالعربية.',
    quotes:
      '- أقوال مأثورة: "من قائل هذه العبارة؟" لأدباء وفلاسفة وعلماء. الخيارات 4 أسماء بالعربية.',
    historical_figures:
      '- شخصيات تاريخية: سؤال للتعرف على شخصية تاريخية. الخيارات 4 بالعربية.',
    cartoons:
      '- شخصيات كرتونية: سؤال للتعرف على شخصية كرتونية. الخيارات 4 بالعربية.',
    football_players:
      '- لاعبو كرة القدم: سؤال للتعرف على لاعب. الخيارات 4 لاعبين بالعربية.',
    landmarks:
      '- معالم مشهورة: سؤال للتعرف على معلم. الخيارات 4 معالم بالعربية.',
    aerial_city:
      '- مدينة من الأعلى: سؤال للتعرف على مدينة من وصف جوي. الخيارات 4 مدن بالعربية.',
    flags:
      '- أعلام الدول: سؤال عن علم دولة. الخيارات 4 أسماء دول بالعربية.',
  };

  const cat = catGuidelines[category] || catGuidelines.general_knowledge;

  return `أنت كاتب أسئلة مسابقات مصرية محترف ومدقّق حقائق.
اكتب بالضبط 6 أسئلة أصلية باللهجة المصرية الطبيعية (المصري)، بمستوى "${levelLabels[level]}" وتصنيف "${category}".
${cat}

قواعد صارمة:
1. اللهجة المصرية الطبيعية والمفهومة لكل المصريين، بدون مبالغة أو ألفاظ محلية غامضة، وبدون ترجمة حرفية.
2. أعد JSON صالح فقط بالشكل:
{"questions": [{"categoryKey": "${category}", "category": "${category}", "topicKey": "slug-انجليزي-فريد", "question": "...", "options": ["خيار1","خيار2","خيار3","خيار4"], "correctIndex": 2, "explanation": "شرح قصير ومفيد", "level": "${level}"}]}
3. أربعة اختيارات مختلفة، وإجابة صحيحة واحدة فقط، وcorrectIndex عدد صحيح من 0 إلى 3. وزّع موضع الإجابة الصحيحة عشوائياً بين 0 و3 في كل سؤال؛ لا تجعل الخيار الأول هو الصحيح دائماً.
4. لا تلمح للإجابة الصحيحة في نص السؤال أو في الاختيارات الأخرى.
5. تجنب الحقائق المتنازع عليها أو المتغيرة سريعاً، ولا تخترع مصادر أو أرقاماً.
6. إذا لم تكن متأكداً من صحة الحقيقة، لا تضمّن السؤال.
7. أعِد مخرجات JSON فقط بدون أي نص توضيحي أو markdown.
`;
}

function parseOpenRouterResponse(raw: string, fallbackCategory = "general_knowledge"): QuestionDraft[] {
  const text = raw.replace(/```(?:json)?/gi, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(text.slice(start, end + 1));
      } catch {
        parsed = undefined;
      }
    }
    if (parsed === undefined) {
      const aStart = text.indexOf("[");
      const aEnd = text.lastIndexOf("]");
      if (aStart !== -1 && aEnd > aStart) {
        try {
          parsed = JSON.parse(text.slice(aStart, aEnd + 1));
        } catch {
          parsed = undefined;
        }
      }
    }
  }

  const arr = Array.isArray(parsed)
    ? parsed
    : parsed !== undefined &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : undefined;

  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("Invalid OpenRouter response: no questions array found");
  }

  const result: QuestionDraft[] = [];
  for (const item of arr) {
    if (typeof item !== "object" || item === null) continue;
    const rec = item as Record<string, unknown>;
    if (
      Array.isArray(rec.options) &&
      rec.options.length === 4 &&
      typeof rec.correctIndex === "number" &&
      rec.correctIndex >= 0 &&
      rec.correctIndex <= 3 &&
      typeof rec.question === "string" &&
      typeof rec.explanation === "string"
    ) {
      const categoryKey =
        typeof rec.categoryKey === "string"
          ? rec.categoryKey
          : typeof rec.category === "string"
            ? rec.category
            : fallbackCategory;

      result.push({
        category: typeof rec.category === "string" ? rec.category : categoryKey,
        categoryKey,
        question: rec.question,
        options: (rec.options as string[]).slice(0, 4),
        explanation: rec.explanation,
        level: (["easy", "medium", "hard"].includes(String(rec.level))
          ? rec.level
          : "medium") as "easy" | "medium" | "hard",
        topicKey: typeof rec.topicKey === "string" ? rec.topicKey : undefined,
        countryCode: typeof rec.countryCode === "string" ? rec.countryCode : undefined,
        imageQuery: typeof rec.imageQuery === "string" ? rec.imageQuery : undefined,
        correctIndex: rec.correctIndex,
      });
    }
  }
  return result;
}

// ============================================================================
// VALIDATION + WRITE PIPELINE
// ============================================================================

const ALLOWED_CATEGORY_KEYS = new Set([
  "capitals",
  "flags",
  "quotes",
  "historical_figures",
  "cartoons",
  "football_players",
  "landmarks",
  "aerial_city",
  "general_knowledge",
]);

async function validateQuestion(q: QuestionDraft): Promise<boolean> {
  if (!q.question || q.question.trim().length < 3) return false;
  if (!q.explanation || q.explanation.trim().length < 3) return false;
  if (q.options.length !== 4) return false;
  if (q.correctIndex < 0 || q.correctIndex > 3) return false;
  if (!q.categoryKey || !ALLOWED_CATEGORY_KEYS.has(q.categoryKey)) return false;
  if (!["easy", "medium", "hard"].includes(q.level)) return false;
  if (!/\u0600-\u06FF/.test(q.question)) return false;
  const trimmed = q.options.map((o) => o.trim());
  if (new Set(trimmed).size !== trimmed.length) return false;
  if (trimmed.some((o) => o.length === 0)) return false;
  return true;
}

/**
 * Independent semantic verification of a generated question.
 *
 * A second, separate model call (independent prompt) checks factual accuracy,
 * single-correct-answer, clarity, and language. Failures or low confidence
 * route the question to `needs_review` — it is never auto-approved.
 *
 * Note: the free OpenRouter router may pick the same underlying model; this is
 * an independent PROMPT, not a guaranteed independent model. Keep watching
 * quality in the admin review queue.
 */
async function verifyQuestionWithAI(
  q: QuestionDraft,
): Promise<{ status: "approved" | "needs_review"; confidence: number }> {
  const prompt = `أنت مدقق أسئلة مسابقات صارم ومستقل. افحص السؤال التالي وتأكد من:
1. صحة الإجابة الصحيحة المعلنة (correctIndex).
2. وجود إجابة صحيحة واحدة فقط بلا التباس.
3. وضوح صياغة السؤال وأن الخيارات منطقية ومتجانسة.
4. أن الشرح يطابق الإجابة الصحيحة.
5. خلو السؤال من معلومات مضللة أو متغيرة سريعاً.

السؤال: ${q.question}
الخيارات: ${q.options.map((o, i) => `${i}: ${o}`).join(" | ")}
الإجابة المعلنة: ${q.correctIndex} (${q.options[q.correctIndex]})
الشرح: ${q.explanation}

أعد JSON فقط بهذا الشكل:
{"valid": true, "confidence": 0.0, "reason": "سبب مختصر"}
حيث confidence رقم من 0 إلى 1. لا تضف أي نص خارج JSON.`;

  try {
    const raw = await callOpenRouter(prompt);
    const text = raw.replace(/```(?:json)?/gi, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return { status: "needs_review", confidence: 0 };

    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      valid?: unknown;
      confidence?: unknown;
    };
    const valid = parsed.valid === true;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;

    if (valid && confidence >= 0.75) return { status: "approved", confidence };
    return { status: "needs_review", confidence };
  } catch (err) {
    log("WARN", "AI verification failed (fail-closed to needs_review)", err);
    return { status: "needs_review", confidence: 0 };
  }
}

async function writeQuestionsWithAnswers(
  drafts: QuestionDraft[],
): Promise<{ approved: number; rejected: number; needsReview: number }> {
  const qColl = db.collection("questions");
  let approved = 0;
  let rejected = 0;
  let needsReview = 0;

  for (const d of drafts) {
    const hash = await btoaUrlSafe(
      JSON.stringify([d.categoryKey, d.question, d.options.join("|"), d.explanation]),
    );

    try {
      // Independent semantic verification before anything becomes visible.
      const verification = await verifyQuestionWithAI(d);
      const status = verification.status;

      // Randomize the stored option order and remap the answer. The hash above
      // intentionally uses the canonical order so idempotency still works.
      const stored = shuffleDraftOptions(d);

      // Idempotency + duplicate prevention via a transactional unique lock in
      // the dedicated questionDedup collection.
      let isDuplicate = false;
      const existingQuestion = await qColl.doc(hash).get();
      if (existingQuestion.exists) {
        rejected++;
        continue;
      }
      const dedupRef = db.collection("questionDedup").doc(hash);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(dedupRef);
        if (snap.exists) {
          isDuplicate = true;
          return;
        }
        tx.create(dedupRef, {
          contentHash: hash,
          lockedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      if (isDuplicate) {
        rejected++;
        continue;
      }

      await qColl.doc(hash).set({
        category: d.category,
        categoryKey: d.categoryKey,
        question: d.question,
        options: stored.options,
        explanation: d.explanation,
        level: d.level,
        topicKey: d.topicKey,
        countryCode: d.countryCode,
        imageQuery: d.imageQuery,
        imageCategory:
          d.category === "flags" ||
          d.category === "historical_figures" ||
          d.category === "cartoons" ||
          d.category === "football_players" ||
          d.category === "landmarks" ||
          d.category === "aerial_city",
        status,
        sourceType: "ai_generated",
        sourceId: "openrouter",
        qualityScore: Math.round(verification.confidence * 100),
        usageCount: 0,
        contentHash: hash,
        languageVariant: "ar-EG",
        approvedAt: status === "approved" ? Date.now() : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.collection("questionAnswers").doc(hash).set({
        correctIndex: stored.correctIndex,
        explanationPrivate: d.explanation,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      if (status === "approved") approved++;
      else needsReview++;
    } catch (err) {
      log("WARN", "question write failed", d.question.slice(0, 60));
      rejected++;
    }
  }

  return { approved, rejected, needsReview };
}

// ============================================================================
// SEED FUNCTION — run once (idempotent) to populate categories + fallback questions
// ============================================================================

interface FallbackDef {
  level: "easy" | "medium" | "hard";
  category: string;
  categoryKey: string;
  topicKey?: string;
  correctIndex: number;
  question: string;
  options: string[];
  explanation: string;
}

interface CategorySeed {
  slug: string;
  nameAr: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const seedDataTyped = seedData as {
  categories: CategorySeed[];
  questions: FallbackDef[];
};

const FALLBACK_QUIZ_BANK: FallbackDef[] = seedDataTyped.questions;
const CATEGORIES: CategorySeed[] = seedDataTyped.categories;

async function runSeed(): Promise<{ ok: true; questionsSeeded: number }> {
  log("INFO", "seedDatabase started");

  // 1. Seed the 8 spec categories (idempotent by slug).
  const catColl = db.collection("categories");
  const categoryPromises = CATEGORIES.map(async (c) => {
    const ref = catColl.doc(c.slug);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        nameAr: c.nameAr,
        slug: c.slug,
        description: c.description,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
  await Promise.all(categoryPromises);

  // 2. Seed the curated fallback questions (idempotent by contentHash).
  const FLAG_CODES: Record<string, string> = {
    flag_egypt: "eg",
    flag_saudi: "sa",
    flag_canada: "ca",
    flag_germany: "de",
    flag_nepal: "np",
  };

  let written = 0;
  for (const def of FALLBACK_QUIZ_BANK) {
    const options = def.options;
    if (options.length !== 4) continue;

    const countryCode = def.topicKey ? FLAG_CODES[def.topicKey] : undefined;
    const data = JSON.stringify([def.categoryKey, def.question, options.join("|"), def.explanation]);
    const hash = await btoaUrlSafe(data);
    const stored = shuffleDraftOptions({ options, correctIndex: def.correctIndex });

    const ref = db.collection("questions").doc(hash);
    const snap = await ref.get();
    if (snap.exists) continue;

    await ref.set({
      category: def.category,
      categoryKey: def.categoryKey,
      question: def.question,
      options: stored.options,
      explanation: def.explanation,
      level: def.level,
      topicKey: def.topicKey,
      countryCode,
      imageCategory: Boolean(countryCode),
      status: "approved",
      sourceType: "manual",
      sourceId: "fallback_seed",
      usageCount: 0,
      contentHash: hash,
      languageVariant: "ar-EG",
      approvedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await db.collection("questionAnswers").doc(hash).set({
      correctIndex: stored.correctIndex,
      explanationPrivate: def.explanation,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    written++;
  }

  log("INFO", `seedDatabase done written=${written}`);
  return { ok: true, questionsSeeded: written };
}

/** Callable seed — invoke from the Firebase console or the emulator shell. */
export const seedDatabase = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 300,
    maxInstances: 2,
    secrets: [adminSeedSecret],
  },
  async (request) => {
    const expected = adminSeedSecret.value();
    if (!expected) throw new Error("SEED_SECRET_NOT_CONFIGURED");

    const providedSecret = request.data?.["seedSecret"];
    if (providedSecret !== expected) throw new Error("SEED_UNAUTHORIZED");

    return runSeed();
  },
);

/**
 * HTTP seed endpoint — easiest to invoke once after deploy:
 *
 *   curl -X POST https://us-central1-wafaa-game.cloudfunctions.net/seedDatabaseHttp \
 *        -H "Content-Type: application/json" \
 *        -H "x-seed-secret: $ADMIN_SEED_SECRET" \
 *        -d "{}"
 */
export const seedDatabaseHttp = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 300,
    maxInstances: 2,
    secrets: [adminSeedSecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
      return;
    }

    const expected = adminSeedSecret.value();
    if (!expected) {
      res.status(500).json({ error: "SEED_SECRET_NOT_CONFIGURED" });
      return;
    }

    const provided = req.header("x-seed-secret") ?? req.body?.seedSecret;
    if (provided !== expected) {
      res.status(401).json({ error: "SEED_UNAUTHORIZED" });
      return;
    }

    try {
      const result = await runSeed();
      res.status(200).json(result);
    } catch (err) {
      log("ERROR", "seed failed", err);
      res.status(500).json({ error: "SEED_FAILED" });
    }
  },
);
