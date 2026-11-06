import {
  ArrowRight,
  Flame,
  Pause,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import React from "react";
import type { DifficultyLevel, GameMode } from "../types";

interface GameHeaderProps {
  mode: GameMode;
  difficulty: DifficultyLevel;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  streak: number;
  elapsedSeconds: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  moves,
  matchedPairs,
  totalPairs,
  streak,
  elapsedSeconds,
  soundEnabled,
  onToggleSound,
  onPause,
  onRestart,
  onExit,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <header className="w-full bg-card/80 backdrop-blur-md border-b border-border/60 py-3 px-4 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Back button & Mode title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="رجوع للقائمة"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-1.5">
              <span>ذاكرة الكروت</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {mode === "visual" ? "مطابقة بصرية" : "معرفة وثقافة"}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Stats HUD (Timer, Moves, Pairs, Streak) */}
        <div className="flex items-center gap-3 sm:gap-6 bg-muted/60 dark:bg-slate-900/60 px-3 sm:px-4 py-1.5 rounded-2xl border border-border/50 text-xs sm:text-sm">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-foreground font-mono font-bold" title="الوقت المنقضي">
            <Timer className="w-4 h-4 text-primary" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="w-px h-4 bg-border/60" />

          {/* Moves */}
          <div className="flex items-center gap-1 font-bold text-muted-foreground" title="عدد الحركات">
            <span>الحركات:</span>
            <span className="text-foreground font-black">{moves}</span>
          </div>

          <div className="w-px h-4 bg-border/60" />

          {/* Pairs */}
          <div className="flex items-center gap-1 font-bold text-muted-foreground" title="الأزواج المكتشفة">
            <span>الأزواج:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              {matchedPairs}/{totalPairs}
            </span>
          </div>

          {/* Streak Flame Badge */}
          {streak >= 2 && (
            <div className="hidden sm:flex items-center gap-1 font-black text-amber-500 animate-in zoom-in">
              <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
              <span>{streak}x</span>
            </div>
          )}
        </div>

        {/* Right: Quick actions (Sound, Restart, Pause) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            aria-label="تبديل الصوت"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={onRestart}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="إعادة خلط اللعبة"
            aria-label="إعادة اللعب"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="إيقاف مؤقت"
            aria-label="إيقاف مؤقت"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

