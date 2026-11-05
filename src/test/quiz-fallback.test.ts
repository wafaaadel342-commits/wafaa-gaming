import { describe, it, expect, beforeEach } from "vitest";
import { fetchInitialBatch, fetchRemainingBatch } from "../lib/providers";
import { clearAllBanks, loadQuizBank } from "../lib/anti-repeat";
import { seedAllFallbackToBank, FALLBACK_QUIZ_BANK } from "../lib/quiz-fallback";
import { DEFAULT_SETTINGS, ALL_CATEGORY_KEYS } from "../lib/quiz";

describe("Quiz Fallback and Question Loading", () => {
  beforeEach(() => {
    clearAllBanks();
    localStorage.clear();
  });

  it("has a rich fallback quiz bank with questions across all levels", () => {
    expect(FALLBACK_QUIZ_BANK.length).toBeGreaterThanOrEqual(40);

    const easy = FALLBACK_QUIZ_BANK.filter((q) => q.level === "easy");
    const medium = FALLBACK_QUIZ_BANK.filter((q) => q.level === "medium");
    const hard = FALLBACK_QUIZ_BANK.filter((q) => q.level === "hard");

    expect(easy.length).toBeGreaterThanOrEqual(10);
    expect(medium.length).toBeGreaterThanOrEqual(10);
    expect(hard.length).toBeGreaterThanOrEqual(10);
  });

  it("loads questions in fetchInitialBatch even when there is no API key and bank is empty", async () => {
    const settings = { ...DEFAULT_SETTINGS, openrouterKey: "" };
    const questions = await fetchInitialBatch("easy", settings, ALL_CATEGORY_KEYS);

    expect(questions.length).toBeGreaterThanOrEqual(2);
    for (const q of questions) {
      expect(q.question).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(typeof q.correctIndex).toBe("number");
    }
  }, 15000);

  it("loads remaining questions in fetchRemainingBatch without failing", async () => {
    const settings = { ...DEFAULT_SETTINGS, openrouterKey: "" };
    const initial = await fetchInitialBatch("medium", settings, ALL_CATEGORY_KEYS);
    const needed = 5;

    const remaining = await fetchRemainingBatch(
      "medium",
      settings,
      needed,
      ALL_CATEGORY_KEYS,
      initial,
    );

    expect(remaining.length).toBe(needed);
  }, 15000);

  it("seedAllFallbackToBank adds all fallback items to persistent bank", () => {
    expect(loadQuizBank().length).toBe(0);
    const added = seedAllFallbackToBank();
    expect(added).toBeGreaterThan(0);
    expect(loadQuizBank().length).toBe(added);
  });
});
