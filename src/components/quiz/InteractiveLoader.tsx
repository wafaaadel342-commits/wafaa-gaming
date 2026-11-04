import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { sound } from "@/lib/sound";

interface MiniQuestion {
  question: string;
  options: string[];
  correct: number;
  fact: string;
}

const MINI_TRIVIA: MiniQuestion[] = [
  {
    question: "ما هي عاصمة سلطنة عمان؟",
    options: ["مسقط", "صلالة", "صحار"],
    correct: 0,
    fact: "مسقط هي إحدى أقدم مدن الشرق الأوسط وتشتهر بطابعها المعماري الأصيل.",
  },
  {
    question: "كم عدد كواكب المجموعة الشمسية؟",
    options: ["7 كواكب", "8 كواكب", "9 كواكب"],
    correct: 1,
    fact: "تم تصنيف بلوتو ككوكب قزم عام 2006 ليصبح عدد الكواكب 8 رسمياً.",
  },
  {
    question: "ما هو أطول نهر في العالم؟",
    options: ["نهر النيل", "نهر الأمازون", "نهر الميسيسيبي"],
    correct: 0,
    fact: "يبلغ طول نهر النيل حوالي 6,650 كيلومتراً ويمر عبر 11 دولة أفريقية.",
  },
  {
    question: "ما هو أكبر محيط على وجه الأرض؟",
    options: ["المحيط الأطلسي", "المحيط الهادئ", "المحيط الهندي"],
    correct: 1,
    fact: "المحيط الهادئ يغطي أكثر من 30% من مساحة سطح الكرة الأرضية بأكملها.",
  },
  {
    question: "من هو مخترع المصباح الكهربائي؟",
    options: ["توماس إديسون", "نيكولا تسلا", "ألكسندر بيل"],
    correct: 0,
    fact: "سجل توماس إديسون أكثر من 1000 براءة اختراع خلال مسيرته العلمية.",
  },
  {
    question: "ما هي أسرع الكائنات الحية على اليابسة؟",
    options: ["الفهد الصياد", "الغزال", "الحصان"],
    correct: 0,
    fact: "يمكن للفهد الوصول إلى سرعة 120 كم/ساعة في غضون ثوانٍ معدودة.",
  },
];

const LOADING_TIPS = [
  "💡 التحميل التدريجي مفعّل: يمكنك البدء فور جاهزية أول سؤالين!",
  "⏱️ لديك 20 ثانية للإجابة على كل سؤال بعد ظهوره مباشرة.",
  "🎯 يتم تجهيز بقية الأسئلة بالخلفية لضمان لعب مستمر بلا توقف.",
  "🧠 كل سؤال فرصة رائعة لاكتساب معلومة ثقافية جديدة.",
  "✨ ركز جيداً، الإجابة الأسرع والأدق تمنحك الصدارة في الترتيب!",
];

interface Props {
  message?: string;
  progressText?: string;
  onSkip?: () => void;
}

export function InteractiveLoader({
  message = "جاري تجهيز الأسئلة وبدء التحدي...",
  progressText = "يتم توليد أول دفعة لتبدأ اللعب فوراً...",
}: Props) {
  const [tipIndex, setTipIndex] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredTrivia, setAnsweredTrivia] = useState(false);

  // Rotate tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const currentTrivia = MINI_TRIVIA[triviaIndex % MINI_TRIVIA.length]!;

  const handleTriviaAnswer = (idx: number) => {
    if (answeredTrivia) return;
    setSelectedAnswer(idx);
    setAnsweredTrivia(true);
    sound.unlock();
    if (idx === currentTrivia.correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const nextTrivia = () => {
    setSelectedAnswer(null);
    setAnsweredTrivia(false);
    setTriviaIndex((prev) => (prev + 1) % MINI_TRIVIA.length);
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center mb-6 space-y-3"
      >
        <div className="relative">
          <motion.img
            src="/logogame.png"
            alt="العب وتعلم"
            className="size-20 sm:size-24 object-contain drop-shadow-xl"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg -z-10"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
            <span>العب وتعلم</span>
            <Sparkles className="size-5 text-amber-400" />
          </h2>
          <p className="text-sm font-semibold text-primary mt-1">{message}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{progressText}</p>
        </div>

        {/* Animated Progress Pulse */}
        <div className="w-48 h-1.5 rounded-full bg-secondary/80 overflow-hidden relative mt-1">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full w-24"
            animate={{
              x: ["-100%", "250%"],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Interactive Mini Game / Trivia Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full rounded-3xl glass border border-primary/20 p-5 sm:p-6 shadow-lg shadow-primary/5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Brain className="size-3.5" />
            </span>
            <span>لغز سريع أثناء الانتظار</span>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground">
            تسلية معرفية
          </span>
        </div>

        {/* Question Text */}
        <p className="text-base sm:text-lg font-bold text-center text-foreground py-1">
          {currentTrivia.question}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {currentTrivia.options.map((opt, idx) => {
            let stateClass = "border-border/60 hover:bg-secondary/60 hover:border-primary/40";
            if (answeredTrivia) {
              if (idx === currentTrivia.correct) {
                stateClass =
                  "border-easy bg-easy/15 text-easy font-bold shadow-sm shadow-easy/20";
              } else if (idx === selectedAnswer) {
                stateClass =
                  "border-destructive bg-destructive/15 text-destructive font-semibold";
              } else {
                stateClass = "opacity-50 border-border/40";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answeredTrivia}
                onClick={() => handleTriviaAnswer(idx)}
                className={`py-2.5 px-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Fact & Next Question Button */}
        <AnimatePresence>
          {answeredTrivia && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 space-y-2 border-t border-border/40"
            >
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-xl">
                {selectedAnswer === currentTrivia.correct ? (
                  <CheckCircle2 className="size-4 text-easy shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-foreground block font-bold mb-0.5">
                    {selectedAnswer === currentTrivia.correct ? "إجابة ممتازة! 🎉" : "معلومة إضافية:"}
                  </strong>
                  <span>{currentTrivia.fact}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextTrivia}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>لغز آخر ↻</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Rotating Educational Tip */}
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="mt-5 text-center px-4"
      >
        <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
          {LOADING_TIPS[tipIndex]}
        </p>
      </motion.div>
    </div>
  );
}
