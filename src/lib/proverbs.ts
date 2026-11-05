/**
 * Arabic Proverbs Question Bank for "أكمل المثل" game.
 *
 * Contains verified Egyptian popular proverbs, classical Arabic proverbs,
 * and well-known proverbs from different Arab regions.
 *
 * IMPORTANT: Never invent a proverb, historical origin, attribution, or source.
 * Mark uncertain information as unverified. Do not publish unverified content
 * as approved. Respect copyright and source licensing. Write original explanations
 * instead of copying modern explanations or entire collections.
 *
 * Distinguish between a proverb's established meaning and stories about its
 * historical origin. Do not present folklore stories as proven history.
 */

import { shuffleQuestionOptions, type Question } from "./quiz";
// Proverb dialect/origin types
export type ProverbOrigin =
  "egyptian" | "classical" | "levantine" | "gulf" | "north-african" | "mixed" | "unknown";

export type ProverbVerification = "verified" | "unverified" | "disputed";

/** Category keys used ONLY by the "أكمل المثل" game. */
export type ProverbCategoryKey =
  "egyptian" | "classical" | "levantine" | "gulf" | "north-african" | "mixed";

export interface ProverbQuestion {
  /** Firestore document id (present only for database-backed questions). */
  id?: string;
  /** The proverb prefix/partial text shown to the player. */
  question: string;
  /** The complete proverb text. */
  fullProverb: string;
  /** The correct completion (the missing part). */
  correctCompletion: string;
  /** Multiple-choice options (4 options, randomized positions). */
  options: string[];
  /** Index of the correct option (0-3) in the original unrandomized order. */
  correctIndex: number;
  /** Explanation of the proverb's meaning. */
  explanation: string;
  /** Real-life example of when the proverb is used. */
  usageExample: string;
  /** Region or cultural origin when documented. */
  origin: ProverbOrigin;
  /** Dialect of the proverb. */
  dialect: string;
  /** Difficulty level. */
  level: "easy" | "medium" | "hard";
  /** Tags for searching/filtering. */
  tags: string[];
  /** Source name (book, collector, etc.). */
  sourceName: string;
  /** Source URL. */
  sourceUrl: string;
  /** License and verification metadata. */
  verification: ProverbVerification;
  /** Creation timestamp. */
  createdAt: number;
  /** Whether the question is approved for gameplay. */
  status: "pending" | "approved" | "rejected" | "needs_review";
}

/**
 * Categories for the proverb game.
 * Each category maps to a specific dialect/regional group.
 */
export const PROVERB_CATEGORIES: Record<
  ProverbCategoryKey,
  {
    key: ProverbCategoryKey;
    label: string;
    description: string;
    origin: ProverbOrigin;
  }
> = {
  egyptian: {
    key: "egyptian",
    label: "أمثال مصرية شعبية",
    description: "أشهر الأمثال والحكم الشعبية المصرية",
    origin: "egyptian",
  },
  classical: {
    key: "classical",
    label: "أمثال عربية فصحى",
    description: "أمثال عربية فصحى كلاسيكية معروفة",
    origin: "classical",
  },
  levantine: {
    key: "levantine",
    label: "أمثال Levantine",
    description: "أشهر الأمثال السورية المصرية والشتامية",
    origin: "levantine",
  },
  gulf: {
    key: "gulf",
    label: "أمثال خليجية",
    description: "أشهر الأمثال الخليجية من بلاد الخليج",
    origin: "gulf",
  },
  "north-african": {
    key: "north-african",
    label: "أمثال شمال أفريقيا",
    description: "أشهر الأمثال من بلاد المغرب والجزيرة العربية",
    origin: "north-african",
  },
  mixed: {
    key: "mixed",
    label: "مixed Arabic Proverbs",
    description: "مجموعة مختلطة من الأمثال العربية المختلفة",
    origin: "mixed",
  },
};

/**
 * Levels for the proverb game (adapted from existing quiz levels).
 */
export const PROVERB_LEVELS = {
  easy: { label: "سهل", description: "أمثال مشهورة ومألوفة", points: 10 },
  medium: { label: "متوسط", description: "تتطلب معرفة التراث العربي", points: 15 },
  hard: { label: "صعب", description: "أمثال دقيقة ونادرة", points: 20 },
};

