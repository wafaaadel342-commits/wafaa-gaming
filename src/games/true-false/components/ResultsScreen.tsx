import { useEffect, type CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Flame,
  Home,
  RotateCcw,
  ShieldCheck,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { DIFFICULTY_LABELS } from "../constants";
import type { BestScores } from "../lib/storage";
import type { TrueFalseResult } from "../types";
import { styles } from "../styles";

interface ResultsScreenProps {
  result: TrueFalseResult;
  best: BestScores;
  onReplay: () => void;
  onBack: () => void;
}

function resultMessage(accuracy: number): { title: string; message: string } {
  if (accuracy >= 90) {
    return {
      title: "أداء استثنائي!",
      message: "دقة عالية في تقييم الحقائق. أنت متمكن من المحتوى.",
    };
  }
  if (accuracy >= 70) {
    return {
      title: "ممتاز!",
      message: "معرفتك قوية، وبعض التفاصيل فقط تحتاج مراجعة سريعة.",
    };
  }
  if (accuracy >= 50) {
    return {
      title: "نتيجة جيدة",
      message: "أساس جيد، ومع كل جولة ستثبت معلومات جديدة.",
    };
  }
  return {
    title: "بداية جديدة",
    message: "كل إجابة خاطئة فرصة لتعلّم حقيقة جديدة. جرّب مرة أخرى!",
  };
}

export function ResultsScreen({ result, best, onReplay, onBack }: ResultsScreenProps) {
  const message = resultMessage(result.accuracy);
  const overallBest = Math.max(best.easy, best.medium, best.hard, best.mixed);
  const ringStyle = {
    "--score-angle": `${Math.max(0, Math.min(100, result.accuracy)) * 3.6}deg`,
  } as CSSProperties;

  useEffect(() => {
    if (result.accuracy >= 60) {
      sound.playFanfare();
    } else {
      sound.playTryAgain();
    }
  }, [result.accuracy]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={styles.resultsCard}
      >
        <div className={`${styles.heroGlow} -top-20 left-1/2 -translate-x-1/2`} style={{ background: "var(--tf-gold)" }} />

        <div className="relative">
          <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
            <Trophy className="size-8" />
          </div>

          <h1 className="mt-4 text-2xl font-black sm:text-3xl">نتيجتك النهائية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {DIFFICULTY_LABELS[result.setup.difficulty]} · {result.total} أسئلة ·{" "}
            {result.setup.timerSeconds} ثوانٍ للسؤال
          </p>

          <div className={`${styles.scoreRing} mt-7`} style={ringStyle}>
            <div className={styles.scoreRingInner}>
              <span className={styles.scorePercent}>{result.accuracy}%</span>
              <span className={styles.scorePercentLabel}>نسبة الدقة</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-black sm:text-2xl">{message.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message.message}</p>
          </div>

          <div className={`${styles.statGrid} mt-6 text-start`}>
            <div className={styles.statTile}>
              <Award className="size-4 text-amber-500" />
              <span className={styles.statTileValue}>{result.score}</span>
              <span className={styles.statTileLabel}>النقاط</span>
            </div>
            <div className={styles.statTile}>
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span className={styles.statTileValue}>{result.correctCount}</span>
              <span className={styles.statTileLabel}>إجابات صحيحة</span>
            </div>
            <div className={styles.statTile}>
              <XCircle className="size-4 text-rose-500" />
              <span className={styles.statTileValue}>{result.incorrectCount}</span>
              <span className={styles.statTileLabel}>إجابات خاطئة</span>
            </div>
            <div className={styles.statTile}>
              <Flame className="size-4 text-orange-500" />
              <span className={styles.statTileValue}>{result.bestStreak}</span>
              <span className={styles.statTileLabel}>أفضل سلسلة</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 font-bold">
              <Target className="size-3.5 text-primary" />
              أفضل نتيجة سابقة: {overallBest > 0 ? `${overallBest} نقطة` : "أول جولة"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" />
              أسئلة موثقة بمصادر
            </span>
          </div>

          <div className={`${styles.resultActions} mt-8`}>
            <button
              type="button"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                onReplay();
              }}
              className={styles.primaryAction}
            >
              <RotateCcw className="size-4" />
              العب مرة أخرى
            </button>
            <button
              type="button"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                onBack();
              }}
              className={styles.secondaryAction}
            >
              <Home className="size-4" />
              العودة إلى الألعاب
              <ArrowLeft className="size-4" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
