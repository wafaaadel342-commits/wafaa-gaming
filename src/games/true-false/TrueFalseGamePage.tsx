import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { DEFAULT_SETUP } from "./constants";
import { useQuestionBank } from "./hooks/useQuestionBank";
import { buildRound } from "./lib/questions";
import {
  loadBestScores,
  loadPreferences,
  saveBestScore,
  savePreferences,
  type BestScores,
} from "./lib/storage";
import type { TrueFalseQuestion, TrueFalseResult, TrueFalseSetup } from "./types";
import { styles } from "./styles";

const EMPTY_BEST: BestScores = { easy: 0, medium: 0, hard: 0, mixed: 0 };

type View =
  | { name: "home" }
  | {
      name: "game";
      questions: TrueFalseQuestion[];
      setup: TrueFalseSetup;
      roundId: number;
    }
  | { name: "results"; result: TrueFalseResult; best: BestScores };

export default function TrueFalseGamePage() {
  const navigate = useNavigate();
  const { bank } = useQuestionBank();
  const [setup, setSetup] = useState<TrueFalseSetup>(DEFAULT_SETUP);
  const [best, setBest] = useState<BestScores>(EMPTY_BEST);
  const [view, setView] = useState<View>({ name: "home" });
  const roundCounter = useRef(0);

  useEffect(() => {
    setSetup(loadPreferences());
    setBest(loadBestScores());
  }, []);

  const updateSetup = useCallback((patch: Partial<TrueFalseSetup>) => {
    setSetup((current) => ({ ...current, ...patch }));
  }, []);

  const startRound = useCallback(
    (roundSetup: TrueFalseSetup) => {
      const questions = buildRound(bank, roundSetup);
      if (questions.length === 0) return;

      savePreferences(roundSetup);
      setSetup(roundSetup);
      roundCounter.current += 1;
      setView({
        name: "game",
        questions,
        setup: roundSetup,
        roundId: roundCounter.current,
      });
    },
    [bank],
  );

  const handleStart = useCallback(() => {
    startRound(setup);
  }, [setup, startRound]);

  const handleFinish = useCallback((result: TrueFalseResult) => {
    const nextBest = saveBestScore(result.setup.difficulty, result.score);
    setBest(nextBest);
    setView({ name: "results", result, best: nextBest });
  }, []);

  const handleReplay = useCallback(() => {
    if (view.name !== "results") return;
    startRound(view.result.setup);
  }, [startRound, view]);

  const handleBackToGames = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const viewKey =
    view.name === "home"
      ? "home"
      : view.name === "game"
        ? `game-${view.roundId}`
        : `results-${view.result.score}-${view.result.accuracy}`;

  return (
    <main className="relative flex min-h-dvh flex-col">
      <BackgroundBlobs theme="default" />
      <AppHeader showHomeButton gameTitle="صح أم خطأ" />

      <div className={`flex-1 ${styles.scope}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex min-h-full flex-col"
          >
            {view.name === "home" && (
              <HomeScreen
                setup={setup}
                best={best}
                bankCount={bank.length}
                onChange={updateSetup}
                onStart={handleStart}
              />
            )}

            {view.name === "game" && (
              <GameScreen
                key={view.roundId}
                questions={view.questions}
                setup={view.setup}
                onFinish={handleFinish}
              />
            )}

            {view.name === "results" && (
              <ResultsScreen
                result={view.result}
                best={view.best}
                onReplay={handleReplay}
                onBack={handleBackToGames}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AppFooter />
    </main>
  );
}
