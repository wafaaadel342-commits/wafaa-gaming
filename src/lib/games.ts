import type { LucideIcon } from "lucide-react";
import { Brain, SpellCheck, Quote, HelpCircle, Layers, CheckCircle2 } from "lucide-react";

/** Reads the best score for a game from localStorage. Handles both simple number and level-based objects. */
export function getGameBestScore(storageKey?: string): number {
  if (!storageKey || typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "number") return parsed;
    if (typeof parsed === "object" && parsed !== null) {
      // For level-based best scores (e.g., { easy: 100, medium: 200, hard: 300 })
      const values = Object.values(parsed).filter((v) => typeof v === "number") as number[];
      if (values.length > 0) return Math.max(...values);
    }
    return 0;
  } catch {
    return 0;
  }
}

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  icon: LucideIcon;
  badge?: string;
  gradient: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  route: string;
  status: "ready" | "soon";
  storageBestKey?: string;
  features?: string[];
}

export const GAMES_REGISTRY: GameDefinition[] = [
  {
    id: "quiz",
    title: "تحدي المعرفة",
    description:
      "اختبر معلوماتك العامة، عواصم العالم، أعلام الدول، والشخصيات والمعالم التاريخية عبر أسئلة ذكية متجددة.",
    category: "ثقافة عامة ومعلومات",
    image: "/knowledge-challenge.webp",
    icon: Brain,
    badge: "مكتمل",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    accentText: "text-blue-600 dark:text-blue-400",
    accentBorder: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    route: "/quiz",
    status: "ready",
    storageBestKey: "tahaddi-best",
    features: ["توليد ذكي للأسئلة", "٣ مستويات صعوبة", "مؤقت تفاعلي"],
  },
  {
    id: "words",
    title: "ركب الكلمة والجملة",
    description:
      "رتّب الحروف المبعثرة واجمع الكلمات والجمل العربية بالاعتماد على تلميحات دقيقة وتحدي الزمن.",
    category: "لغة ومفردات عربية",
    image: "/word-builder.webp",
    icon: SpellCheck,
    badge: "جديد",
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
    accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBorder: "hover:border-amber-500/50 hover:shadow-amber-500/50",
    route: "/words",
    status: "ready",
    storageBestKey: "rakeb-best",
    features: ["تلميحات لغوية", "سحب وإسقاط سلس", "تحدي السرعة"],
  },
  {
    id: "proverbs",
    title: "أكمل المثل",
    description:
      "أكمل الأمثال والحكم الشعبية والعربية الشهيرة واختبر سعة اطلاعك على الموروث البلاغي الأصيل.",
    category: "تراث وأمثال",
    image: "/games/proverbs.jpg",
    icon: Quote,
    gradient: "from-amber-700/20 via-yellow-600/10 to-transparent",
    accentBg: "bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/30",
    accentText: "text-amber-700 dark:text-amber-400",
    accentBorder: "hover:border-amber-600/50",
    route: "/proverbs",
    status: "ready",
    storageBestKey: "proverbs-best",
    features: ["أمثال تراثية", "خيارات متعددة", "شرح معاني الأمثال", "مصدر كل مثل"],
  },
  {
    id: "true-or-false",
    title: "صح أم خطأ",
    description:
      "جولات سريعة ومثيرة لتقييم صحة المعلومات والحقائق العلمية والتاريخية تحت ضغط الوقت.",
    category: "سرعة بديهة وتقييم",
    image: "/games/true-or-false.jpg",
    icon: CheckCircle2,
    badge: "جديد",
    gradient: "from-rose-600/20 via-emerald-600/10 to-transparent",
    accentBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    accentText: "text-rose-600 dark:text-rose-400",
    accentBorder: "hover:border-rose-500/50",
    route: "/true-or-false",
    status: "ready",
    storageBestKey: "true-false-best",
    features: ["أسئلة موثقة", "مؤقت سريع", "شرح ومصدر لكل إجابة", "8 فئات"],
  },
  {
    id: "memory-cards",
    title: "ذاكرة الكروت",
    description:
      "اقلب الكروت وطابق الرموز والأشكال المتطابقة، أو طابق أسئلة التراث المصري بإجاباتها الموثقة.",
    category: "قوة ملاحظة وتركيز",
    image: "/games/memory-cards.jpg",
    icon: Layers,
    badge: "جديد",
    gradient: "from-teal-600/20 via-emerald-600/10 to-transparent",
    accentBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    accentText: "text-teal-600 dark:text-teal-400",
    accentBorder: "hover:border-teal-500/50",
    route: "/memory-cards",
    status: "ready",
    storageBestKey: "memory-cards-best",
    features: [
      "مطابقة بصرية ومعرفية",
      "تراث وثقافة مصرية",
      "مستويات متدرجة",
      "مؤقت وإحصائيات",
    ],
  },
  {
    id: "guess-word",
    title: "خمن الكلمة",
    description:
      "خمّن الكلمة السرية في ست محاولات باستخدام إشارات لونية ذكية ترشدك إلى الحروف الصحيحة.",
    category: "ذكاء واستنتاج",
    image: "/games/guess-word.jpg",
    icon: HelpCircle,
    gradient: "from-teal-600/20 via-cyan-600/10 to-transparent",
    accentBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    accentText: "text-teal-600 dark:text-teal-400",
    accentBorder: "hover:border-teal-500/50",
    route: "/guess-word",
    status: "ready",
    storageBestKey: "word-guessing-best",
    features: ["تحليل لوني", "كلمات يومية", "إحصائيات دقيقة", "تحدي يومي"],
  },
];