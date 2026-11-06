import React, { useState } from "react";
import { X, Flame, Trophy, Percent, Hash, BarChart3 } from "lucide-react";
import type { PlayerStats } from "../types";
import { loadPlayerStats } from "../lib/storage";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDaily?: boolean | undefined;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  initialDaily = true,
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "practice">(
    initialDaily ? "daily" : "practice",
  );

  if (!isOpen) return null;

  const stats: PlayerStats = loadPlayerStats(activeTab === "daily");
  const winRate =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  // Max value in guess distribution for scaling
  const maxFreq = Math.max(
    1,
    ...Object.values(stats.guessDistribution || { 1: 0 }),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-foreground flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">إحصائيات اللعب</h2>
              <p className="text-xs text-muted-foreground">
                سجل إنجازاتك وسلسلة الانتصارات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "daily"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            التحدي اليومي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("practice")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "practice"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            التدريب الحر
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center">
            <Hash className="w-4 h-4 text-primary mb-1" />
            <span className="text-lg sm:text-xl font-black">{stats.played}</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              لعبت
            </span>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center">
            <Percent className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-lg sm:text-xl font-black">{winRate}%</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              نسبة الفوز
            </span>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center">
            <Flame className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-lg sm:text-xl font-black">
              {stats.currentStreak}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              السلسلة
            </span>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center">
            <Trophy className="w-4 h-4 text-yellow-500 mb-1" />
            <span className="text-lg sm:text-xl font-black">
              {stats.maxStreak}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              أفضل رقم
            </span>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            توزيع عدد المحاولات للحل
          </h3>
          <div className="space-y-1.5" dir="rtl">
            {[1, 2, 3, 4, 5, 6].map((attemptNum) => {
              const count = stats.guessDistribution[attemptNum] || 0;
              const pct = stats.played > 0 ? (count / maxFreq) * 100 : 0;
              return (
                <div key={attemptNum} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-bold text-center text-muted-foreground">
                    {attemptNum}
                  </span>
                  <div className="flex-1 bg-muted/40 h-6 rounded-md overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 flex items-center justify-end px-2 ${
                        count > 0
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-transparent text-muted-foreground"
                      }`}
                      style={{
                        width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                      }}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          حسناً
        </button>
      </div>
    </div>
  );
};

