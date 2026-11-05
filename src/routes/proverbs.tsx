import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Flame, Sparkles, Trophy, Zap } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { ProverbsQuizScreen } from "@/components/quiz/ProverbsQuizScreen";
import { ProverbsSetupDialog } from "@/components/quiz/ProverbsSetupDialog";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { SettingsDialog } from "@/components/quiz/SettingsDialog";
import { Button } from "@/components/ui/button";
import {
  LEVELS,
  loadSettings,
  saveSettings,
  type Level,
  type Missed,
  type Settings,
} from "@/lib/quiz";
import { DEFAULT_PROVERB_SETUP, type ProverbSetupOptions } from "@/lib/proverbs";
import { sound } from "@/lib/sound";

export const Route = createFileRoute("/proverbs")({
  head: () => ({
    meta: [
      { title: "أكمل المثل — العب وتعلم" },
      {
        name: "description",
        content: "أكمل الأمثال والحكم الشعبية والعربية الشهيرة واختبر معرفتك بالموروث البلاغي",
      },
    ],
  }),
  component: ProverbsGamePage,
});

const LEVEL_ICONS: Record<Level, typeof Sparkles> = {
  easy: Sparkles,
  medium: Zap,
  hard: Flame,
};

const PROVERBS_BEST_KEY = "proverbs-best";

type Best = Record<Level, number>;

function loadProverbsBest(): Best {
  try {
    const raw = localStorage.getItem(PROVERBS_BEST_KEY);
    if (raw) return { easy: 0, medium: 0, hard: 0, ...(JSON.parse(raw) as Partial<Best>) };
  } catch {
    /* ignore */
  }
  return { easy: 0, medium: 0, hard: 0 };
}

function saveProverbsBest(best: Best) {
  try {
    localStorage.setItem(PROVERBS_BEST_KEY, JSON.stringify(best));
  } catch {
    /* ignore */
  }
}

type View =
  | { name: "home" }
  | { name: "game"; level: Level; setup: ProverbSetupOptions }
  | {
      name: "results";
      level: Level;
      score: number;
      missed: Missed[];
      totalQuestions: number;
      setup: ProverbSetupOptions;
    };

function ProverbsGamePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ name: "home" });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [best, setBest] = useState<Best>({ easy: 0, medium: 0, hard: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setupLevel, setSetupLevel] = useState<Level | null>(null);
  const [setupOptions, setSetupOptions] = useState<ProverbSetupOptions>(DEFAULT_PROVERB_SETUP);

  useEffect(() => {
    setSettings(loadSettings());
    setBest(loadProverbsBest());
  }, []);

  const saveSettingsAndClose = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
    setSettingsOpen(false);
  };

  const handleStart = (options: ProverbSetupOptions) => {
    if (!setupLevel) return;
    setSetupOptions(options);
    const level = setupLevel;
    setSetupLevel(null);
    setView({ name: "game", level, setup: options });
  };

  const finishRound = (
    level: Level,
    score: number,
    missed: Missed[],
    totalQuestions: number,
    setup: ProverbSetupOptions,
  ) => {
    setBest((prev) => {
      const next = { ...prev, [level]: Math.max(prev[level], score) };
      saveProverbsBest(next);
      return next;
    });
    setView({ name: "results", level, score, missed, totalQuestions, setup });
  };

  const viewKey =
    view.name === "home"
      ? "home"
      : view.name === "game"
        ? `game-${view.level}-${view.setup.questionCount}`
        : `results-${view.score}`;

  return (
    <main className="relative min-h-dvh flex flex-col">
      <BackgroundBlobs theme="quiz" />

      <AppHeader
        showHomeButton={true}
        gameTitle="أكمل المثل"
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex-1 flex flex-col justify-center"
          >
            {view.name === "home" && (
              <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 py-16">
                <header className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 inline-flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-quiz-primary/20 to-quiz-primary/5 border-2 border-quiz-primary/30 shadow-lg shadow-quiz-primary/10"
                  >
                    <BookOpen className="size-10 text-quiz-primary" />
                  </motion.div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                    أكمل المثل
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    أكمل الأمثال والحكم الشعبية والعربية الشهيرة
                    <br />
                    واختبر معرفتك بالموروث البلاغي الأصيل
                  </p>
                </header>

                <div className="grid w-full gap-5 sm:grid-cols-3">
                  {(Object.keys(LEVELS) as Level[]).map((level, idx) => {
                    const Icon = LEVEL_ICONS[level];
                    return (
                      <motion.button
                        key={level}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          sound.unlock();
                          sound.playClick();
                          setSetupLevel(level);
                        }}
                        className="group relative overflow-hidden rounded-3xl border-2 border-border bg-card p-7 text-center transition-all duration-200 hover:border-primary/60 hover:shadow-xl cursor-pointer"
                      >
                        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border-2 border-primary/20 transition-transform duration-200 group-hover:scale-110">
                          <Icon className="size-8" />
                        </span>
                        <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold">
                          {LEVELS[level].label}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {LEVELS[level].description}
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm font-bold text-secondary-foreground border border-border/50">
                          <Trophy className="size-4" />
                          {best[level] > 0 ? `${best[level]} نقطة` : "ابدأ الآن"}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  className="mt-10 text-sm font-medium text-muted-foreground"
                  onClick={() => {
                    sound.unlock();
                    setSettingsOpen(true);
                  }}
                >
                  إعدادات الصوت والمحتوى
                </Button>
              </div>
            )}

            {view.name === "game" && settings && (
              <ProverbsQuizScreen
                level={view.level}
                settings={settings}
                setupOptions={view.setup}
                onFinish={(score, missed, totalCount) =>
                  finishRound(view.level, score, missed, totalCount, view.setup)
                }
                onExit={() => navigate({ to: "/" })}
              />
            )}

            {view.name === "results" && (
              <ResultsScreen
                level={view.level}
                score={view.score}
                missed={view.missed}
                totalQuestions={view.totalQuestions}
                onReplay={() => setView({ name: "game", level: view.level, setup: view.setup })}
                onHome={() => navigate({ to: "/" })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AppFooter />

      {setupLevel && (
        <ProverbsSetupDialog
          open={Boolean(setupLevel)}
          onOpenChange={(open) => {
            if (!open) setSetupLevel(null);
          }}
          level={setupLevel}
          setupOptions={setupOptions}
          onStartQuiz={handleStart}
        />
      )}

      {settings && (
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onSave={saveSettingsAndClose}
        />
      )}

      <Toaster position="top-center" offset={80} />
    </main>
  );
}
