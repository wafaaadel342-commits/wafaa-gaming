/**
 * Main game screen for Word Guessing (خمن الكلمة).
 *
 * Completely isolated. Handles game state, grid rendering, keyboard interaction,
 * win/loss conditions, and statistics.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Share2, RotateCcw, Lightbulb, Trophy, Target } from "lucide-react";

import { WordGuessingKeyboard } from "./WordGuessingKeyboard";
import { normalizeArabicWord } from "../lib/normalization";
import { evaluateGuess } from "../lib/evaluation";
import { dailyKeyFor, selectDailyWordKey } from "../lib/daily";
import type { WordGuessingWord, WordGuessingSetup, WordGuessingAttempt, WordGuessingResult } from "../types";
import type { WordGuessingStats } from "../types";
import type { LetterEvaluation } from "../types";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

interface GameScreenProps {
  wordBank: Map<string, WordGuessingWord>;
  setup: WordGuessingSetup;
  onComplete: (result: WordGuessingResult) => void;
  onBack: () => void;
  initialStats: WordGuessingStats | undefined;
}

export function WordGuessingGameScreen({
  wordBank,
  setup,
  onComplete,
  onBack,
  initialStats,
}: GameScreenProps) {
  const [secretWord, setSecretWord] = useState<WordGuessingWord | null>(null);
  const [attempts, setAttempts] = useState<WordGuessingAttempt[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [letterStatus, setLetterStatus] = useState<Map<string, "green" | "yellow" | "gray">>(new Map());
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [startTime] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const completedRef = useRef(false);

  // Get approved words for daily selection
  const approvedWords = useMemo(() => {
    const words: WordGuessingWord[] = [];
    for (const [id, word] of wordBank.entries()) {
      if (word.status === "approved") words.push(word);
    }
    return words;
  }, [wordBank]);

  // Select secret word
  useEffect(() => {
    const selectSecret = async () => {
      let word: WordGuessingWord | null = null;

      if (setup.mode === "daily") {
        const dateKey = dailyKeyFor(new Date(), setup.timezone);
        const approvedIds = approvedWords.map((w) => w.id);
        const idx = selectDailyWordKey(dateKey, approvedIds);
        word = approvedWords[idx] ?? null;
      } else {
        // Practice mode: random word matching difficulty
        const candidates = approvedWords.filter(
          (w) => setup.difficulty === "mixed" || w.difficulty === setup.difficulty
        );
        if (candidates.length > 0) {
          word = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
        } else {
          word = null;
        }
      }

      if (word && word.normalized.length === WORD_LENGTH) {
        setSecretWord(word);
      } else {
        setErrorMessage("لم يتم العثور على كلمة سرية صالحة.");
      }
    };
    selectSecret();
  }, [setup.mode, setup.difficulty, setup.timezone, approvedWords]);

  // Handle letter input
  const handleLetter = useCallback((letter: string) => {
    if (gameStatus !== "playing" || currentGuess.length >= WORD_LENGTH) return;
    setCurrentGuess((prev) => prev + letter);
    setErrorMessage(null);
  }, [gameStatus, currentGuess.length]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (gameStatus !== "playing" || currentGuess.length === 0) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  }, [gameStatus, currentGuess.length]);

  // Handle enter (submit guess)
  const handleEnter = useCallback(async () => {
    if (gameStatus !== "playing" || currentGuess.length !== WORD_LENGTH) {
      setErrorMessage("يجب إدخال كلمة من 5 حروف.");
      return;
    }

    const normalizedGuess = normalizeArabicWord(currentGuess);

    // Check if guess is in accepted dictionary
    const isInDictionary = Array.from(wordBank.values()).some(
      (w) => normalizeArabicWord(w.normalized) === normalizedGuess
    );

    if (!isInDictionary) {
      setErrorMessage("هذه الكلمة غير مقبولة. جرب كلمة أخرى.");
      return;
    }

    // Check duplicate guess
    if (attempts.some((a) => normalizeArabicWord(a.normalized) === normalizedGuess)) {
      setErrorMessage("لقد جربت هذه الكلمة بالفعل.");
      return;
    }

    if (!secretWord) {
      setErrorMessage("خطأ: الكلمة السرية غير محملة.");
      return;
    }

    // Evaluate guess
    const { evaluations, isCorrect } = evaluateGuess(secretWord.normalized, normalizedGuess);

    const attempt: WordGuessingAttempt = {
      guess: currentGuess,
      normalized: normalizedGuess,
      positions: evaluations,
      isCorrect,
      timestamp: Date.now(),
    };

    setAttempts((prev) => [...prev, attempt]);

    // Update keyboard letter status
    setLetterStatus((prev) => {
      const next = new Map(prev);
      for (const ev of evaluations) {
        const current = next.get(ev.letter);
        if (ev.type === "green") {
          next.set(ev.letter, "green");
        } else if (ev.type === "yellow" && current !== "green") {
          next.set(ev.letter, "yellow");
        } else if (ev.type === "gray" && !current) {
          next.set(ev.letter, "gray");
        }
      }
      return next;
    });

    setCurrentGuess("");

    if (isCorrect) {
      setGameStatus("won");
      if (!completedRef.current) {
        completedRef.current = true;
        await finishGame(true);
      }
    } else if (attempts.length + 1 >= MAX_ATTEMPTS) {
      setGameStatus("lost");
      if (!completedRef.current) {
        completedRef.current = true;
        await finishGame(false);
      }
    }
  }, [gameStatus, currentGuess, attempts, secretWord, wordBank]);

  const finishGame = useCallback(
    async (won: boolean) => {
      if (!secretWord) return;

      const result: WordGuessingResult = {
        score: won ? MAX_ATTEMPTS - attempts.length + 1 : 0,
        correctCount: won ? 1 : 0,
        incorrectCount: won ? 0 : 1,
        total: 1,
        bestStreak: initialStats?.currentStreak ?? 0,
        accuracy: won ? 1 : 0,
        attempts,
        secretWord,
        timeSpentMs: Date.now() - startTime,
      };

      onComplete(result);
    },
    [attempts, secretWord, startTime, onComplete, initialStats?.currentStreak]
  );

  // Hint system
  const useHint = useCallback(() => {
    if (!secretWord || hintUsed) return;
    setHintUsed(true);
    setShowHint(true);
  }, [secretWord, hintUsed]);

  // Current row display
  const currentRow = useMemo(() => {
    if (!secretWord) return Array(WORD_LENGTH).fill({ letter: "", type: "gray" as const });

    if (gameStatus === "playing") {
      const normalized = normalizeArabicWord(currentGuess);
      return normalized.split("").map((letter, i) => ({
        letter,
        type: i < normalized.length ? "gray" as const : "gray" as const,
      }));
    }
    return Array(WORD_LENGTH).fill({ letter: "", type: "gray" as const });
  }, [currentGuess, gameStatus, secretWord]);

  // Render grid cell
  const renderCell = useCallback(
    (letter: string, type: "green" | "yellow" | "gray", rowIndex: number, colIndex: number) => {
      const colors = {
        green: "bg-emerald-600 text-emerald-foreground border-2 border-emerald-600 animate-pop font-bold shadow-lg shadow-emerald-600/25",
        yellow: "bg-amber-600 text-amber-foreground border-2 border-amber-600 animate-shake font-bold shadow-lg shadow-amber-600/25",
        gray: "border-2 border-slate-400/50 bg-slate-800/50 text-slate-300 opacity-60",
      };

      return (
        <motion.div
          key={`${rowIndex}-${colIndex}`}
          className={`flex-1 rounded-md text-center py-3.5 text-xl font-medium transition-all duration-300 ${colors[type]}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: rowIndex * 0.1 + colIndex * 0.03 }}
          style={{ direction: "rtl" }}
        >
          {letter}
        </motion.div>
      );
    },
    []
  );

  if (!secretWord && !errorMessage) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-7 text-center shadow-sm">
          <div className="size-9 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
          <p className="text-sm font-bold text-foreground">جاري تحميل الكلمة السرية…</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !secretWord) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <XCircle className="size-12 text-hard mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">تعذر تحميل اللعبة</h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg bg-card text-foreground border border-border/50 hover:bg-accent transition-colors"
          aria-label="العودة"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-lg font-extrabold text-foreground">خمن الكلمة</h1>
          <p className="text-xs text-muted-foreground">
            {setup.mode === "daily" ? "تحدي يومي" : `تدريب - ${setup.difficulty}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {setup.hintEnabled && !hintUsed && gameStatus === "playing" && (
            <button
              onClick={useHint}
              className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              aria-label="تلميح"
            >
              <Lightbulb className="size-5" />
            </button>
          )}
          <button
            onClick={() => setShowStats(true)}
            className="flex size-10 items-center justify-center rounded-lg bg-card text-foreground border border-border/50 hover:bg-accent transition-colors"
            aria-label="الإحصائيات"
          >
            <Trophy className="size-5" />
          </button>
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Grid */}
        <div className="w-full max-w-md mb-6">
          <div className="grid grid-cols-6 gap-2 mb-2">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                  // Previous attempts
                  if (rowIndex < attempts.length) {
                    const attempt = attempts[rowIndex];
                    if (!attempt) return renderCell("", "gray", rowIndex, colIndex);
                    const pos = attempt.positions[colIndex];
                    return renderCell(
                      pos?.letter ?? "",
                      pos?.type ?? "gray",
                      rowIndex,
                      colIndex
                    );
                  }

                  // Current guess
                  if (rowIndex === attempts.length && gameStatus === "playing") {
                    const normalized = normalizeArabicWord(currentGuess);
                    const letter = normalized[colIndex] ?? "";
                    return renderCell(letter, "gray", rowIndex, colIndex);
                  }

                  // Empty future rows
                  return renderCell("", "gray", rowIndex, colIndex);
                })}
              </div>
            ))}
          </div>

          {/* Error message */}
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-hard mb-4"
            >
              {errorMessage}
            </motion.p>
          )}

          {/* Hint display */}
          {showHint && secretWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="size-5" />
                <span className="font-bold">تلميح:</span>
              </div>
              <p className="text-sm">{secretWord.meaning}</p>
              <button
                onClick={() => setShowHint(false)}
                className="mt-2 text-xs underline"
              >
                إغلاق التلميح
              </button>
            </motion.div>
          )}
        </div>

        {/* Keyboard */}
        <WordGuessingKeyboard
          letterStatus={letterStatus}
          onLetterClick={handleLetter}
          onEnterClick={handleEnter}
          onBackspaceClick={handleBackspace}
          disabled={gameStatus !== "playing"}
        />
      </main>

      {/* Win/Loss overlay */}
      {(gameStatus === "won" || gameStatus === "lost") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-center"
          >
            {gameStatus === "won" ? (
              <>
                <CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-extrabold text-emerald-600">مبارك! خمنت الكلمة</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  عدد المحاولات: {attempts.length} من {MAX_ATTEMPTS}
                </p>
              </>
            ) : (
              <>
                <XCircle className="size-16 text-rose-600 mx-auto mb-4" />
                <h2 className="text-2xl font-extrabold text-rose-600">انتهت المحاولات</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  الكلمة كانت: <span className="font-bold text-foreground">{secretWord?.word}</span>
                </p>
                {secretWord && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    المعنى: {secretWord.meaning}
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                <RotateCcw className="size-4" />
                جولة جديدة
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
              >
                العودة للقائمة
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/30 px-4 py-3 text-sm font-medium"
              >
                <Share2 className="size-4" />
                مشاركة النتيجة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowStats(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-foreground">إحصائياتك</h2>
              <button
                onClick={() => setShowStats(false)}
                className="size-10 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                  <div className="text-2xl font-extrabold text-emerald-600">{initialStats?.totalGames ?? 0}</div>
                  <div className="text-xs text-muted-foreground">الألعاب</div>
                </div>
                <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
                  <div className="text-2xl font-extrabold text-blue-600">{initialStats?.totalWins ?? 0}</div>
                  <div className="text-xs text-muted-foreground">الانتصارات</div>
                </div>
                <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20">
                  <div className="text-2xl font-extrabold text-amber-600">
                    {initialStats?.totalGames && initialStats.totalGames > 0
                      ? Math.round((initialStats.totalWins / initialStats.totalGames) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">معدل الفوز</div>
                </div>
              </div>

              <div className="rounded-xl bg-card/50 p-4 border border-border/50">
                <h3 className="font-bold text-foreground mb-3">التوزيع</h3>
                <div className="space-y-2">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                    const count = initialStats?.guessDistribution[i] ?? 0;
                    const maxCount = Math.max(...(initialStats?.guessDistribution ?? [1]));
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-8 text-right text-sm font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                            className="h-full bg-primary rounded-full transition-all duration-500"
                          />
                        </div>
                        <span className="w-10 text-sm text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-card/50 p-4 border border-border/50">
                <h3 className="font-bold text-foreground mb-3">السلاسل</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20">
                    <div className="text-2xl font-extrabold text-emerald-600">{initialStats?.currentStreak ?? 0}</div>
                    <div className="text-xs text-muted-foreground">السلسلة الحالية</div>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20">
                    <div className="text-2xl font-extrabold text-amber-600">{initialStats?.bestStreak ?? 0}</div>
                    <div className="text-xs text-muted-foreground">أفضل سلسلة</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}