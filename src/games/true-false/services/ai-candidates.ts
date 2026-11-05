/**
 * Background AI candidate generation for True or False.
 *
 * This adapter is intentionally isolated from the existing quiz/word AI
 * pipelines. It reuses only the OpenRouter endpoint and the user's existing
 * key setting. Generated items are NEVER shown in gameplay: they are stored
 * as `needs_review` candidates and must pass human factual verification and
 * approval before they can become playable questions.
 *
 * The generator is not triggered automatically anymore; it must be called
 * explicitly (manual admin action) so opening the game never starts a run.
 */

import { CATEGORY_ORDER, PENDING_CANDIDATES_KEY } from "../constants";
import { isCategoryKey, isDifficulty, isSafeUrl } from "../lib/questions";
import type { TrueFalseCandidate } from "../types";
import { submitCandidatesForReview } from "./firebase";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";
const LAST_ATTEMPT_KEY = "true-false-ai-last-attempt";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getOpenRouterKey(): string {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tahaddi-settings");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const key = parsed["openrouterKey"];
        if (typeof key === "string" && key.trim()) return key.trim();
      }
    } catch {
      // ignore malformed settings
    }
  }
  const envKey = import.meta.env["VITE_OPENROUTER_API_KEY"];
  return typeof envKey === "string" ? envKey.trim() : "";
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonArray(text: string): unknown[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return [];
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toCandidate(raw: unknown, index: number): TrueFalseCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const statement = readString(record, "statement");
  const explanation = readString(record, "explanation");
  const sourceName = readString(record, "sourceName");
  const sourceUrl = readString(record, "sourceUrl");
  const correction = readString(record, "correction");
  const category = record["category"];
  const difficulty = record["difficulty"];
  const answer = record["answer"];

  if (
    statement.length < 10 ||
    statement.length > 260 ||
    explanation.length < 10 ||
    !sourceName ||
    !isSafeUrl(sourceUrl) ||
    !isCategoryKey(category) ||
    !isDifficulty(difficulty) ||
    typeof answer !== "boolean" ||
    (answer === false && correction.length < 5)
  ) {
    return null;
  }

  const candidate: TrueFalseCandidate = {
    id: `ai-${Date.now()}-${index}`,
    statement,
    answer,
    explanation,
    sourceName,
    sourceUrl,
    category,
    difficulty,
    verified: false,
    status: "needs_review",
    aiGenerated: true,
    createdAt: Date.now(),
  };

  if (correction) {
    candidate.correction = correction;
  }

  return candidate;
}

function buildPrompt(count: number): string {
  return [
    "أنت محرر محتوى تعليمي عربي دقيق.",
    `أنشئ ${count} عبارات قصيرة من نوع "صح أم خطأ" لموسوعة تعليمية عربية.`,
    "شروط صارمة:",
    "- العربية الفصحى الواضحة، دون غموض أو أسئلة خادعة.",
    "- حقائق علمية أو تاريخية أو جغرافية مستقرة وغير متنازع عليها.",
    "- لا تخترع أي مصدر. يجب أن يكون sourceUrl رابطًا حقيقيًا لموقع مؤسسة علمية أو جامعية أو حكومية أو متحف أو مرجع أكاديمي.",
    "- إذا كانت العبارة خاطئة، أضف correction تشرح الصيغة الصحيحة بوضوح.",
    `- category يجب أن تكون واحدة من: ${CATEGORY_ORDER.join(", ")}.`,
    "- difficulty واحدة من: easy, medium, hard.",
    "- answer قيمة منطقية true أو false فقط.",
    "أعد JSON array فقط دون أي نص إضافي، وكل عنصر بالحقول:",
    "statement, answer, explanation, correction, sourceName, sourceUrl, category, difficulty.",
  ].join("\n");
}

async function generateCandidates(count: number): Promise<TrueFalseCandidate[]> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Alab-Wa-Talam True or False",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(count) }],
        temperature: 0.5,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) return [];

    return parseJsonArray(content)
      .map((item, index) => toCandidate(item, index))
      .filter((item): item is TrueFalseCandidate => item !== null)
      .slice(0, count);
  } finally {
    clearTimeout(timer);
  }
}

function savePendingLocally(candidates: TrueFalseCandidate[]): void {
  if (typeof window === "undefined" || candidates.length === 0) return;
  try {
    const raw = localStorage.getItem(PENDING_CANDIDATES_KEY);
    const existing: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];
    localStorage.setItem(
      PENDING_CANDIDATES_KEY,
      JSON.stringify([...candidates, ...list].slice(0, 60)),
    );
  } catch {
    // ignore storage limits
  }
}

/**
 * Fire-and-forget background task. Never awaited by gameplay, never blocks a
 * round, and is attempted at most once per day per browser session.
 */
export async function maybeGenerateCandidatesInBackground(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!getOpenRouterKey()) return;

  try {
    const lastAttempt = Number(sessionStorage.getItem(LAST_ATTEMPT_KEY) ?? 0);
    if (Number.isFinite(lastAttempt) && Date.now() - lastAttempt < ONE_DAY_MS) return;
    sessionStorage.setItem(LAST_ATTEMPT_KEY, String(Date.now()));
  } catch {
    return;
  }

  try {
    const candidates = await generateCandidates(6);
    if (candidates.length === 0) return;
    savePendingLocally(candidates);
    await submitCandidatesForReview(candidates);
  } catch {
    // Offline, rate-limited, missing collection rules, or invalid response:
    // the game continues normally with the approved local bank.
  }
}
