/**
 * GameScreen — Active gameplay screen for خمن الكلمة.
 * Contains top HUD, HintsBar, BoardGrid, ArabicKeyboard, ResultsModal.
 */

import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Dumbbell,
  HelpCircle,
} from "lucide-react";
import { useWordGuessingGame } from "../hooks/useWordGuessingGame";
import { BoardGrid } from "./BoardGrid";
import { ArabicKeyboard } from "./ArabicKeyboard";
import { HintsBar } from "./HintsBar";
import { ResultsModal } from "./ResultsModal";
import { HowToPlayModal } from "./HowToPlayModal";
import { StatsModal } from "./StatsModal";
import { MAX_ATTEMPTS } from "../constants";
import type { GameMode } from "../types";

interface GameScreenProps {
  mode: GameMode;
  onBackToMenu: () => void;
  onBackToGames: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  onBackToMenu,
  onBackToGames,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const game = useWordGuessingGame(mode);

  const isFinished = game.gameStatus === "won" || game.gameStatus === "lost";

  return (
    <>
      <div className="flex flex-col items-center gap-1 w-full max-w-lg mx-auto select-none" dir="rtl">
        {/* Top HUD */}
        <div className="w-full flex items-center justify-between px-1 py-2">
          {/* Left: back button */}
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-colors cursor-pointer"
            title="رجوع للقائمة"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">القائمة</span>
          </button>

          {/* Center: Mode badge + attempts */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
              {mode === "daily" ? (
                <>
                  <CalendarDays className="w-3 h-3" />
                  يومي
                </>
              ) : (
                <>
                  <Dumbbell className="w-3 h-3" />
                  تدريب
                </>
              )}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {game.currentRowIndex}/{MAX_ATTEMPTS}
            </span>
          </div>

          {/* Right: how-to-play + stats */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="كيف تلعب"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowStats(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="إحصائيات"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {game.toastMessage && (
          <div className="w-full max-w-sm mx-auto px-2 animate-in fade-in slide-in-from-top-2">
            <div className="bg-foreground text-background text-xs font-bold text-center rounded-xl px-4 py-2 shadow-lg">
              {game.toastMessage}
            </div>
          </div>
        )}

        {/* Hints Bar */}
        {!isFinished && (
          <HintsBar
            secretWord={game.secretWord}
            hintUsage={game.hintUsage}
            onRevealCategory={game.handleRevealCategory}
            onRevealClue={game.handleRevealClue}
            onRevealLetter={game.handleRevealLetter}
            disabled={isFinished}
          />
        )}

        {/* Board Grid */}
        <BoardGrid
          rows={game.rows}
          currentRowIndex={game.currentRowIndex}
          winningRowIndex={game.winningRowIndex}
        />

        {/* Keyboard */}
        <ArabicKeyboard
          keyStatuses={game.keyStatuses}
          onKeyPress={game.handleKeyPress}
          onEnter={game.handleSubmitGuess}
          onBackspace={game.handleBackspace}
          disabled={isFinished}
        />
      </div>

      {/* Results Modal */}
      {game.showResultModal && game.resultPayload && (
        <ResultsModal
          result={game.resultPayload}
          stats={game.playerStats}
          onPlayAgain={
            mode === "practice"
              ? () => game.initRound("practice")
              : undefined
          }
          onBackToMenu={onBackToMenu}
          onBackToGames={onBackToGames}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        initialDaily={mode === "daily"}
      />
    </>
  );
};
