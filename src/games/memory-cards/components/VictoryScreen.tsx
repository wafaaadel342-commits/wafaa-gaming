import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Home,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import React from "react";
import { EGYPTIAN_PRAISES } from "../constants";
import type { BestScoreRecord, GameResult } from "../types";

interface VictoryScreenProps {
  result: GameResult;
  bestRecord: BestScoreRecord | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onBackToGames: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  result,
  bestRecord,
  onPlayAgain,
  onBackToMenu,
  onBackToGames,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} د و ${secs} ث`;
  };

  const praise =
    EGYPTIAN_PRAISES[Math.floor(Math.random() * EGYPTIAN_PRAISES.length)];

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-400">
      {/* Trophy & Badge */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-amber-500 to-yellow-300 text-slate-900 flex items-center justify-center shadow-xl shadow-amber-500/25">
          <Trophy className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Header title */}
      <div className="text-center">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-2">
          {result.mode === "visual"
            ? "اكتملت المطابقة البصرية"
            : "اكتمل التحدي المعرفي المصري"}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          {praise}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          تمت مطابقة جميع الأزواج بنجاح وتركيز استثنائي!
        </p>
      </div>

      {/* New Best Record Banner */}
      {result.isNewBest && (
        <div className="w-full bg-linear-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/40 rounded-2xl p-3 text-center flex items-center justify-center gap-2 text-amber-600 dark:text-amber-300 font-extrabold text-sm shadow-sm animate-bounce">
          <Sparkles className="w-4 h-4 fill-amber-500" />
          <span>رقم قياسي شخصي جديد في هذا المستوى!</span>
        </div>
      )}

      {/* Main Score Card */}
      <div className="w-full bg-card border-2 border-amber-500/30 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        {/* Total Score Display */}
        <div className="text-center pb-4 border-b border-border/60">
          <span className="text-xs font-bold text-muted-foreground">
            النقاط الإجمالية
          </span>
          <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight mt-1 font-mono">
            {result.score.toLocaleString("ar-EG")}
          </div>
          {bestRecord && !result.isNewBest && (
            <span className="text-[11px] text-muted-foreground block mt-1">
              أفضل رقم سابق: {bestRecord.score.toLocaleString("ar-EG")} نقطة
            </span>
          )}
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Moves */}
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold">
              الحركات
            </span>
            <span className="text-lg font-black text-foreground mt-0.5">
              {result.moves} حركة
            </span>
          </div>

          {/* Time */}
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> الوقت
            </span>
            <span className="text-lg font-black text-foreground mt-0.5">
              {formatTime(result.elapsedSeconds)}
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> الدقة
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {result.accuracy}٪
            </span>
          </div>

          {/* Max Streak */}
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> أطول سلسلة
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {result.maxStreak} متتالية
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2.5">
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>العب مرة تانية</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onBackToMenu}
            className="py-3 rounded-2xl bg-muted/80 hover:bg-muted text-foreground font-bold text-xs sm:text-sm transition-colors border border-border/60 flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>تغيير المستوى</span>
          </button>

          <button
            onClick={onBackToGames}
            className="py-3 rounded-2xl bg-muted/80 hover:bg-muted text-foreground font-bold text-xs sm:text-sm transition-colors border border-border/60 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>الرجوع للألعاب</span>
          </button>
        </div>
      </div>
    </div>
  );
};

