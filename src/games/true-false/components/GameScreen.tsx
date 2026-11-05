import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  Flame,
  Lightbulb,
  ShieldCheck,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { sound } from "@/lib/sound";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  FEEDBACK_AUTO_ADVANCE_MS,
} from "../constants";
import { useTrueFalseGame } from "../hooks/useTrueFalseGame";
import type { TrueFalseQuestion, TrueFalseResult, TrueFalseSetup } from "../types";
import { styles } from "../styles";

interface GameScreenProps {
  questions: TrueFalseQuestion[];
  setup: TrueFalseSetup;
  onFinish: (result: TrueFalseResult) => void;
}

function TimerRing({
  ratio,
  secondsLeft,
  urgent,
}: {
  ratio: number;
  secondsLeft: number;
  urgent: boolean;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const color = urgent ? "var(--tf-false)" : ratio < 0.55 ? "var(--tf-gold)" : "var(--tf-true)";

  return (
    <div
      className={`${styles.timerShell} ${urgent ? styles.timerUrgent : ""}`}
      role="timer"
      aria-label={`${secondsLeft} ثانية متبقية`}
    >
      <svg className={styles.timerSvg} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.timerTrack} cx="60" cy="60" r={radius} />
        <circle
          className={styles.timerProgress}
          cx="60"
          cy="60"
          r={radius}
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - ratio),
          }}
        />
      </svg>
      <div className={styles.timerText}>
        <span className={styles.timerSeconds}>{secondsLeft}</span>
        <span className={styles.timerUnit}>ثانية</span>
      </div>
    </div>
  );
}

