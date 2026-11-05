import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, Lightbulb, Sparkles, XCircle } from "lucide-react";
import { shuffleOptionsWithMapping } from "@/lib/quiz";
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

function shuffleMiniQuestion(q: MiniQuestion): MiniQuestion {
  const { options, correctIndex } = shuffleOptionsWithMapping(q.options, q.correct);
  return { ...q, options, correct: correctIndex };
}

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
  // Shuffle once per loader mount so positions are random per session but
  // remain stable across re-renders while a question is on screen.
  const [miniTrivia] = useState<MiniQuestion[]>(() => MINI_TRIVIA.map(shuffleMiniQuestion));

  // Rotate tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const currentTrivia = miniTrivia[triviaIndex % miniTrivia.length]!;

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
    setTriviaIndex((prev) => (prev + 1) % miniTrivia.length);
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center text-center mb-8 space-y-4"
      >
        {/* Loading Icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="size-20 rounded-3xl bg-gradient-to-br from-primary/20 to-quiz-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/15"
          >
            <Brain className="size-10 text-primary" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl"
          />
        </div>

        {/* Main Message */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          {message}
        </h2>

        {/* Progress Text */}
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {progressText}
        </p>
      </motion.div>

      {/* Rotating Tips */}
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="mb-8 w-full rounded-2xl border-2 border-accent/30 bg-accent/10 backdrop-blur-sm p-5 text-center"
      >
        <p className="text-sm font-medium leading-relaxed text-accent-foreground">
          {LOADING_TIPS[tipIndex]}
        </p>
      </motion.div>

      {/* Mini Trivia Challenge */}
      <div className="w-full rounded-3xl border-2 border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lightbulb className="size-5" />
          </span>
          <h3 className="text-base font-bold text-foreground">
            تحدي سريع أثناء الانتظار
          </h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={triviaIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base font-semibold leading-relaxed text-foreground mb-4">
              {currentTrivia.question}
            </p>

            <div className="space-y-2.5">
              {currentTrivia.options.map((opt, idx) => {
                const isCorrect = idx === currentTrivia.correct;
                const isSelected = idx === selectedAnswer;
                const showResult = answeredTrivia;

                return (
                  <motion.button
                    key={idx}
                    disabled={answeredTrivia}
                    onClick={() => handleTriviaAnswer(idx)}
                    whileHover={!answeredTrivia ? { x: 4 } : {}}
                    whileTap={!answeredTrivia ? { scale: 0.98 } : {}}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-start text-sm font-semibold transition-all disabled:cursor-default ${
                      showResult && isCorrect
                        ? "border-easy bg-easy text-easy-foreground shadow-md shadow-easy/20"
                        : showResult && isSelected && !isCorrect
                          ? "border-hard bg-hard text-hard-foreground shadow-md shadow-hard/20"
                          : answeredTrivia
                            ? "border-border/50 bg-card/50 opacity-50"
                            : "border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{opt}</span>
                      {showResult && isCorrect && <CheckCircle2 className="size-5 shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="size-5 shrink-0" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {answeredTrivia && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-5"
              >
                <div className="rounded-xl border-2 border-primary/25 bg-primary/8 p-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
                    <p className="text-sm leading-relaxed text-foreground">
                      {currentTrivia.fact}
                    </p>
                  </div>
                </div>

                <button
                  onClick={nextTrivia}
                  className="mt-4 w-full rounded-xl border-2 border-primary bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-md cursor-pointer"
                >
                  سؤال آخر
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
