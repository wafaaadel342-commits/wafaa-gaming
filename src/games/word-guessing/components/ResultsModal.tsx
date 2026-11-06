import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Flame,
  Home,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { generateShareableEmojiGrid } from "../lib/daily";
import type { GameResultPayload, PlayerStats } from "../types";

interface ResultsModalProps {
  result: GameResultPayload;
  stats: PlayerStats;
  onPlayAgain?: (() => void) | undefined;
  onBackToMenu: () => void;
  onBackToGames: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  result,
  stats,
  onPlayAgain,
  onBackToMenu,
  onBackToGames,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = generateShareableEmojiGrid(
      result.dateKey || "تدريب",
      result.won,
      result.evaluationsGrid,
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-foreground flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          {result.won ? (
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {result.won
              ? result.attemptsCount === 1
                ? "معجزة من أول محاولة! 🎯"
                : result.attemptsCount <= 3
                  ? "ما شاء الله، ذكاء وسرعة بديهة! 👏"
                  : "مبروك، تم تخمين الكلمة بنجاح! 🎉"
              : "حظاً أوفر في الجولة القادمة!"}
          </h2>

          <p className="text-xs text-muted-foreground">
            {result.mode === "daily" ? "التحدي اليومي" : "تدريب حر"} •{" "}
            {result.won
              ? `تم الحل في ${result.attemptsCount} من ٦ محاولات`
              : "استنفدت المحاولات الست"}
          </p>
        </div>

        {/* Word Reveal & Meaning Card */}
        <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 flex flex-col gap-2.5 text-right">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-bold text-muted-foreground">
              الكلمة السرية
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {result.secretWord.category}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-wide">
            {result.secretWord.word}
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
            {result.secretWord.meaning}
          </p>

          {result.secretWord.hint && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>تلميح إضافي: {result.secretWord.hint}</span>
            </div>
          )}
        </div>

        {/* Mini Stats Bar */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
            <span className="text-[11px] text-muted-foreground block">
              الجولات
            </span>
            <span className="text-base font-black text-foreground">
              {stats.played}
            </span>
          </div>
          <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
            <span className="text-[11px] text-muted-foreground block">
              نسبة الفوز
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {stats.played > 0
                ? Math.round((stats.wins / stats.played) * 100)
                : 0}
              ٪
            </span>
          </div>
          <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
            <span className="text-[11px] text-muted-foreground block flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-500" /> السلسلة
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {stats.currentStreak}
            </span>
          </div>
        </div>

        {/* Share Button (Daily or Practice) */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>تم نسخ النتيجة إلى الحافظة!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>مشاركة النتيجة (بدون حرق الكلمة)</span>
            </>
          )}
        </button>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full py-3 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBackToMenu}
              className="py-2.5 rounded-2xl bg-muted/80 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 border border-border/60 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>قائمة اللعبة</span>
            </button>

            <button
              onClick={onBackToGames}
              className="py-2.5 rounded-2xl bg-muted/80 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 border border-border/60 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>كل الألعاب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

