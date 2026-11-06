import { useState } from "react";
import { BookOpen, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PROVERB_CATEGORIES,
  type ProverbCategoryKey,
  type ProverbSetupOptions,
} from "@/lib/proverbs";
import { sound } from "@/lib/sound";

const ALL_PROVERB_CATEGORIES = Object.keys(PROVERB_CATEGORIES) as ProverbCategoryKey[];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupOptions: ProverbSetupOptions;
  onStartQuiz: (options: ProverbSetupOptions) => void;
}

export function ProverbsSetupDialog({
  open,
  onOpenChange,
  setupOptions,
  onStartQuiz,
}: Props) {
  const [count, setCount] = useState<10 | 15 | 20>(setupOptions.questionCount);

  const handleStart = () => {
    sound.unlock();
    sound.playStartJingle();
    onStartQuiz({
      questionCount: count,
      categories: ALL_PROVERB_CATEGORIES,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">إعدادات أكمل المثل</DialogTitle>
          <DialogDescription>
            اختر عدد الأسئلة وابدأ التحدي فوراً. سيتم تضمين جميع التصنيفات مع أولوية للأمثال المصرية.
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

          <Button size="lg" className="w-full text-base font-bold shadow-md h-14" onClick={handleStart}>
            <Play className="me-2 size-5 fill-current" />
            ابدأ التحدي ({count} سؤال)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