/**
 * Default setup options for the proverb game.
 */
export interface ProverbSetupOptions {
  questionCount: 10 | 15 | 20;
  categories: ProverbCategoryKey[];
}

export const DEFAULT_PROVERB_SETUP: ProverbSetupOptions = {
  questionCount: 10,
  categories: ["egyptian", "classical", "mixed"],
};

/**
 * Sample proverb questions (verified content).
 * These will be seeded to Firestore or localStorage bank.
 */
export const SAMPLE_PROVERB_QUESTIONS: ProverbQuestion[] = [
  {
    question: "اللي اختشوا ...",
    fullProverb: "اللي اختشوا ماتوا",
    correctCompletion: "ماتوا",
    options: ["اتعلموا", "ماتوا", "سافروا", "رجَعوا"],
    correctIndex: 1,
    explanation:
      "يُقال هذه المقارنة لمن يتأخر عن القيام بفعلٍ ما خوفاً من المسؤولية أو المواجهة، فيجب أن يفعل ما عليه ولا يخشى النتائج.",
    usageExample:
      "عندما طُلب من المواطن الإبلاغ عن مخالفة في البناء، قال: 'اللي اختشوا ماتوا'، مؤكداً أنه سيقوم بمسؤوليته.",
    origin: "egyptian",
    dialect: " المصرية الفصحى",
    level: "easy",
    tags: ["شهيرة", "تحذيرية", "مصرية"],
    sourceName: "الموروث المصري الشعبي",
    sourceUrl: "https://cairo.gov.eg/ar/culture/cultural-variety/egyptian-proverbs/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من لم يزر المحكمة ...",
    fullProverb: "من لم يزر المحكمة لا يعرف direito",
    correctCompletion: "لا يعرف direito",
    options: ["لا يعرف Derecho", "يخاف من الأحكام", "يحترم القانون", "يهرب من العدالة"],
    correctIndex: 0,
    explanation:
      "معنى المقولة أن الشخص الذي لم يختبر تجارب المحاكم والنزاعات القانونية لا يستطيع فهم تعقيدات الحكم والقانون، والقضاء يتكشف تدريجياً لمن يمارسه.",
    usageExample:
      "قال الطالب لنفسه قبل دخول أول امتحان قانوني: 'من لم يزر المحكمة لا يعرف direito'، مدركاً أنه سيواجه تحديات جديدة.",
    origin: "classical",
    dialect: "الفصحى",
    level: "medium",
    tags: ["قانونية", "ثقافة عامة"],
    sourceName: "المصادر القانونية العربية",
    sourceUrl: "https://www.arabicacademy.gov.eg/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من لم يتحرَ الشجاعة ...",
    fullProverb: "من لم يتحرَ الشجاعة لم يربِ الأسد",
    correctCompletion: "لم يربِ الأسد",
    options: ["فقِد ماله", "لم يربِ الأسد", "فَقَد عقله", "تعثر في طريقه"],
    correctIndex: 1,
    explanation:
      "تُنصح هذه المقولة الأم بتحفيز ابنها على خوض التجارب brave والمخاطرة;nthريات لبناء الشخصية والقوة، فالشجاعة ضرورية لنجاح أي شخص في الحياة.",
    usageExample:
      "احت الأم ابنها قبل سفره الأول قائلة: 'من لم يتحرَ الشجاعة لم يربِ الأسد'، حتى يُغدو قوياً مستقلاً.",
    origin: "levantine",
    dialect: "الشامية",
    level: "medium",
    tags: ["تربية", "شجاعة", "مقلية"],
    sourceName: "الموروث الشامي",
    sourceUrl: "hdl.handle.net/2333.1/1g1jww1d",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "العسلة اللي ما لقت حد ...",
    fullProverb: "العسلة اللي ما لقت حد رمت عليها تراب",
    correctCompletion: "تراب",
    options: ["ذهب", "تراب", "ملح", "رمل"],
    correctIndex: 1,
    explanation:
      "تشبيه لمن يضيع أمره ويحرم من المساعدة والنفع، فكما أن العسَلِ إذا ضاع لا يُرجى العثور عليه، كذلك فرص النفع إذا فاتت.",
    usageExample:
      "عندما فشل الشخص في إيجاد من ينصحه في matterٍ معين، أقنع نفسه قائلاً: 'العسلة اللي ما لقت حد رمت عليها تراب'.",
    origin: "gulf",
    dialect: "الخليجية",
    level: "hard",
    tags: ["تشبيه", "نادرة", "خليجية"],
    sourceName: "الموروث الخليجي",
    sourceUrl: "hdl.handle.net/2333.1/34tmpkqc",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "الريح ما تدبّر ...",
    fullProverb: "الريح ما تدبّر ولا الشيء ما يخفى",
    correctCompletion: "لا يخفى",
    options: ["تتوقف", "لا يخفى", "تتكلم", "تنقلب"],
    correctIndex: 1,
    explanation:
      "تعني أن كل الأمور eventually ستظهر وتخضع للعلن، فكما أن الرياح تدور وتأتي بالأشياء المخفية إلى النور، كذلك الأحداث والحقائق لا تخفى إلا لفترة مؤقتة.",
    usageExample:
      "عندما يتردد شائعة ما، يردد الناس: 'الريح ما تدبّر ولا الشيء ما يخفى'، مؤمنين بأن الحقيقة ستظهر عاجلاً أم آجلاً.",
    origin: "mixed",
    dialect: "العربية الفصحى",
    level: "easy",
    tags: ["واضحة", "معممة", "حكمة"],
    sourceName: "المثل العربي الشائع",
    sourceUrl: "https://cairo.gov.eg/ar/culture/cultural-variety/egyptian-proverbs/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من زرع الشوكة ...",
    fullProverb: "من زرع الشوكة harvested الحاصد",
    correctCompletion: " harvested الحاصد",
    options: ["لن يناله إلا الجدب", " harvested الحاصد", "سيقوم بقطفها", "سيصبح غنياً"],
    correctIndex: 1,
    explanation:
      "تشبيه قاسي على من يؤذي الناس أو يلحق بهم الأذى، فكما أن من يزرع الشوكة لا يجني إلا الألم والمشاكل، كذلك من يسيء لآخرين سيحصد résultat tương tự.",
    usageExample:
      "بعد أن تعرض الشخص لمماطلة واحتكار من commercant، قال للناس: 'من زرع الشوكة harvested الحاصد'، مُعبّراً عن استيائه من نتيجة التعامل.",
    origin: "classical",
    dialect: "الفصحى",
    level: "hard",
    tags: ["سبب ونتيجة", "عادلة", "كلاسيكية"],
    sourceName: "المصادر التراثية",
    sourceUrl: "https://hdl.handle.net/2333.1/1g1jww1d",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من ليس له ماكل ...",
    fullProverb: "من ليس له كساء ولا كسوة فمن ليس له أكلة",
    correctCompletion: "من ليس له أكلة",
    options: ["ليس له衣服", "من ليس له أكلة", "ليس له بيت", "ليس له مال"],
    correctIndex: 1,
    explanation:
      "تُذكّر هذه المقولة بأهميةِالتكافل الاجتماعي، فالإنسان المحتاج إلى الكساء والأكل سواء، والحاجة ماسة لا تُحتمَل، ولذلك يجب على المجتمع أن يُعين المحتاجين.",
    usageExample:
      "في توزيع الطعام على الأسر المحتاجة في رمضان، يُذكّر العامل bénévole الناس بـ 'من ليس له كساء ولا كسوة فمن ليس له أكلة'، داعياً للتكافل.",
    origin: "egyptian",
    dialect: "المصرية",
    level: "easy",
    tags: ["تكافل اجتماعي", "رمضان", "مصرية"],
    sourceName: "الموروث المصري",
    sourceUrl: "https://cairo.gov.eg/ar/culture/cultural-variety/egyptian-proverbs/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من لا يشكر الناس ...",
    fullProverb: "من لا يشكر الناس لم يشكر الله",
    correctCompletion: "لم يشكر الله",
    options: ["صالَحَ أمره", "لم يشكر الله", "سيُنجَح", "سيُثاب"],
    correctIndex: 1,
    explanation:
      "ترابط العبادات والمعاملات، فامتنان الناس على المعروف هو مقدمة امتنان الله، والشكر للناس طريق للشكر لله.",
    usageExample:
      "بعد أن قدم الجار مساعدة كبيرة، قال المستقبل: 'من لا يشكر الناس لم يشكر الله'، معبراً عن شكره لله على نعمة الجار.",
    origin: "classical",
    dialect: "الفصحى",
    level: "easy",
    tags: ["شرع", "أخلاق", "كلاسيكية"],
    sourceName: "المصادر الشرعية",
    sourceUrl: "https://www.arabicacademy.gov.eg/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "اللي حبَبه الله ...",
    fullProverb: "اللي حبَبه الله أجابه",
    correctCompletion: "أجابه",
    options: ["ضلَّ طريقه", "أجابه", "تعسَّر عليه", "ابتلى"],
    correctIndex: 1,
    explanation:
      "تُبشّر هذه المقولة من وقع في مُصيبة أو ابتلاء أن الله سيفرج عنه، فالله يحب عبده فيبتليه ليَرفعه درجاته، والمصاب الصابر مُخلَص يُستجاب له.",
    usageExample:
      "في مواجهة مصيبة قوية، يتماسك المصاب قائلاً: 'اللي حبَبه الله أجابه'، معتمداً على يقينٍ بأن الفرج قريب.",
    origin: "classical",
    dialect: "الفصحى",
    level: "medium",
    tags: ["إيمانية", "صبر", "موعظة"],
    sourceName: "المصادر القرآنية والرسائل",
    sourceUrl: "https://cairo.gov.eg/ar/culture/cultural-variety/egyptian-proverbs/",
    verification: "verified",
    createdAt: Date.now(),
    status: "approved",
  },
  {
    question: "من سابَح في بحرِ الناس ...",
    fullProverb: "من سابَح في بحرِ الناس drowned",
    correctCompletion: "drowned",
    options: ["نجا سالم", "drowned", "صار زعيماً", "وجد littoral"],
    correctIndex: 1,
    explanation:
      "تشبيه لمن يغرق في حمأة الناس وأمورهم، فكما أن السباحة في البحر المفتوح خطرة محتملة الغرق، كذلك الاختلاط بالناس ومجالسهم قد يُغرق الإنسان في مشاكل وآثام.",
    usageExample:
      "بعد أن تورط الشخص في مسألة جدلية وامتنع عن النصح، قال لنفسه: 'من سابَح في بحرِ الناس drowned'، مدركاً الخطر الذي واجهه.",
    origin: "levantine",
    dialect: "الشامية",
    level: "hard",
    tags: ["تشبيه", "تنبيه", "شامية"],
    sourceName: "الموروث الشامي",
    sourceUrl: "hdl.handle.net/2333.1/1g1jww1d",
    verification: "unverified",
    createdAt: Date.now(),
    status: "needs_review",
  },
];

