/**
 * Word Guessing game main page.
 *
 * Completely isolated from other games. Handles home/game/results views,
 * word bank loading, statistics persistence, and Firebase integration.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { WordGuessingGameScreen } from "./components/GameScreen";
import { WordGuessingHomeScreen } from "./components/HomeScreen";
import { WordGuessingResultsScreen } from "./components/ResultsScreen";
import { useWordGuessingGame } from "./hooks/useWordGuessingGame";
import type {
  WordGuessingSetup,
  WordGuessingWord,
  WordGuessingResult,
  WordGuessingStats,
} from "./types";
import { ALL_WORDS } from "./data/word-bank";
import { fetchApprovedWords } from "./services/firebase-service";

type View =
  | { name: "home" }
  | { name: "game"; setup: WordGuessingSetup }
  | { name: "results"; result: WordGuessingResult; best: WordGuessingStats };

export default function WordGuessingGamePage() {
  const navigate = useNavigate();
  const { stats, loaded, updateStats } = useWordGuessingGame(new Map(ALL_WORDS.map((w) => [w.id, w])));
  const [setup, setSetup] = useState<WordGuessingSetup>({
    mode: "daily",
    category: "mixed",
    difficulty: "mixed",
    maxAttempts: 6,
    timezone: "Africa/Cairo",
    hintEnabled: true,
    allowGuessSubstitution: false,
    streakEnabled: true,
  });
  const [view, setView] = useState<View>({ name: "home" });
  const [wordBank, setWordBank] = useState<Map<string, WordGuessingWord>>(
    new Map(ALL_WORDS.map((w) => [w.id, w])),
  );
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const roundCounter = useRef(0);

  useEffect(() => {
    loadFirebaseWords();
  }, []);

  const loadFirebaseWords = useCallback(async () => {
    setFirebaseLoading(true);
    try {
      const words = await fetchApprovedWords();
      if (words.length > 0) {
        setWordBank(new Map(words.map((w) => [w.id, w])));
      }
    } catch (err) {
      console.warn("[WordGuessing] Firebase load failed, using local bank:", err);
    } finally {
      setFirebaseLoading(false);
    }
  }, []);

  const startGame = useCallback((roundSetup: WordGuessingSetup) => {
    setSetup(roundSetup);
    roundCounter.current += 1;
    setView({ name: "game", setup: roundSetup });
  }, []);

  const handleFinish = useCallback((result: WordGuessingResult) => {
    const updated = updateStats(result);
    setView({ name: "results", result, best: updated });
  }, [updateStats]);

  const handleRestart = useCallback(() => {
    startGame(setup);
  }, [startGame, setup]);

  const handleBackToGames = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const viewKey =
    view.name === "home"
      ? "home"
      : view.name === "game"
        ? `game-${roundCounter.current}`
        : `results-${view.result.attempts.length}-${view.result.score}`;

  return (
    <main className="relative flex min-h-dvh flex-col">
      <BackgroundBlobs theme="default" />
      <AppHeader showHomeButton gameTitle="خمن الكلمة" />

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex min-h-full flex-col p-4 sm:p-6 max-w-2xl mx-auto"
          >
            {view.name === "home" && (
              <WordGuessingHomeScreen
                wordBank={wordBank}
                onStart={startGame}
                onBack={handleBackToGames}
                initialStats={stats ?? undefined}
              />
            )}

            {view.name === "game" && (
              <WordGuessingGameScreen
                key={roundCounter.current}
                wordBank={wordBank}
                setup={setup}
                onComplete={handleFinish}
                onBack={handleBackToGames}
                initialStats={stats ?? undefined}
              />
            )}

            {view.name === "results" && (
              <WordGuessingResultsScreen
                result={view.result}
                attempts={view.result.attempts}
                onRestart={handleRestart}
                onExit={handleBackToGames}
                onClose={handleBackToGames}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AppFooter />
    </main>
  );
}