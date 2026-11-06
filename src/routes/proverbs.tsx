import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Flame, Play, Sparkles, Trophy, Zap } from "lucide-react";
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
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupOptions, setSetupOptions] = useState<ProverbSetupOptions>(DEFAULT_PROVERB_SETUP);

  // Use 'easy' as default level for simplified flow
  const DEFAULT_LEVEL: Level = "easy";

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
    setSetupOptions(options);
    setSetupDialogOpen(false);
    setView({ name: "game", level: DEFAULT_LEVEL, setup: options });
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

                <div className="w-full max-w-md space-y-4">
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      sound.unlock();
                      sound.playClick();
                      setSetupDialogOpen(true);
                    }}
                    className="group relative w-full rounded-2xl px-8 py-6 text-center cursor-pointer overflow-hidden bg-gradient-to-r from-quiz-primary via-quiz-primary/90 to-quiz-primary border border-quiz-primary/30 shadow-lg shadow-quiz-primary/25 hover:shadow-xl hover:shadow-quiz-primary/30 transition-all duration-300"
                  >
                    {/* Animated shimmer background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    
                    {/* Subtle pulse ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-quiz-primary/30 animate-pulse opacity-50 group-hover:opacity-0 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {/* Icon with subtle bounce */}
                      <div className="inline-flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      
                      <div className="text-left">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
                          ابدأ التحدي
                        </h3>
                        <p className="mt-1 text-sm sm:text-base text-quiz-primary-foreground/90 font-medium">
                          اختر عدد الأسئلة (10 / 15 / 20) وابدأ فوراً
                        </p>
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className="inline-flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover:translate-x-1 transition-transform duration-300 ml-2">
                        <Play className="size-5 text-white fill-current" />
                      </div>
                    </div>
                    
                    {/* Badge below button */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-quiz-primary/20 to-quiz-primary/10 px-3 py-1.5 text-xs font-bold text-quiz-primary border border-quiz-primary/30 shadow-md shadow-quiz-primary/10 backdrop-blur-sm">
                      <Trophy className="size-3.5 animate-bounce" />
                      <span className="text-quiz-primary-foreground whitespace-nowrap">جميع التصنيفات · أولوية للمصرية</span>
                    </div>
                  </motion.button>

                  <Button
                    variant="ghost"
                    className="w-full text-sm font-medium text-muted-foreground"
                    onClick={() => {
                      sound.unlock();
                      setSettingsOpen(true);
                    }}
                  >
                    إعدادات الصوت والمحتوى
                  </Button>
                </div>
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

      {setupDialogOpen && (
        <ProverbsSetupDialog
          open={setupDialogOpen}
          onOpenChange={setSetupDialogOpen}
          setupOptions={setupOptions}
          onStartQuiz={handleStart}
        />
      )}

      {settingsOpen && settings && (
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
