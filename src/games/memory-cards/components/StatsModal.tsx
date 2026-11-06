import { Award, Clock, History, Trophy, X } from "lucide-react";
import React, { useState } from "react";
import { DIFFICULTY_CONFIGS } from "../constants";
import type { BestScoresMap, DifficultyLevel, GameMode, GameResult } from "../types";

interface StatsModalProps {
  bestScores: BestScoresMap;
  history: GameResult[];
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  bestScores,
  history,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"records" | "history">("records");

  const difficulties: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-5 shadow-2xl text-foreground flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-base sm:text-lg">سجل الإنجازات والأرقام</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 my-3 bg-muted/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("records")}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "records"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>الأرقام القياسية</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4 text-primary" />
            <span>الجولات الأخيرة</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === "records" ? (
            <div className="space-y-4">
              {/* Visual Mode Records */}
              <div>
                <h3 className="text-xs font-black text-primary mb-2 flex items-center gap-1">
                  <span>المطابقة البصرية</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map((diff) => {
                    const record = bestScores.visual?.[diff];
                    const cfg = DIFFICULTY_CONFIGS[diff];
                    return (
                      <div
                        key={`rec-vis-${diff}`}
                        className="bg-muted/40 rounded-2xl p-2.5 border border-border/40"
                      >
                        <span className="text-[11px] font-bold text-muted-foreground block">
                          {cfg.title}
                        </span>
                        {record ? (
                          <div className="mt-1">
                            <span className="text-sm font-black text-foreground font-mono">
                              {record.score.toLocaleString("ar-EG")} نقطة
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              {record.moves} حركة • {record.elapsedSeconds} ث
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic mt-1 block">
                            لم تلعب بعد
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Knowledge Mode Records */}
              <div>
                <h3 className="text-xs font-black text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-1">
                  <span>مطابقة المعرفة المصرية</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map((diff) => {
                    const record = bestScores.knowledge?.[diff];
                    const cfg = DIFFICULTY_CONFIGS[diff];
                    return (
                      <div
                        key={`rec-kno-${diff}`}
                        className="bg-muted/40 rounded-2xl p-2.5 border border-border/40"
                      >
                        <span className="text-[11px] font-bold text-muted-foreground block">
                          {cfg.title}
                        </span>
                        {record ? (
                          <div className="mt-1">
                            <span className="text-sm font-black text-foreground font-mono">
                              {record.score.toLocaleString("ar-EG")} نقطة
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              {record.moves} حركة • {record.elapsedSeconds} ث
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic mt-1 block">
                            لم تلعب بعد
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  لا توجد جولات سابقة بعد
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={`hist-${idx}`}
                    className="bg-muted/40 rounded-2xl p-3 border border-border/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>
                          {item.mode === "visual" ? "مطابقة بصرية" : "معرفة"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {DIFFICULTY_CONFIGS[item.difficulty]?.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.elapsedSeconds} ث • {item.moves} حركات
                      </span>
                    </div>
                    <div className="text-left font-mono font-black text-foreground">
                      {item.score.toLocaleString("ar-EG")} ن
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

