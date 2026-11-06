import { sound } from "@/lib/sound";
import { useCallback, useEffect, useRef, useState } from "react";
import { DIFFICULTY_CONFIGS, EGYPTIAN_PRAISES } from "../constants";
import { generateGameBoard } from "../lib/card-generator";
import { calculateGameScore } from "../lib/scoring";
import type {
  DifficultyLevel,
  GameMode,
  GameResult,
  GameStatus,
  MemoryCard,
} from "../types";

interface UseMemoryGameOptions {
  mode: GameMode;
  difficulty: DifficultyLevel;
  selectedCategory: string;
  previewEnabled: boolean;
  soundEnabled: boolean;
  onGameComplete: (result: GameResult) => void;
}

export function useMemoryGame({
  mode,
  difficulty,
  selectedCategory,
  previewEnabled,
  soundEnabled,
  onGameComplete,
}: UseMemoryGameOptions) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const totalPairs = config.pairsCount;

  // Board Cards
  const [cards, setCards] = useState<MemoryCard[]>([]);
  // Game Status
  const [status, setStatus] = useState<GameStatus>("idle");
  // Active flipped cards (max 2)
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  // Moves count (1 move per 2 cards flipped)
  const [moves, setMoves] = useState(0);
  // Matched pairs count
  const [matchedPairs, setMatchedPairs] = useState(0);
  // Consecutive matches streak
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewRemaining, setPreviewRemaining] = useState<number>(
    config.previewSeconds,
  );
  // Latest match explanation (especially for Knowledge mode)
  const [lastMatchExplanation, setLastMatchExplanation] = useState<{
    text: string;
    praise: string;
    sourceName?: string | undefined;
  } | null>(null);

  // Synchronization and lock refs to prevent rapid clicking glitches
  const isLockedRef = useRef(false);
  const timerIntervalRef = useRef<number | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const hasStartedTimerRef = useRef(false);

  // Initialize and build board
  const initializeBoard = useCallback(() => {
    // Clear timeouts
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);

    const initialCards = generateGameBoard(
      mode,
      difficulty,
      totalPairs,
      selectedCategory,
    );

    isLockedRef.current = false;
    hasStartedTimerRef.current = false;
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setStreak(0);
    setMaxStreak(0);
    setElapsedSeconds(0);
    setLastMatchExplanation(null);

    if (previewEnabled) {
      // In preview mode: cards start flipped for previewSeconds
      const previewCards = initialCards.map((c) => ({ ...c, isFlipped: true }));
      setCards(previewCards);
      setStatus("preview");
      setPreviewRemaining(config.previewSeconds);
      isLockedRef.current = true;

      let remaining = config.previewSeconds;
      previewTimerRef.current = window.setInterval(() => {
        remaining -= 1;
        setPreviewRemaining(remaining);
        if (soundEnabled && remaining > 0 && remaining <= 3) {
          sound.playTick();
        }
        if (remaining <= 0) {
          if (previewTimerRef.current) clearInterval(previewTimerRef.current);
          if (soundEnabled) {
            sound.playStartJingle();
          }
          // Turn cards face down
          setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
          setStatus("playing");
          isLockedRef.current = false;
        }
      }, 1000);
    } else {
      if (soundEnabled) {
        sound.playStartJingle();
      }
      setCards(initialCards);
      setStatus("playing");
      isLockedRef.current = false;
    }
  }, [mode, difficulty, totalPairs, selectedCategory, previewEnabled, config.previewSeconds, soundEnabled]);

  // Skip preview manually
  const skipPreview = useCallback(() => {
    if (status !== "preview") return;
    if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    if (soundEnabled) {
      sound.playStartJingle();
    }
    setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
    setStatus("playing");
    isLockedRef.current = false;
  }, [status, soundEnabled]);

  // Start timer helper
  const ensureTimerRunning = useCallback(() => {
    if (!hasStartedTimerRef.current) {
      hasStartedTimerRef.current = true;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    }
  }, []);

  // Pause / Resume
  const pauseGame = useCallback(() => {
    if (status !== "playing") return;
    setStatus("paused");
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [status]);

  const resumeGame = useCallback(() => {
    if (status !== "paused") return;
    setStatus("playing");
    if (hasStartedTimerRef.current) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    }
  }, [status]);

  // Handle Card Click
  const handleCardClick = useCallback(
    (card: MemoryCard) => {
      // Guard: only allow flipping if playing, not locked, card is not already flipped/matched
      if (status !== "playing" || isLockedRef.current) return;
      if (card.isFlipped || card.isMatched) return;

      // Ensure timer starts on first card click
      ensureTimerRunning();

      if (soundEnabled) {
        sound.playCardPress();
      }

      // Flip the clicked card immediately in state
      const nextCards = cards.map((c) =>
        c.id === card.id ? { ...c, isFlipped: true } : c,
      );
      setCards(nextCards);

      const newFlipped = [...flippedCards, card];
      setFlippedCards(newFlipped);

      // If this is the second card flipped in the current move
      if (newFlipped.length === 2) {
        const firstCard = newFlipped[0];
        const secondCard = newFlipped[1];
        if (!firstCard || !secondCard) return;

        isLockedRef.current = true;
        setMoves((prev) => prev + 1);

        const isMatch = firstCard.pairId === secondCard.pairId;

        if (isMatch) {
          // --- MATCH SUCCESS ---
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          setMaxStreak((prev) => Math.max(prev, nextStreak));

          if (soundEnabled) {
            sound.playCorrect();
            if (nextStreak >= 2) sound.playStreakChime();
          }

          // Mark both cards as matched
          const updatedCards = nextCards.map((c) =>
            c.pairId === firstCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c,
          );
          setCards(updatedCards);
          setFlippedCards([]);
          isLockedRef.current = false;

          const nextMatchedPairs = matchedPairs + 1;
          setMatchedPairs(nextMatchedPairs);

          // If knowledge mode, show the authentic explanation
          if (mode === "knowledge") {
            const explanation =
              firstCard.knowledge?.explanation ??
              secondCard.knowledge?.explanation ??
              "إجابة صحيحة وموثقة!";
            const source =
              firstCard.knowledge?.sourceName ?? secondCard.knowledge?.sourceName;
            const randomPraise =
              EGYPTIAN_PRAISES[Math.floor(Math.random() * EGYPTIAN_PRAISES.length)] ??
              "الله ينور عليك!";

            setLastMatchExplanation({
              text: explanation,
              praise: randomPraise,
              sourceName: source ?? undefined,
            });
          }

          // Check for Victory!
          if (nextMatchedPairs === totalPairs) {
            // Stop timer
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setStatus("completed");

            if (soundEnabled) {
              sound.playFanfare();
            }

            const finalMoves = moves + 1;
            const finalTime = elapsedSeconds;
            const scoreBreakdown = calculateGameScore({
              difficulty,
              totalPairs,
              moves: finalMoves,
              elapsedSeconds: finalTime,
              maxStreak: Math.max(maxStreak, nextStreak),
            });

            onGameComplete({
              mode,
              difficulty,
              score: scoreBreakdown.totalScore,
              moves: finalMoves,
              pairs: totalPairs,
              elapsedSeconds: finalTime,
              accuracy: scoreBreakdown.accuracy,
              maxStreak: Math.max(maxStreak, nextStreak),
              isNewBest: false,
              completedAt: new Date().toISOString(),
            });
          }
        } else {
          // --- MISMATCH ---
          setStreak(0);
          if (soundEnabled) {
            sound.playWrong();
          }

          // Show mismatch pulse animation
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isMismatchPulse: true }
                : c,
            ),
          );

          // Delay to let player memorize, then flip back
          mismatchTimeoutRef.current = window.setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstCard.id || c.id === secondCard.id
                  ? { ...c, isFlipped: false, isMismatchPulse: false }
                  : c,
              ),
            );
            setFlippedCards([]);
            isLockedRef.current = false;
          }, 850);
        }
      }
    },
    [
      cards,
      flippedCards,
      status,
      streak,
      maxStreak,
      matchedPairs,
      moves,
      totalPairs,
      mode,
      difficulty,
      elapsedSeconds,
      soundEnabled,
      ensureTimerRunning,
      onGameComplete,
    ],
  );

  // Initialize on mount or when dependencies change
  useEffect(() => {
    initializeBoard();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    };
  }, [initializeBoard]);

  return {
    cards,
    status,
    moves,
    matchedPairs,
    totalPairs,
    streak,
    maxStreak,
    elapsedSeconds,
    previewRemaining,
    lastMatchExplanation,
    clearMatchExplanation: () => setLastMatchExplanation(null),
    handleCardClick,
    pauseGame,
    resumeGame,
    skipPreview,
    restartGame: initializeBoard,
  };
}
