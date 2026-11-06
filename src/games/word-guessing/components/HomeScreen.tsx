/**
 * Home/setup screen for Word Guessing game (Redesigned).
 * Clean, minimal, modern, professional — fully RTL, mobile-first.
 */

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Target,
  RotateCcw,
  Trophy,
  RefreshCw,
  ChevronDown,
  Clock,
  Lightbulb,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

import type { WordGuessingWord, WordGuessingSetup, WordGuessingCategoryKey } from "../types";

interface WordGuessingHomeScreenProps {
  wordBank: Map<string, WordGuessingWord>;
  onStart: (setup: WordGuessingSetup) => void;
  onBack: () => void;
  initialStats?: any;
  stats?: any;
}

const CATEGORIES = [
  { id: "mixed", label: "مختلط", description: "كلمات من جميع الفئات" },
  { id: "everyday-life", label: "الحياة اليومية", description: "كلمات يومية" },
  { id: "nature-and-animals", label: "الطبيعة والحيوانات", description: "طبيعة" },
  { id: "food", label: "الطعام", description: "طعام" },
  { id: "science", label: "العلوم", description: "علوم" },
  { id: "technology", label: "التكنولوجيا", description: "تكنولوجيا" },
  { id: "geography", label: "الجغرافيا", description: "جغرافيا" },
  { id: "history", label: "التاريخ", description: "تاريخ" },
  { id: "culture", label: "الثقافة", description: "ثقافة" },
  { id: "sports", label: "الرياضة", description: "رياضة" },
  { id: "general-vocabulary", label: "المفردات العامة", description: "مفردات" },
];

const DIFFICULTIES = [
  { id: "mixed", label: "مختلط", description: "مستويات متنوعة" },
  { id: "easy", label: "سهل", description: "كلمات شائعة" },
  { id: "medium", label: "متوسط", description: "كلمات متوسطة" },
  { id: "hard", label: "صعب", description: "كلمات أصعب" },
] as const;

type DifficultyKey = (typeof DIFFICULTIES)[number]["id"];

function GhostIconButton({
  onClick,
  children,
  "aria-label": ariaLabel,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex size-9 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-accent transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  subLabels,
  className = "",
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  subLabels?: Record<T, string>;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full rounded-xl bg-muted/50 p-1 ${className}`}
      role="radiogroup"
      aria-label={options.map((o) => o.label).join(", ")}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex-1 flex flex-col items-center gap-1 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150 ${
            value === opt.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{opt.label}</span>
          {subLabels?.[opt.id] && (
            <span className={`text-[11px] font-normal ${
              value === opt.id
                ? "text-primary-foreground/70"
                : "text-muted-foreground/70"
            }`}>
              {subLabels[opt.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function SelectPill({
  label,
  value,
  onClick,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors ${className}`}
    >
      <span className="truncate">{label}</span>
      <Icon className="size-4.5 text-muted-foreground shrink-0" />
    </button>
  );
}

function InfoChip({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" />
      <span>{label}</span>
    </span>
  );
}

