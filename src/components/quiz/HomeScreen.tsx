import { motion } from "framer-motion";
import { AlertCircle, Brain, Flame, KeyRound, Scale, Sparkles, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVELS, type Best, type Level } from "@/lib/quiz";
import { sound } from "@/lib/sound";

const ICONS: Record<Level, typeof Sparkles> = {
  easy: Sparkles,
  medium: Zap,
  hard: Flame
};

const TONE: Record<Level, {
  icon: string;
  card: string;
  gradient: string;
  shadow: string;
}> = {
  easy: {
    icon: "bg-easy/15 text-easy border-2 border-easy/30",
    card: "border-easy/40 hover:border-easy/70 hover:shadow-easy/20",
    gradient: "from-easy/15 via-easy/5 to-transparent",
    shadow: "shadow-easy/10",
  },
  medium: {
    icon: "bg-medium/15 text-medium border-2 border-medium/30",
    card: "border-medium/40 hover:border-medium/70 hover:shadow-medium/20",
    gradient: "from-medium/15 via-medium/5 to-transparent",
    shadow: "shadow-medium/10",
  },
  hard: {
    icon: "bg-hard/15 text-hard border-2 border-hard/30",
    card: "border-hard/40 hover:border-hard/70 hover:shadow-hard/20",
    gradient: "from-hard/15 via-hard/5 to-transparent",
    shadow: "shadow-hard/10",
  },
};

interface Props {
  best: Best;
  hasApiKey: boolean;
  onSelectLevel: (level: Level) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ best, hasApiKey, onSelectLevel, onOpenSettings }: Props) {
  const handleLevelClick = (level: Level) => {
    sound.unlock();
    sound.playClick();
    if (!hasApiKey) {
      onOpenSettings();
      return;
    }
    onSelectLevel(level);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 py-16">
      {/* Banner if no API key is saved */}
      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10 w-full"
        >
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-destructive/40 bg-gradient-to-br from-destructive/15 via-destructive/8 to-transparent p-5 text-center sm:flex-row sm:text-start backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/20 text-destructive border-2 border-destructive/30">
                <AlertCircle className="size-6" />
              </span>
              <div>
                <p className="font-bold text-foreground text-lg">الذكاء الاصطناعي جاهز للبدء</p>
                <p className="text-sm text-muted-foreground mt-1">
                  توليد الأسئلة مدعوم تلقائياً عبر OpenRouter بنماذج مجانية
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => {
                sound.unlock();
                onOpenSettings();
              }}
              className="shrink-0 font-bold shadow-lg"
            >
              <KeyRound className="me-2 size-5" />
              فتح الإعدادات
            </Button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <header className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6 inline-flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-quiz-primary/20 to-quiz-primary/5 border-2 border-quiz-primary/30 shadow-lg shadow-quiz-primary/10"
        >
          <Brain className="size-10 text-quiz-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
        >
          تحدّي المعرفة
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          اختبر ثقافتك العامة في ثلاثة مستويات متدرجة
          <br />
          أسئلة متنوعة وصور وتحديات جديدة في كل جولة
        </motion.p>
      </header>

      {/* Level Selection Cards */}
      <div className="grid w-full gap-5 sm:grid-cols-3">
        {(Object.keys(LEVELS) as Level[]).map((level, idx) => {
          const meta = LEVELS[level];
          const Icon = ICONS[level];
          const tone = TONE[level];

          return (
            <motion.button
              key={level}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.28 + idx * 0.1,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleLevelClick(level)}
              className={`group relative overflow-hidden rounded-3xl border-2 bg-card p-7 text-center transition-all duration-250 cursor-pointer hover:shadow-xl ${tone.card}`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-250 ${tone.gradient}`} />

              {/* Content */}
              <div className="relative z-10">
                <span
                  className={`inline-flex size-16 items-center justify-center rounded-2xl transition-transform duration-250 group-hover:scale-110 ${tone.icon}`}
                >
                  <Icon className="size-8" />
                </span>

                <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold">{meta.label}</h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {meta.description}
                </p>

                <div className={`mt-5 inline-flex items-center gap-2 rounded-full bg-secondary/80 backdrop-blur-sm px-4 py-2 text-sm font-bold text-secondary-foreground border border-border/50 ${tone.shadow}`}>
                  <Trophy className="size-4" />
                  {best[level] > 0 ? `${best[level]} نقطة` : "ابدأ الآن"}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Settings Link */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        onClick={() => {
          sound.unlock();
          onOpenSettings();
        }}
        className="mt-10 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline cursor-pointer font-medium"
      >
        إعدادات الصوت والمحتوى
      </motion.button>
    </div>
  );
}
