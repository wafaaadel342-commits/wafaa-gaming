import { AppFooter } from "@/components/common/AppFooter";
import { AppHeader } from "@/components/common/AppHeader";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useEffect, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { IntroScreen } from "./components/IntroScreen";
import { StatsModal } from "./components/StatsModal";
import {
  appendStatsHistory,
  loadBestScores,
  loadStatsHistory,
  loadStoredSettings,
  saveBestScore,
  saveStoredSettings,
} from "./lib/storage";
import { logMemoryGameResult } from "./services/firebase";
import type { BestScoresMap, GameResult, GameSettings } from "./types";

export default function MemoryCardsGamePage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<GameSettings>(loadStoredSettings);
  const [bestScores, setBestScores] = useState<BestScoresMap>(loadBestScores);
  const [history, setHistory] = useState<GameResult[]>(loadStatsHistory);
  const [screen, setScreen] = useState<"intro" | "game">("intro");
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Load storage on client mount
  useEffect(() => {
    setSettings(loadStoredSettings());
    setBestScores(loadBestScores());
    setHistory(loadStatsHistory());
  }, []);

  const handleUpdateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      saveStoredSettings(updated);
      return updated;
    });
  }, []);

  const handleGameComplete = useCallback((result: GameResult) => {
    // 1. Update best scores in storage
    const { isNewBest, updatedScores } = saveBestScore(result);
    setBestScores(updatedScores);

    // 2. Append to local history
    appendStatsHistory({ ...result, isNewBest });
    setHistory((prev) => [{ ...result, isNewBest }, ...prev.slice(0, 29)]);

    // 3. Log to Firebase (isolated dedicated collection)
    logMemoryGameResult({ ...result, isNewBest }).catch(() => {
      // Offline fallback silently handled
    });
  }, []);

  const handleBackToGames = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const currentBestRecord =
    bestScores[settings.mode]?.[settings.difficulty] || null;

  return (
    <main className="relative flex min-h-dvh flex-col bg-background text-foreground rtl select-none">
      <BackgroundBlobs theme="default" />

      {/* Global App Header */}
      <AppHeader
        showHomeButton
        gameTitle="ذاكرة الكروت"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {screen === "intro" ? (
          <IntroScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={() => setScreen("game")}
            onOpenStats={() => setIsStatsOpen(true)}
            onBackToGames={handleBackToGames}
          />
        ) : (
          <GameScreen
            settings={settings}
            bestRecord={currentBestRecord}
            onGameComplete={handleGameComplete}
            onExitToMenu={() => setScreen("intro")}
            onBackToGames={handleBackToGames}
          />
        )}
      </div>

      {/* Stats Modal */}
      {isStatsOpen && (
        <StatsModal
          bestScores={bestScores}
          history={history}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {/* Footer */}
      <AppFooter />
    </main>
  );
}

