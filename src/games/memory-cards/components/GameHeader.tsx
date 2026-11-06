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
    <header className="w-full bg-card/90 backdrop-blur-md border-b border-border/60 py-2 sm:py-3 px-2 sm:px-4 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Back button & Mode title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={onExit}
            className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
            title="رجوع للقائمة"
            aria-label="رجوع"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold text-foreground flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="hidden xs:inline truncate">ذاكرة الكروت</span>
              <span className="text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {mode === "visual" ? "بصرية" : "معرفة"}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Stats HUD (Timer, Moves, Pairs, Streak) */}
        <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-5 bg-muted/70 dark:bg-slate-900/70 px-2 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-border/50 text-[11px] sm:text-sm shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-1 text-foreground font-mono font-bold" title="الوقت المنقضي">
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="w-px h-3.5 sm:h-4 bg-border/60" />

          {/* Moves */}
          <div className="flex items-center gap-1 font-bold text-muted-foreground" title="عدد الحركات">
            <span className="hidden xs:inline">الحركات:</span>
            <span className="xs:hidden">ح:</span>
            <span className="text-foreground font-black">{moves}</span>
          </div>

          <div className="w-px h-3.5 sm:h-4 bg-border/60" />

          {/* Pairs */}
          <div className="flex items-center gap-1 font-bold text-muted-foreground" title="الأزواج المكتشفة">
            <span className="hidden xs:inline">الأزواج:</span>
            <span className="xs:hidden">زوج:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              {matchedPairs}/{totalPairs}
            </span>
          </div>

          {/* Streak Flame Badge */}
          {streak >= 2 && (
            <div className="flex items-center gap-0.5 sm:gap-1 font-black text-amber-500 animate-in zoom-in">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500 animate-bounce" />
              <span className="text-[10px] sm:text-xs">{streak}x</span>
            </div>
          )}
        </div>

        {/* Right: Quick actions (Sound, Restart, Pause) */}
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          <button
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
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
            className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="إعادة خلط اللعبة"
            aria-label="إعادة اللعب"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onPause}
            className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
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

