import {
  ArrowRight,
  BookOpen,
  Eye,
  Layers,
  Play,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import React from "react";
import {
  CATEGORIES_LIST,
  DIFFICULTY_CONFIGS,
} from "../constants";
import type {
  DifficultyLevel,
  GameMode,
  GameSettings,
} from "../types";

interface IntroScreenProps {
  settings: GameSettings;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onOpenStats: () => void;
  onBackToGames: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartGame,
  onOpenStats,
  onBackToGames,
}) => {
  const difficulties: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6 animate-in fade-in">
      {/* Top bar with back to games and stats icon */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToGames}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/60"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للألعاب</span>
        </button>

        <button
          onClick={onOpenStats}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          <span>الأرقام القياسية</span>
        </button>
      </div>

      {/* Hero Title & Egyptian Identity Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, #06232b 0%, #0d3b46 55%, #05161c 100%)",
          border: "2px solid #d4af37",
        }}
      >
        {/* Subtle decorative gold corners */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 rounded-tl" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 rounded-br" />

        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربة مصرية أصيلة بالكامل</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-400">
            ذاكرة الكروت المصرية
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-lg leading-relaxed">
            اختبر قوة ملاحظتك واستدعاء ذاكرتك مع أبهى رموز وتراث ومعالم وأكلات
            مصر، أو طابق أسئلة الثقافة والتاريخ بإجاباتها الموثقة.
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-extrabold text-foreground px-1 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-primary" />
          <span>اختر نمط اللعب:</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mode A: Visual */}
          <button
            onClick={() => onUpdateSettings({ mode: "visual" })}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 cursor-pointer ${
              settings.mode === "visual"
                ? "bg-primary/10 border-primary shadow-md shadow-primary/10"
                : "bg-card border-border hover:border-border/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm sm:text-base text-foreground">
                المطابقة البصرية
              </span>
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  settings.mode === "visual"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              >
                {settings.mode === "visual" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              اقلب الكروت وطابق الرموز والرسومات المصرية المتطابقة (الأهرامات،
              الفانوس، الكشري، اللوتس...).
            </p>
          </button>

          {/* Mode B: Knowledge */}
          <button
            onClick={() => onUpdateSettings({ mode: "knowledge" })}
            className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 cursor-pointer ${
              settings.mode === "knowledge"
                ? "bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/10"
                : "bg-card border-border hover:border-border/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                <span>المعرفة والثقافة</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">
                  سؤال وإجابة
                </span>
              </span>
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  settings.mode === "knowledge"
                    ? "border-teal-500 bg-teal-500"
                    : "border-muted-foreground"
                }`}
              >
                {settings.mode === "knowledge" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              طابق كارت السؤال بكارت الإجابة الصحيحة مع شرح تاريخي وتوثيقي فوري
              لكل معلومة.
            </p>
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-extrabold text-foreground px-1">
          مستوى الصعوبة:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {difficulties.map((diff) => {
            const cfg = DIFFICULTY_CONFIGS[diff];
            const isSelected = settings.difficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => onUpdateSettings({ difficulty: diff })}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 text-foreground font-black shadow-sm"
                    : "bg-card border-border hover:border-border/80 text-muted-foreground font-bold"
                }`}
              >
                <span className="text-sm font-extrabold">{cfg.title}</span>
                <span className="text-[11px] text-muted-foreground">
                  {cfg.pairsCount} أزواج ({cfg.pairsCount * 2} كارت)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold text-foreground px-1 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>المجال الثقافي:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = settings.selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onUpdateSettings({ selectedCategory: cat.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gameplay Toggles (Preview & Sound) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Preview Phase Toggle */}
        <button
          onClick={() =>
            onUpdateSettings({ previewEnabled: !settings.previewEnabled })
          }
          className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors text-right"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs font-extrabold text-foreground block">
                فترة كشف مبدئي (٣ ثوانٍ)
              </span>
              <span className="text-[10px] text-muted-foreground">
                كشف الكروت لحظياً قبل بدء الجولة
              </span>
            </div>
          </div>
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
              settings.previewEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-border text-muted-foreground"
            }`}
          >
            {settings.previewEnabled ? "✓" : ""}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() =>
            onUpdateSettings({ soundEnabled: !settings.soundEnabled })
          }
          className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors text-right"
        >
          <div className="flex items-center gap-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <span className="text-xs font-extrabold text-foreground block">
                المؤثرات الصوتية
              </span>
              <span className="text-[10px] text-muted-foreground">
                أصوات مطابقة وتفاعل كروت حية
              </span>
            </div>
          </div>
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
              settings.soundEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-border text-muted-foreground"
            }`}
          >
            {settings.soundEnabled ? "✓" : ""}
          </span>
        </button>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={onStartGame}
          className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black text-base hover:opacity-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>ابدأ التحدي الآن</span>
        </button>
      </div>
    </div>
  );
};