function StatColumn({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2">
      <div className="text-2xl sm:text-3xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function CategoryBottomSheet({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: typeof CATEGORIES;
  selectedCategory: WordGuessingCategoryKey;
  onSelect: (id: WordGuessingCategoryKey) => void;
}) {
  if (!isOpen) return null;

  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className="relative flex-1 flex flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
          <h2 id="sheet-title" className="text-lg font-bold text-foreground">
            اختر الفئة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="إغلاق"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelect(cat.id as WordGuessingCategoryKey);
                    onClose();
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-[11px] text-muted-foreground">{cat.description}</span>
                  {isSelected && (
                    <span className="absolute top-2 end-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WordGuessingHomeScreen({
  wordBank,
  onStart,
  onBack,
  initialStats,
  stats,
}: WordGuessingHomeScreenProps) {
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [category, setCategory] = useState<WordGuessingCategoryKey>("mixed");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("mixed");
  const [hintEnabled, setHintEnabled] = useState(true);
  const [timezone, setTimezone] = useState<string>("Africa/Cairo");
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const totalApproved = wordBank.size;

  const handleStart = () => {
    const setup: WordGuessingSetup = {
      mode,
      category,
      difficulty,
      maxAttempts: 6,
      timezone,
      hintEnabled,
      allowGuessSubstitution: false,
      streakEnabled: true,
    };
    onStart(setup);
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground" dir="rtl">
      {/* Header - minimal ghost buttons */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <GhostIconButton onClick={onBack} aria-label="العودة">
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </GhostIconButton>

        <div className="flex-1 text-center">
          <h1 className="text-xl font-extrabold text-foreground">خمن الكلمة</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            خمّن كلمة من 5 حروف في 6 محاولات
          </p>
        </div>

        <GhostIconButton onClick={() => window.location.reload()} aria-label="تحديث">
          <RefreshCw className="size-5" />
        </GhostIconButton>
      </header>

      {/* Main content - centered column, max-width ~480px */}
      <main className="flex-1 flex flex-col px-4 pb-24 sm:px-6 sm:py-6">
        <div className="w-full max-w-[480px] mx-auto flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-6">
            {/* 1. Mode Selector */}
            <div>
              <SegmentedControl
                options={[
                  { id: "daily", label: "تحدي يومي" },
                  { id: "practice", label: "تدريب" },
                ]}
                value={mode}
                onChange={setMode}
                subLabels={{
                  daily: "كلمة واحدة للجميع",
                  practice: "جولات غير محدودة",
                }}
              />
            </div>

            {/* 2. Category (Select Pill + Bottom Sheet) */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">الفئة</label>
              <SelectPill
                label={selectedCategory.label}
                value={category}
                onClick={() => setIsCategorySheetOpen(true)}
                icon={ChevronDown}
              />
              <CategoryBottomSheet
                isOpen={isCategorySheetOpen}
                onClose={() => setIsCategorySheetOpen(false)}
                categories={CATEGORIES}
                selectedCategory={category}
                onSelect={setCategory}
              />
            </div>

            {/* 3. Difficulty (Segmented Control - 4 options) */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">الصعوبة</label>
              <SegmentedControl
                options={DIFFICULTIES.map((d) => ({ id: d.id, label: d.label }))}
                value={difficulty}
                onChange={setDifficulty}
              />
            </div>

            {/* 4. Secondary Settings (merged info chips) */}
            <div className="flex flex-wrap items-center gap-2">
              {mode === "daily" && (
                <InfoChip icon={Clock} label={`المنطقة الزمنية: القاهرة`} />
              )}
              <InfoChip
                icon={Lightbulb}
                label={hintEnabled ? "تلميح متاح" : "تلميح معطل"}
              />
            </div>

            {/* 5. Stats (slim borderless row) */}
            {initialStats && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-3">إحصائياتك</p>
                <div className="flex items-center gap-0">
                  <StatColumn label="ألعاب" value={initialStats.totalGames ?? 0} color="var(--primary)" />
                  <div className="w-px h-10 bg-border/50" />
                  <StatColumn label="فوز" value={initialStats.totalWins ?? 0} color="var(--success)" />
                  <div className="w-px h-10 bg-border/50" />
                  <StatColumn label="أفضل سلسلة" value={initialStats.bestStreak ?? 0} color="var(--warning)" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 6. Primary CTA - sticky bottom */}
      <div
        className="sticky bottom-0 z-40 w-full max-w-[480px] mx-auto px-4 pb-4 pt-2 sm:pb-6 sm:pt-4 bg-gradient-to-t from-background/95 to-transparent"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}
      >
        <Button
          onClick={handleStart}
          disabled={!totalApproved}
          className="w-full rounded-2xl h-13 sm:h-14 text-base sm:text-lg font-extrabold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            <Trophy className="size-5" />
            ابدأ اللعبة
          </span>
        </Button>
      </div>
    </div>
  );
}