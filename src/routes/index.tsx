import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Database,
  Gamepad2,
  HelpCircle,
  Layers,
  Quote,
  RefreshCw,
  Sparkles,
  SpellCheck,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BackgroundBlobs } from "@/components/common/BackgroundBlobs";
import { SettingsDialog } from "@/components/quiz/SettingsDialog";
import { GAMES_REGISTRY, getGameBestScore, type GameDefinition } from "@/lib/games";
import { loadSettings, saveSettings, type Settings } from "@/lib/quiz";
import {
  startGlobalBankFilling,
  cancelGlobalBankFilling,
  subscribeGlobalBankFiller,
  getGlobalBankFillerState,
  type GlobalBankFillerState,
} from "@/lib/bank-filler";
import { sound } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "العب وتعلم — منصة ألعاب تعليمية وثقافية تفاعلية" },
      {
        name: "description",
        content:
          "منصة ألعاب ذهنية وتعليمية باللغة العربية: تحدي المعرفة، ركب الكلمة والجملة، وألعاب ثقافية ممتعة بالذكاء الاصطناعي.",
      },
    ],
  }),
  component: HubHomePage,
});

type FilterType = "all" | "ready" | "soon";

function arabicNum(n: number): string {
  return n
    .toString()
    .split("")
    .map((c) => "٠١٢٣٤٥٦٧٨٩"[Number(c)])
    .join("");
}

function HubHomePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bestScores, setBestScores] = useState<Record<string, number | null>>({});
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [fillerState, setFillerState] = useState<GlobalBankFillerState>(() =>
    getGlobalBankFillerState(),
  );

  // Subscribe to global bank filler updates
  useEffect(() => {
    const unsub = subscribeGlobalBankFiller((st) => {
      setFillerState(st);
    });
    return unsub;
  }, []);

  // Automatic bank filling 3 seconds after opening the website
  useEffect(() => {
    const sessionTriggerKey = "tahaddi_autofill_200_triggered";
    if (sessionStorage.getItem(sessionTriggerKey)) {
      return;
    }

    const timer = setTimeout(async () => {
      sessionStorage.setItem(sessionTriggerKey, "true");
      const currentSettings = loadSettings();

      toast.info(
        "جاري التعبئة التلقائية المتوازية لبنك المحتوى (٢٠٠ عنصر: أسئلة، كلمات، وجمل)...",
        {
          duration: 5000,
        },
      );

      try {
        const res = await startGlobalBankFilling(currentSettings, "all", 200);
        if (res.added > 0) {
          toast.success(
            `اكتملت تعبئة البنك بنجاح! تم توليد وحفظ ${res.added} عنصراً جديداً في بنك المحتوى للعب الفوري. 🎉`,
            { duration: 6000 },
          );
        }
      } catch (err) {
        console.warn("Auto bank filling error:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSettings(loadSettings());

    // Load best scores for registered games from localStorage
    const scores: Record<string, number | null> = {};
    for (const game of GAMES_REGISTRY) {
      if (game.storageBestKey) {
        scores[game.id] = getGameBestScore(game.storageBestKey);
      }
    }
    setBestScores(scores);
  }, []);

  const saveSettingsAndClose = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
    setSettingsOpen(false);
  };

  const filteredGames = useMemo(() => {
    if (activeFilter === "ready") {
      return GAMES_REGISTRY.filter((g) => g.status === "ready");
    }
    if (activeFilter === "soon") {
      return GAMES_REGISTRY.filter((g) => g.status === "soon");
    }
    return GAMES_REGISTRY;
  }, [activeFilter]);

  const handleScrollToGames = () => {
    sound.unlock();
    sound.playClick();
    const el = document.getElementById("games-library");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSoonClick = (title: string) => {
    sound.unlock();
    sound.playClick();
    toast.info(
      `لعبة "${title}" قيد التطوير حالياً وستكون متاحة في التحديث القادم! يمكنك تجربة تحدي المعرفة أو ركب الكلمة الآن.`,
    );
  };

  return (
    <main className="relative min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <BackgroundBlobs theme="default" />

      {/* Header */}
      <AppHeader onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main Hub Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-12 sm:gap-16">
        {/* Hero Section */}
        <section aria-labelledby="hero-title" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Right Column: Editorial Copy (RTL: right side) */}
            <div className="lg:col-span-7 flex flex-col items-start text-start">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold tracking-wide shadow-2xs mb-4">
                  <Sparkles className="size-3.5 text-accent shrink-0" />
                  <span>منصة الألعاب التعليمية التفاعلية</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                id="hero-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.25]"
              >
                تعلّم بشغف، ونافس بذكاء
                <span className="block text-primary mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground/90">
                  تحديات فكرية ولغوية تفاعلية
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
              >
                اكتشف تجربة تعليمية ممتعة تجمع بين إثراء الثقافة العامة وتحديات اللغة العربية
                والذكاء الاصطناعي. اختر لعبتك المفضلة، وحقق أعلى نتيجة في بيئة لعب راقية ومحفزة.
              </motion.p>

              {/* Actions & Live Stats */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22 }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 w-full"
              >
                <Button
                  size="lg"
                  onClick={handleScrollToGames}
                  className="h-12 px-7 text-base font-bold shadow-md hover:shadow-lg transition-all gap-2.5 rounded-xl cursor-pointer"
                >
                  <span>ابدأ اللعب</span>
                  <ArrowLeft className="size-4.5" />
                </Button>

                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/80 bg-card/70 text-xs sm:text-sm font-medium text-foreground/80 shadow-2xs">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                  </span>
                  <span>٦ ألعاب فكرية متنوعة</span>
                  <span className="text-border">•</span>
                  <span className="text-muted-foreground">متجددة ومجانية</span>
                </div>
              </motion.div>
            </div>

            {/* Left Column: Visual Composition (RTL: left side) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative w-full flex justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Main Featured Card */}
                <div className="relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg p-3 transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                    <img
                      src="/knowledge-challenge.webp"
                      alt="تحدي المعرفة"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2.5 end-2.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-foreground text-xs font-bold border border-border/60 shadow-xs flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>الأكثر شعبية</span>
                    </div>
                    <div className="absolute bottom-2.5 start-2.5 end-2.5 flex items-center justify-between text-white">
                      <div>
                        <div className="text-xs text-white/80 font-medium">اللعبة المميزة</div>
                        <div className="text-base font-extrabold text-white">تحدي المعرفة</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
                        ١٠٠٠+ سؤال
                      </div>
                    </div>
                  </div>

                  {/* Micro stat bar */}
                  <div className="mt-3 px-2 py-1 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Brain className="size-3.5 text-primary" />
                      <span className="font-semibold text-foreground">ذكاء اصطناعي تفاعلي</span>
                    </div>
                    <Link
                      to="/quiz"
                      onClick={() => {
                        sound.unlock();
                        sound.playCardPress();
                      }}
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>العب الآن</span>
                      <ArrowLeft className="size-3" />
                    </Link>
                  </div>
                </div>

                {/* Secondary Offset Floating Badge: Word Builder */}
                <div className="hidden sm:flex absolute -bottom-5 -start-5 items-center gap-3 p-3 rounded-xl border border-border/90 bg-card/95 backdrop-blur-md shadow-xl max-w-[240px] animate-rise">
                  <img
                    src="/word-builder.webp"
                    alt="ركب الكلمة"
                    className="size-11 rounded-lg object-cover border border-border/60 shrink-0"
                  />
                  <div className="flex flex-col text-start">
                    <span className="text-xs font-bold text-foreground">ركب الكلمة والجملة</span>
                    <span className="text-[11px] text-muted-foreground">تحدي السرعة اللغوية</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Games Library Section */}
        <section
          id="games-library"
          aria-labelledby="games-library-heading"
          className="flex flex-col gap-6 pt-4"
        >
          {/* Section Header with Refined Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                <Gamepad2 className="size-4" />
                <span>مكتبة الألعاب</span>
              </div>
              <h2
                id="games-library-heading"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              >
                اختر التحدي الفكري
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ستة ألعاب تعليمية بتصميم فريد وأسلوب بصري متناسق
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  sound.playClick();
                  setActiveFilter("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                الكل (٦)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  sound.playClick();
                  setActiveFilter("ready");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "ready"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                متاحة للعب (٤)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  sound.playClick();
                  setActiveFilter("soon");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "soon"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                قريباً (٢)
              </button>
            </div>
          </div>

          {/* Games Grid: 3 columns desktop, 2 columns tablet, 1 column mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredGames.map((game: GameDefinition, idx: number) => {
              const isReady = game.status === "ready";
              const bestScore = bestScores[game.id];
              const Icon = game.icon;

              return (
                <motion.article
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  onClick={
                    isReady
                      ? () => {
                        sound.unlock();
                        sound.playCardPress();
                        navigate({ to: game.route });
                      }
                      : undefined
                  }
                  onKeyDown={
                    isReady
                      ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          sound.unlock();
                          sound.playCardPress();
                          navigate({ to: game.route });
                        }
                      }
                      : undefined
                  }
                  role={isReady ? "link" : undefined}
                  tabIndex={isReady ? 0 : undefined}
                  aria-label={isReady ? `العب ${game.title}` : undefined}
                  className={`group relative flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 ${isReady
                    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    : ""
                    }`}
                >
                  {/* Artwork Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted/40">
                    <img
                      src={game.image}
                      alt={game.title}
                      loading={idx < 2 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        // Fallback gracefully if image fails to load
                        const target = e.currentTarget;
                        target.style.display = "none";
                      }}
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                    {/* Category Tag on bottom start */}
                    <div className="absolute bottom-3 start-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-background/90 text-foreground text-xs font-bold backdrop-blur-md border border-border/60 shadow-xs">
                        {game.category}
                      </span>
                    </div>

                    {/* Status Pill on top end */}
                    <div className="absolute top-3 end-3">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/95 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold backdrop-blur-md shadow-xs">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>متاح الآن</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/95 text-muted-foreground border border-border/60 text-xs font-medium backdrop-blur-md shadow-xs">
                          <Sparkles className="size-3 text-amber-500" />
                          <span>قريباً</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title & Icon Header */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {game.title}
                        </h3>
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15">
                          <Icon className="size-4.5" />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {game.description}
                      </p>

                      {/* Feature Chips */}
                      {game.features && game.features.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {game.features.map((feat) => (
                            <span
                              key={feat}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Status & Play Action */}
                    <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between gap-3">
                      {/* Score or Status */}
                      <div>
                        {bestScore !== null && bestScore !== undefined && bestScore > 0 ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <Trophy className="size-3.5 text-amber-500 shrink-0" />
                            <span>أعلى نتيجة: {bestScore}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {isReady ? "جاهز للتحدي" : "قيد التطوير"}
                          </span>
                        )}
                      </div>

                      {/* Play or Soon Action */}
                      {isReady ? (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-2xs transition-shadow group-hover:shadow-sm">
                          <span>العب الآن</span>
                          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSoonClick(game.title)}
                          className="font-medium gap-1.5 rounded-lg px-3.5 text-muted-foreground hover:text-foreground border-border/80 cursor-pointer"
                        >
                          <span>قريباً</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <AppFooter />

        {/* Floating Live Bank Filling Progress Pill */}
        {fillerState.isFilling && fillerState.progress && (
          <motion.aside
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            aria-live="polite"
            className="fixed top-20 sm:top-24 start-4 sm:start-6 z-50 flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-primary/35 bg-card/95 backdrop-blur-xl shadow-2xl max-w-sm sm:max-w-md"
          >
            <div className="relative size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <RefreshCw className="size-4.5 animate-spin" />
            </div>

            <div className="flex-1 flex flex-col gap-1 min-w-0 text-start">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <span className="text-foreground truncate flex items-center gap-1.5">
                  <Database className="size-3.5 text-primary" />
                  تعبئة بنك المحتوى
                </span>
                <span className="font-mono text-primary text-xs shrink-0 font-extrabold">
                  {fillerState.progress.completed} / {fillerState.progress.total}
                </span>
              </div>

              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (fillerState.progress.completed / Math.max(1, fillerState.progress.total)) *
                        100,
                      ),
                    )}%`,
                  }}
                />
              </div>

              <span className="text-[11px] text-muted-foreground truncate">
                {fillerState.progress.currentTask}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                cancelGlobalBankFilling();
                toast.info("تم إيقاف عملية التعبئة التلقائية.");
              }}
              className="size-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="إيقاف التعبئة"
              aria-label="إيقاف التعبئة"
            >
              <X className="size-4" />
            </button>
          </motion.aside>
        )}

        {/* Settings Dialog */}
        {settings && (
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            settings={settings}
            onSave={saveSettingsAndClose}
          />
        )}

        <Toaster position="top-center" offset={80} richColors />
      </div>
    </main>
  );
}
