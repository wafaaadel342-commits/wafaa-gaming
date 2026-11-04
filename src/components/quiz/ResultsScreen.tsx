import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  CheckCircle2,
  Home,
  RotateCcw,
  Star,
  Trophy,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatArabicOption, LEVELS, type Level, type Missed } from "@/lib/quiz";
import { sound } from "@/lib/sound";

interface Props {
  level: Level;
  score: number;
  missed: Missed[];
  totalQuestions: number;
  onReplay: () => void;
  onHome: () => void;
}

function getResultData(pct: number): {
  message: string;
  stars: number;
  gradient: string;
  icon: typeof Trophy;
} {
  if (pct >= 90) {
    return {
      message: "أداء مذهل! أنت بطل المعرفة الحقيقي",
      stars: 3,
      gradient: "from-achievement/30 via-achievement/15 to-transparent",
      icon: Trophy,
    };
  }
  if (pct >= 70) {
    return {
      message: "ممتاز! معرفتك واسعة ومتميزة",
      stars: 2,
      gradient: "from-easy/25 via-easy/10 to-transparent",
      icon: Star,
    };
  }
  if (pct >= 60) {
    return {
      message: "جيد جداً! تجاوزت التحدي بنجاح",
      stars: 1,
      gradient: "from-primary/20 via-primary/8 to-transparent",
      icon: Star,
    };
  }
  if (pct >= 40) {
    return {
      message: "محاولة جيدة! استمر في التعلم",
      stars: 0,
      gradient: "from-medium/20 via-medium/8 to-transparent",
      icon: Trophy,
    };
  }
  return {
    message: "لا بأس! المعرفة رحلة مستمرة",
    stars: 0,
    gradient: "from-muted/30 via-muted/15 to-transparent",
    icon: Trophy,
  };
}

export function ResultsScreen({ level, score, missed, totalQuestions, onReplay, onHome }: Props) {
  const max = LEVELS[level].points * (totalQuestions || 10);
  const pct = Math.round((score / max) * 100);
  const resultData = getResultData(pct);

  useEffect(() => {
    // Play sound based on result percentage
    if (pct >= 60) {
      sound.playFanfare();
    } else {
      sound.playTryAgain();
    }
  }, [pct]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      {/* Main Results Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 sm:p-10 text-center shadow-xl"
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${resultData.gradient}`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.15
            }}
            className="mx-auto inline-flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-achievement/30 to-achievement/10 border-2 border-achievement/40 shadow-lg shadow-achievement/20"
          >
            <Trophy className="size-12 text-achievement" />
          </motion.div>

          {/* Score Percentage */}
          <motion.h1
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="mt-6 text-6xl sm:text-7xl font-extrabold tracking-tight"
          >
            {pct}%
          </motion.h1>

          {/* Stars */}
          {resultData.stars > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              {[...Array(resultData.stars)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.45 + i * 0.1,
                    type: "spring",
                    stiffness: 280
                  }}
                >
                  <Star className="size-8 text-achievement fill-achievement" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Score Details */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-5 text-lg font-semibold text-muted-foreground"
          >
            أحرزت <span className="font-bold text-foreground">{score}</span> من {max} نقطة
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            مستوى {LEVELS[level].label} · {totalQuestions} أسئلة
          </motion.p>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.35 }}
            className="mt-4 text-base sm:text-lg leading-relaxed text-foreground font-semibold"
          >
            {resultData.message}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="font-bold text-base shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                onReplay();
              }}
            >
              <RotateCcw className="me-2 size-5" />
              العب مرة أخرى
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-bold text-base border-2"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                onHome();
              }}
            >
              <Home className="me-2 size-5" />
              الرئيسية
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Missed Questions Review */}
      {missed.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="size-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <BookOpenCheck className="size-5 text-primary" />
            </span>
            <h2 className="text-lg font-bold">
              راجع ما فاتك
              <span className="text-muted-foreground font-normal mr-2">({missed.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {missed.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.7 + i * 0.06,
                  duration: 0.3
                }}
                className="rounded-2xl border-2 border-border bg-card p-5 text-start"
              >
                {/* Category Badge */}
                <span className="inline-block rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
                  {m.category}
                </span>

                {/* Question */}
                <p className="font-bold leading-relaxed text-foreground mb-4">
                  {i + 1}. {m.question}
                </p>

                {/* Correct Answer */}
                <div className="flex items-start gap-3 text-sm text-easy font-semibold bg-easy/10 rounded-xl p-3 border border-easy/20">
                  <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground font-normal">الإجابة الصحيحة:</span>
                    <span className="block mt-0.5 text-easy">{formatArabicOption(m.correct)}</span>
                  </div>
                </div>

                {/* Wrong Answer */}
                {m.chosen && (
                  <div className="mt-3 flex items-start gap-3 text-sm text-hard bg-hard/10 rounded-xl p-3 border border-hard/20">
                    <XCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-normal">إجابتك:</span>
                      <span className="block mt-0.5 text-hard font-medium">{formatArabicOption(m.chosen)}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
