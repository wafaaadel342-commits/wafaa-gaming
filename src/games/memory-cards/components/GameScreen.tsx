import React from "react";
import { DIFFICULTY_CONFIGS } from "../constants";
import { useMemoryGame } from "../hooks/useMemoryGame";
import type { BestScoreRecord, GameResult, GameSettings } from "../types";
import { Card } from "./Card";
import { ExplanationModal } from "./ExplanationModal";
import { GameHeader } from "./GameHeader";
import { PauseModal } from "./PauseModal";
import { PreviewBanner } from "./PreviewBanner";
import { VictoryScreen } from "./VictoryScreen";

interface GameScreenProps {
  settings: GameSettings;
  bestRecord: BestScoreRecord | null;
  onGameComplete: (result: GameResult) => void;
  onExitToMenu: () => void;
  onBackToGames: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  settings,
  bestRecord,
  onGameComplete,
  onExitToMenu,
  onBackToGames,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(
    settings.soundEnabled,
  );
  const [completedResult, setCompletedResult] =
    React.useState<GameResult | null>(null);

  const handleFinish = (result: GameResult) => {
    setCompletedResult(result);
    onGameComplete(result);
  };

  const {
    cards,
    status,
    moves,
    matchedPairs,
    totalPairs,
    streak,
    elapsedSeconds,
    previewRemaining,
    lastMatchExplanation,
    clearMatchExplanation,
    handleCardClick,
    pauseGame,
    resumeGame,
    skipPreview,
    restartGame,
  } = useMemoryGame({
    mode: settings.mode,
    difficulty: settings.difficulty,
    selectedCategory: settings.selectedCategory,
    previewEnabled: settings.previewEnabled,
    soundEnabled,
    onGameComplete: handleFinish,
  });

  const config = DIFFICULTY_CONFIGS[settings.difficulty];

  // If completed, show Victory Screen
  if (status === "completed" && completedResult) {
    return (
      <VictoryScreen
        result={completedResult}
        bestRecord={bestRecord}
        onPlayAgain={() => {
          setCompletedResult(null);
          restartGame();
        }}
        onBackToMenu={onExitToMenu}
        onBackToGames={onBackToGames}
      />
    );
  }

  return (
    <div className="w-full flex flex-col flex-1 pb-4 sm:pb-8">
      {/* Top Game HUD Header */}
      <GameHeader
        mode={settings.mode}
        difficulty={settings.difficulty}
        moves={moves}
        matchedPairs={matchedPairs}
        totalPairs={totalPairs}
        streak={streak}
        elapsedSeconds={elapsedSeconds}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onPause={pauseGame}
        onRestart={restartGame}
        onExit={onExitToMenu}
      />

      <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 pt-2 sm:pt-4 flex flex-col flex-1 justify-center">
        {/* Preview Countdown Banner */}
        {status === "preview" && (
          <PreviewBanner
            remainingSeconds={previewRemaining}
            totalSeconds={config.previewSeconds}
            onSkip={skipPreview}
          />
        )}

        {/* Card Grid */}
        <div
          className={`grid gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4 my-auto py-1 sm:py-2 ${config.gridColsClass}`}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={handleCardClick}
              disabled={status === "preview" || status === "paused"}
            />
          ))}
        </div>
      </div>

      {/* Explanation Banner / Modal for Knowledge Mode */}
      {lastMatchExplanation && (
        <ExplanationModal
          explanation={lastMatchExplanation}
          onDismiss={clearMatchExplanation}
        />
      )}

      {/* Pause Modal Overlay */}
      {status === "paused" && (
        <PauseModal
          onResume={resumeGame}
          onRestart={restartGame}
          onExit={onExitToMenu}
        />
      )}
    </div>
  );
};

