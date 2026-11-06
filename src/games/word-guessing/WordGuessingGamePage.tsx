/**
 * WordGuessingGamePage — Root page for خمن الكلمة.
 * Integrates AppHeader, AppFooter, BackgroundBlobs,
 * and a simple home ↔ game view state machine.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { HomeScreen } from "./components/HomeScreen";
import { GameScreen } from "./components/GameScreen";
import type { GameMode } from "./types";

type View =
  | { name: "home" }
  | { name: "game"; mode: GameMode; key: number };

export default function WordGuessingGamePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ name: "home" });
  const [roundKey, setRoundKey] = useState(0);

  const handleStartGame = useCallback(
    (mode: GameMode) => {
      setRoundKey((k) => k + 1);
      setView({ name: "game", mode, key: roundKey + 1 });
    },
    [roundKey],
  );

  const handleBackToMenu = useCallback(() => {
    setView({ name: "home" });
  }, []);

  const handleBackToGames = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const viewKey = view.name === "home" ? "home" : `game-${view.key}`;

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
            className="flex min-h-full flex-col p-4 sm:p-6 max-w-2xl mx-auto w-full"
          >
            {view.name === "home" && (
              <HomeScreen
                onStartGame={handleStartGame}
                onBackToGames={handleBackToGames}
              />
            )}

            {view.name === "game" && (
              <GameScreen
                mode={view.mode}
                onBackToMenu={handleBackToMenu}
                onBackToGames={handleBackToGames}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AppFooter />
    </main>
  );
}