export function GameScreen({ questions, setup, onFinish }: GameScreenProps) {
  const { state, currentQuestion, lastAnswer, answer, next, timeLeftMs } = useTrueFalseGame({
    questions,
    setup,
    onFinish,
  });

  const previousPhaseRef = useRef(state.phase);
  const lastTickSecondRef = useRef<number | null>(null);

  // Feedback sounds are triggered once per answered question.
  useEffect(() => {
    const previous = previousPhaseRef.current;
    previousPhaseRef.current = state.phase;
    if (state.phase !== "feedback" || previous !== "playing") return;

    const record = state.answers[state.answers.length - 1];
    if (!record) return;

    if (record.timedOut) {
      sound.playTimeout();
      return;
    }
    if (record.correct) {
      sound.playCorrect();
      if (record.streakAfter >= 3) sound.playStreakChime();
      return;
    }
    sound.playWrong();
  }, [state.phase, state.answers]);

  // Gentle countdown ticks during the final five seconds.
  useEffect(() => {
    lastTickSecondRef.current = null;
  }, [state.index]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const second = Math.ceil(timeLeftMs / 1000);
    if (second > 0 && second <= 5 && second !== lastTickSecondRef.current) {
      lastTickSecondRef.current = second;
      sound.playTick();
    }
  }, [timeLeftMs, state.phase]);

  // Gentle auto-advance; the player can skip it immediately.
  useEffect(() => {
    if (state.phase !== "feedback") return;
    const timer = setTimeout(next, FEEDBACK_AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.index, next]);

  // Keyboard play: right = true, left = false, Enter/Space = next.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (state.phase === "playing") {
        if (event.key === "ArrowRight" || event.key === "1") {
          event.preventDefault();
          answer(true);
        } else if (event.key === "ArrowLeft" || event.key === "2") {
          event.preventDefault();
          answer(false);
        }
        return;
      }
      if (state.phase === "feedback" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer, next, state.phase]);

  if (!currentQuestion) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingCard}>
          <span className={styles.spinner} />
          <p className="text-sm font-bold">لا توجد أسئلة متاحة الآن</p>
          <p className="text-xs text-muted-foreground">أعد المحاولة بعد لحظات.</p>
        </div>
      </div>
    );
  }

  const ratio = Math.max(0, Math.min(1, timeLeftMs / Math.max(1, state.timerMs)));
  const secondsLeft = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const urgent = state.phase === "playing" && ratio <= 0.3;
  const total = state.questions.length;
  const progress = Math.min(100, ((state.index + 1) / Math.max(1, total)) * 100);
  const isLastQuestion = state.index >= total - 1;
  const isFeedback = state.phase === "feedback" && lastAnswer !== null && lastAnswer !== undefined;
  const correctAnswerLabel = lastAnswer?.question.answer ? "صح" : "خطأ";

  const feedbackClass = !lastAnswer
    ? ""
    : lastAnswer.timedOut
      ? styles.feedbackTimeout
      : lastAnswer.correct
        ? styles.feedbackCorrect
        : styles.feedbackWrong;

  const feedbackIconClass = !lastAnswer
    ? ""
    : lastAnswer.timedOut
      ? styles.feedbackIconTimeout
      : lastAnswer.correct
        ? styles.feedbackIconCorrect
        : styles.feedbackIconWrong;

  const feedbackTitle = !lastAnswer
    ? ""
    : lastAnswer.timedOut
      ? "انتهى الوقت"
      : lastAnswer.correct
        ? "إجابة صحيحة"
        : "إجابة خاطئة";

  const optionClass = (value: boolean): string => {
    if (!isFeedback || !lastAnswer) return "";
    const isCorrectOption = lastAnswer.question.answer === value;
    const isSelectedOption = state.selected === value;
    if (isCorrectOption) return styles.answerCorrect;
    if (isSelectedOption) return styles.answerWrong;
    return styles.answerDimmed;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
      <div className={styles.gameTopBar}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={styles.metric}>
            <Trophy className="size-4 text-amber-500" />
            {state.score}
          </span>
          <span className={`${styles.metric} ${styles.metricStrong}`}>
            <Flame className="size-4" />
            {state.streak}
          </span>
          <span className={styles.metric}>
            <CheckCircle2 className="size-4 text-emerald-500" />
            {state.correctCount}
          </span>
          <span className={styles.metric}>
            <XCircle className="size-4 text-rose-500" />
            {state.incorrectCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-end">
            <p className="text-xs font-black">
              السؤال {state.index + 1} من {total}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {CATEGORY_LABELS[currentQuestion.category]} · {DIFFICULTY_LABELS[currentQuestion.difficulty]}
            </p>
          </div>
          <TimerRing ratio={ratio} secondsLeft={secondsLeft} urgent={urgent} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.statementCard}>
              <span className={styles.statementMark} aria-hidden="true">
                ؟
              </span>

              <div className="relative flex flex-wrap items-center gap-1.5">
                <span className={styles.badge}>{CATEGORY_LABELS[currentQuestion.category]}</span>
                <span className={styles.badge}>{DIFFICULTY_LABELS[currentQuestion.difficulty]}</span>
                <span className={`${styles.badge} ${styles.badgeTrue}`}>
                  <ShieldCheck className="size-3" />
                  مُوثّق
                </span>
              </div>

              <p className={styles.statementText}>{currentQuestion.statement}</p>

              <p className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Timer className="size-3.5" />
                اختر إجابتك قبل انتهاء المؤقت
              </p>
            </div>

            <div className={`${styles.answerGrid} mt-4`}>
              <button
                type="button"
                disabled={state.phase !== "playing"}
                onClick={() => answer(true)}
                aria-label="الإجابة صح"
                aria-pressed={state.selected === true}
                className={`${styles.answerButton} ${styles.trueButton} ${optionClass(true)}`}
              >
                <CheckCircle2 className="size-7 shrink-0" />
                <span>صح</span>
                {isFeedback && lastAnswer?.question.answer === true && (
                  <CheckCircle2 className="absolute end-2.5 top-2.5 size-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                disabled={state.phase !== "playing"}
                onClick={() => answer(false)}
                aria-label="الإجابة خطأ"
                aria-pressed={state.selected === false}
                className={`${styles.answerButton} ${styles.falseButton} ${optionClass(false)}`}
              >
                <XCircle className="size-7 shrink-0" />
                <span>خطأ</span>
                {isFeedback && lastAnswer?.question.answer === false && (
                  <CheckCircle2 className="absolute end-2.5 top-2.5 size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span>اختصارات:</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">1</kbd>
              <span>صح</span>
              <span className="text-border">·</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">2</kbd>
              <span>خطأ</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFeedback && lastAnswer && (
          <motion.section
            key={`feedback-${state.index}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
            className="mt-5"
          >
            <div className={`${styles.feedbackPanel} ${feedbackClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`${styles.feedbackIcon} ${feedbackIconClass}`}>
                    {lastAnswer.timedOut ? (
                      <Timer className="size-5" />
                    ) : lastAnswer.correct ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Lightbulb className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={styles.feedbackTitle}>{feedbackTitle}</p>
                    <p className={styles.feedbackSubtitle}>
                      الإجابة الصحيحة: <strong>{correctAnswerLabel}</strong>
                      {!lastAnswer.correct && state.selected !== null
                        ? ` · إجابتك: ${state.selected ? "صح" : "خطأ"}`
                        : ""}
                    </p>
                  </div>
                </div>

                {lastAnswer.correct && (
                  <span className={styles.pointsBadge}>
                    <Zap className="size-3.5" />+{lastAnswer.points}
                  </span>
                )}
              </div>

              <p className={styles.explanation}>{lastAnswer.question.explanation}</p>

              {!lastAnswer.question.answer && lastAnswer.question.correction && (
                <div className={styles.correctionBox}>
                  <strong>التصحيح: </strong>
                  {lastAnswer.question.correction}
                </div>
              )}

              <div className={styles.sourceRow}>
                <span>المصدر:</span>
                <a
                  href={lastAnswer.question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  {lastAnswer.question.sourceName}
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="mt-3">
                <button type="button" onClick={next} className={styles.nextButton}>
                  {isLastQuestion ? "عرض النتيجة" : "السؤال التالي"}
                  <ChevronLeft className="size-4" />
                </button>
                <div className={styles.autoAdvanceTrack}>
                  <div
                    key={`advance-${state.index}`}
                    className={styles.autoAdvanceBar}
                    style={{ animationDuration: `${FEEDBACK_AUTO_ADVANCE_MS}ms` }}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
