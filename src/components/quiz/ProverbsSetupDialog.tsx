import { useState } from "react";
import { BookOpen, Check, Play, Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LEVELS, type Level } from "@/lib/quiz";
import {
  PROVERB_CATEGORIES,
  type ProverbCategoryKey,
  type ProverbSetupOptions,
} from "@/lib/proverbs";
import { sound } from "@/lib/sound";

const CATEGORY_ICONS: Record<ProverbCategoryKey, typeof BookOpen> = {
  egyptian: BookOpen,
  classical: Quote,
  levantine: Quote,
  gulf: Quote,
  "north-african": BookOpen,
  mixed: BookOpen,
};

const ALL_PROVERB_CATEGORIES = Object.keys(PROVERB_CATEGORIES) as ProverbCategoryKey[];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: Level;
  setupOptions: ProverbSetupOptions;
  onStartQuiz: (options: ProverbSetupOptions) => void;
}

export function ProverbsSetupDialog({
  open,
  onOpenChange,
  level,
  setupOptions,
  onStartQuiz,
}: Props) {
  const [count, setCount] = useState<10 | 15 | 20>(setupOptions.questionCount);
  const [selectedCats, setSelectedCats] = useState<ProverbCategoryKey[]>(
    setupOptions.categories.length > 0
      ? setupOptions.categories
      : (["egyptian", "classical", "mixed"] as ProverbCategoryKey[]),
  );

  const toggleCategory = (cat: ProverbCategoryKey) => {
    sound.unlock();
    sound.playClick();
    if (selectedCats.includes(cat)) {
      if (selectedCats.length > 1) {
        setSelectedCats(selectedCats.filter((c) => c !== cat));
      }
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const selectAll = () => {
    sound.unlock();
    sound.playClick();
    setSelectedCats([...ALL_PROVERB_CATEGORIES]);
  };

  const clearAll = () => {
    sound.unlock();
    sound.playClick();
    setSelectedCats([ALL_PROVERB_CATEGORIES[0]!]);
  };

  const handleStart = () => {
    sound.unlock();
    onStartQuiz({
      questionCount: count,
      categories:
        selectedCats.length > 0
          ? selectedCats
          : (["egyptian", "classical", "mixed"] as ProverbCategoryKey[]),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-xl bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              مستوى {LEVELS[level].label}
            </span>
          </div>
          <DialogTitle className="mt-2 text-2xl font-bold">إعدادات أكمل المثل</DialogTitle>
          <DialogDescription>
            حدد عدد الأسئلة والتصنيفات التي ترغب في تضمينها في هذه الجولة.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Question count segmented selector */}
          <div>
            <label className="text-sm font-bold text-foreground">عدد الأسئلة</label>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-secondary/60 p-1.5">
              {([10, 15, 20] as const).map((num) => {
                const active = count === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      sound.playClick();
                      setCount(num);
                    }}
                    className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {num} سؤال
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories multi-select chips */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground">
                التصنيفات ({selectedCats.length} من {ALL_PROVERB_CATEGORIES.length})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  تحديد الكل
                </button>
                <span className="text-xs text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:underline font-semibold"
                >
                  مسح الكل
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_PROVERB_CATEGORIES.map((catKey) => {
                const info = PROVERB_CATEGORIES[catKey];
                const Icon = CATEGORY_ICONS[catKey];
                const isSelected = selectedCats.includes(catKey);

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => toggleCategory(catKey)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-start text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                        : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{info.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
            {selectedCats.length === 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                * يجب أن يبقى تصنيف واحد على الأقل محدداً.
              </p>
            )}
          </div>

          <Button size="lg" className="w-full text-base font-bold shadow-md" onClick={handleStart}>
            <Play className="me-2 size-5 fill-current" />
            ابدأ التحدي ({count} سؤال)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
