/**
 * HomeScreen — Premium Arabic-first landing for خمن الكلمة.
 * Daily Challenge card, Practice card, How-to-play & Stats buttons.
 */

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { loadDailyState, loadPlayerStats } from "../lib/storage";
import { getCairoDateKey } from "../lib/daily";
import type { GameMode } from "../types";
import { HowToPlayModal } from "./HowToPlayModal";
import { StatsModal } from "./StatsModal";

interface HomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  onBackToGames: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onBackToGames,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const dailyState = loadDailyState();
  const isDailyDone = dailyState?.completed === true;
  const dailyStats = loadPlayerStats(true);
  const practiceStats = loadPlayerStats(false);

  return (
    <>
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-4 select-none" dir="rtl">
        {/* Game Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>العب وتعلم</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            خمّن الكلمة
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            خمّن الكلمة السرية في ٦ محاولات. كل تخمين يكشف حروفاً صحيحة.
          </p>
        </div>

        {/* Daily Challenge Card */}
        <button
          type="button"
          onClick={() => {
            sound.unlock();
            sound.playStartJingle();
            onStartGame("daily");
          }}
          className="w-full bg-card border border-border rounded-3xl p-5 text-right shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-primary/70 text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base">
                  التحدي اليومي
                </h3>
                {isDailyDone && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    مكتمل
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDailyDone
                  ? "أكملت تحدي اليوم! يمكنك مراجعة النتيجة."
                  : `كلمة جديدة كل يوم — ${getCairoDateKey()}`}
              </p>
              {dailyStats.played > 0 && (
                <p className="text-[10px] text-muted-foreground/70">
                  سلسلة: {dailyStats.currentStreak} • أفضل: {dailyStats.maxStreak} • فوز:{" "}
                  {dailyStats.played > 0
                    ? Math.round((dailyStats.wins / dailyStats.played) * 100)
                    : 0}
                  %
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Practice Mode Card */}
        <button
          type="button"
          onClick={() => {
            sound.unlock();
            sound.playStartJingle();
            onStartGame("practice");
          }}
          className="w-full bg-card border border-border rounded-3xl p-5 text-right shadow-sm hover:shadow-md hover:border-amber-400/30 transition-all group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-bold text-foreground text-base">
                تدريب حر
              </h3>
              <p className="text-xs text-muted-foreground">
                تدرّب على كلمات عشوائية بدون حد. شغّل الدماغ!
              </p>
              {practiceStats.played > 0 && (
                <p className="text-[10px] text-muted-foreground/70">
                  لعبت: {practiceStats.played} • فزت: {practiceStats.wins}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.playClick();
              setShowHowToPlay(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>كيف تلعب؟</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.playClick();
              setShowStats(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>إحصائياتي</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </>
  );
};
