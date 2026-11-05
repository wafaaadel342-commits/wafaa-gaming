import { motion } from "framer-motion";
import {
  Clock3,
  Cpu,
  FlaskConical,
  Flame,
  Globe2,
  Landmark,
  Leaf,
  Lightbulb,
  ListChecks,
  Pyramid,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { sound } from "@/lib/sound";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  QUESTION_COUNT_OPTIONS,
  TIMER_OPTIONS,
} from "../constants";
import type {
  TrueFalseCategoryKey,
  TrueFalseDifficultyFilter,
  TrueFalseSetup,
} from "../types";
import type { BestScores } from "../lib/storage";
import { styles } from "../styles";

const CATEGORY_ICONS: Record<TrueFalseCategoryKey, LucideIcon> = {
  science: FlaskConical,
  history: Landmark,
  geography: Globe2,
  technology: Cpu,
  general: Lightbulb,
  nature: Leaf,
  egypt: Pyramid,
  mixed: Shuffle,
};

const DIFFICULTY_ICONS: Record<TrueFalseDifficultyFilter, LucideIcon> = {
  easy: Sparkles,
  medium: Zap,
  hard: Flame,
  mixed: Target,
};

interface HomeScreenProps {
  setup: TrueFalseSetup;
  best: BestScores;
  bankCount: number;
  onChange: (patch: Partial<TrueFalseSetup>) => void;
  onStart: () => void;
}

function formatBest(value: number): string {
  return value > 0 ? `${value} نقطة` : "لم تلعب بعد";
}

export function HomeScreen({ setup, best, bankCount, onChange, onStart }: HomeScreenProps) {
  const overall = Math.max(best.easy, best.medium, best.hard, best.mixed);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className={`${styles.panel} p-5 sm:p-6`}
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black sm:text-xl">اختر فئة الأسئلة</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                يمكنك البدء بفئة محددة أو تجربة مزيج من كل الفئات.
              </p>
            </div>
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
                {bankCount} سؤالًا متاحًا
              </span>
              {overall > 0 && (
                <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
                  أفضل نتيجة: {formatBest(overall)}
                </span>
              )}
            </div>
          </div>

          <div className={styles.categoryGrid}>
            {CATEGORY_ORDER.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              const active = setup.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.playClick();
                    onChange({ category });
                  }}
                  aria-pressed={active}
                  className={`${styles.categoryCard} ${active ? styles.categoryCardActive : ""}`}
                >
                  <span className={styles.categoryIcon}>
                    <Icon className="size-4" />
                  </span>
                  <span className={styles.categoryName}>{CATEGORY_LABELS[category]}</span>
                  <span className={styles.categoryHint}>{CATEGORY_DESCRIPTIONS[category]}</span>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className={`${styles.panel} flex flex-col p-5 sm:p-6`}
        >
          <div>
            <h2 className="text-lg font-black sm:text-xl">إعدادات الجولة</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              اضبط الصعوبة وعدد الأسئلة ومدة كل سؤال.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-foreground">
                <Target className="size-3.5 text-primary" />
                مستوى الصعوبة
              </div>
              <div className={styles.segmented}>
                {DIFFICULTY_ORDER.map((difficulty) => {
                  const Icon = DIFFICULTY_ICONS[difficulty];
                  const active = setup.difficulty === difficulty;
                  return (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        sound.playClick();
                        onChange({ difficulty });
                      }}
                      aria-pressed={active}
                      title={DIFFICULTY_DESCRIPTIONS[difficulty]}
                      className={`${styles.segment} ${active ? styles.segmentActive : ""}`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Icon className="size-3.5" />
                        {DIFFICULTY_LABELS[difficulty]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-foreground">
                <ListChecks className="size-3.5 text-primary" />
                عدد الأسئلة
              </div>
              <div className={styles.segmented}>
                {QUESTION_COUNT_OPTIONS.map((count) => {
                  const active = setup.questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        sound.playClick();
                        onChange({ questionCount: count });
                      }}
                      aria-pressed={active}
                      className={`${styles.segment} ${active ? styles.segmentActive : ""}`}
                    >
                      {count} أسئلة
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-foreground">
                <Clock3 className="size-3.5 text-primary" />
                مؤقت السؤال
              </div>
              <div className={styles.segmented}>
                {TIMER_OPTIONS.map((seconds) => {
                  const active = setup.timerSeconds === seconds;
                  return (
                    <button
                      key={seconds}
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        sound.playClick();
                        onChange({ timerSeconds: seconds });
                      }}
                      aria-pressed={active}
                      className={`${styles.segment} ${active ? styles.segmentActive : ""}`}
                    >
                      {seconds} ثوانٍ
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                sound.unlock();
                sound.playStartJingle();
                onStart();
              }}
              className={styles.startButton}
            >
              <Zap className="size-5" />
              ابدأ التحدي
            </button>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              تعرض اللعبة الأسئلة الموثقة فقط، مع مصدر مرجعي لكل حقيقة.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