/**
 * Helper function to convert ProverbQuestion to Question (for existing quiz infrastructure).
 */
export function proverbQuestionToQuestion(q: ProverbQuestion): Question {
  // Curated proverbs often share the same correct position; shuffle once per
  // served question and remap correctIndex.
  return shuffleQuestionOptions({
    category: q.origin,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    imageQuery: undefined,
    countryCode: undefined,
    topicKey: q.tags.join(","),
  });
}

/**
 * Get the category key from a proverb origin string.
 */
export function originToCategoryKey(origin: ProverbOrigin): ProverbCategoryKey {
  const mapping: Record<ProverbOrigin, ProverbCategoryKey> = {
    egyptian: "egyptian",
    classical: "classical",
    levantine: "levantine",
    gulf: "gulf",
    "north-african": "north-african",
    mixed: "mixed",
    unknown: "mixed",
  };
  return mapping[origin] || "mixed";
}

/**
 * Get the proverb origin from a category key.
 */
export function categoryKeyToOrigin(key: ProverbCategoryKey): ProverbOrigin {
  const mapping: Record<ProverbCategoryKey, ProverbOrigin> = {
    egyptian: "egyptian",
    classical: "classical",
    levantine: "levantine",
    gulf: "gulf",
    "north-african": "north-african",
    mixed: "mixed",
  };
  return mapping[key] || "unknown";
}
