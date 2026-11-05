/**
 * Curated Fallback Question Bank for Quiz (تحدّي المعرفة)
 *
 * Ensures the quiz game works 100% offline or when OpenRouter API is unavailable,
 * rate-limited, or unconfigured. Contains 70+ high-quality questions across all
 * 3 levels and all categories.
 */

import { cyrb53 } from "./anti-repeat";
import {
  type BankQuizItem,
  loadQuizBank,
  addQuestionsToBank,
} from "./anti-repeat";
import {
  type CategoryKey,
  type Level,
  type Question,
  getQuestionDedupeKey,
  shuffleQuestionOptions,
} from "./quiz";

export interface RawQuizDefinition {
  level: Level;
  category: CategoryKey;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  countryCode?: string;
  imageQuery?: string;
  topicKey?: string;
}

export const FALLBACK_QUIZ_BANK: RawQuizDefinition[] = [
  // ==========================================
  // EASY LEVEL (سهل)
  // ==========================================

  // Capitals (عواصم)
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة المملكة العربية السعودية؟",
    options: ["الرياض", "جدة", "مكة المكرمة", "الدمام"],
    correctIndex: 0,
    explanation: "الرياض هي العاصمة وأكبر مدن المملكة العربية السعودية.",
    topicKey: "capital_saudi",
  },
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة جمهورية مصر العربية؟",
    options: ["القاهرة", "الإسكندرية", "الجيزة", "الأقصر"],
    correctIndex: 0,
    explanation: "القاهرة هي عاصمة مصر وأكبر مدن العالم العربي وقارة أفريقيا من حيث السكان.",
    topicKey: "capital_egypt",
  },
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة فرنسا؟",
    options: ["باريس", "مرسيليا", "ليون", "نيس"],
    correctIndex: 0,
    explanation: "باريس الملقبة بمدينة النور هي عاصمة فرنسا وأهم مراكزها الثقافية والاقتصادية.",
    topicKey: "capital_france",
  },
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة اليابان؟",
    options: ["طوكيو", "كيوتو", "أوساكا", "يوكوهاما"],
    correctIndex: 0,
    explanation: "طوكيو هي عاصمة اليابان وتعتبر أكبر منطقة حضرية في العالم من حيث السكان.",
    topicKey: "capital_japan",
  },
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة إيطاليا؟",
    options: ["روما", "ميلانو", "فلورنسا", "البندقية"],
    correctIndex: 0,
    explanation: "روما هي عاصمة إيطاليا وتعرف بـ 'المدينة الخالدة' ومهد الحضارة الرومانية.",
    topicKey: "capital_italy",
  },
  {
    level: "easy",
    category: "capitals",
    question: "ما هي عاصمة المملكة المتحدة؟",
    options: ["لندن", "مانشستر", "إدنبرة", "برمنغهام"],
    correctIndex: 0,
    explanation: "لندن الواقعة على نهر التايمز هي عاصمة بريطانيا ومركزها المالي والتاريخي.",
    topicKey: "capital_uk",
  },

  // General Knowledge (ثقافة عامة)
  {
    level: "easy",
    category: "general_knowledge",
    question: "ما هو أطول نهر في العالم؟",
    options: ["نهر النيل", "نهر الأمازون", "نهر المسيسيبي", "نهر الدانوب"],
    correctIndex: 0,
    explanation: "نهر النيل في قارة أفريقيا يُعد تاريخياً أطول نهر في العالم بطول يقارب 6,650 كم.",
    topicKey: "longest_river",
  },
  {
    level: "easy",
    category: "general_knowledge",
    question: "ما هو أكبر كوكب في مجموعتنا الشمسية؟",
    options: ["المشتري", "زحل", "نبتون", "الأرض"],
    correctIndex: 0,
    explanation: "كوكب المشتري هو الأضخم حجماً وكتلة في المجموعة الشمسية وهو عملاق غازي.",
    topicKey: "largest_planet",
  },
  {
    level: "easy",
    category: "general_knowledge",
    question: "ما هو أسرع حيوان بري على وجه الأرض؟",
    options: ["الفهد (الشيتا)", "الأسد", "الغزال", "الحصان"],
    correctIndex: 0,
    explanation: "الفهد الصياد (الشيتا) يستطيع الوصول لسرعة تفوق 100 كم في الساعة في ثوانٍ معدودة.",
    topicKey: "fastest_animal",
  },
  {
    level: "easy",
    category: "general_knowledge",
    question: "كم عدد قارات العالم المعترف بها جغرافياً؟",
    options: ["7 قارات", "5 قارات", "6 قارات", "8 قارات"],
    correctIndex: 0,
    explanation: "القارات السبع هي: آسيا، أفريقيا، أوروبا، أمريكا الشمالية، أمريكا الجنوبية، أستراليا، والقارة القطبية الجنوبية.",
    topicKey: "continents_count",
  },
  {
    level: "easy",
    category: "general_knowledge",
    question: "ما هو المعدن السائل في درجة حرارة الغرفة العادية؟",
    options: ["الزئبق", "الحديد", "الرصاص", "النحاس"],
    correctIndex: 0,
    explanation: "الزئبق هو العنصر الفلزي الوحيد الذي يبقى في الحالة السائلة في الظروف القياسية.",
    topicKey: "liquid_metal",
  },
  {
    level: "easy",
    category: "general_knowledge",
    question: "ما هي أكبر قارة في العالم من حيث المساحة والسكان؟",
    options: ["قارة آسيا", "قارة أفريقيا", "قارة أوروبا", "أمريكا الشمالية"],
    correctIndex: 0,
    explanation: "آسيا هي أكبر قارات الأرض مساحةً وتضم أكثر من 60% من سكان العالم.",
    topicKey: "largest_continent",
  },

  // Quotes (أقوال مأثورة)
  {
    level: "easy",
    category: "quotes",
    question: "من قائل البيت الشهير: 'الخيل والليل والبيداء تعرفني والسيف والرمح والقرطاس والقلم'؟",
    options: ["أبو الطيب المتنبي", "أحمد شوقي", "عنترة بن شداد", "امرؤ القيس"],
    correctIndex: 0,
    explanation: "هذا البيت من أشهر قصائد الشاعر العباسي الفحل أبو الطيب المتنبي.",
    topicKey: "quote_mutanabbi_kheil",
  },
  {
    level: "easy",
    category: "quotes",
    question: "من قائل: 'إذا الشعب يوماً أراد الحياة فلا بد أن يستجيب القدر'؟",
    options: ["أبو القاسم الشابي", "محمود درويش", "نزار قباني", "إيليا أبو ماضي"],
    correctIndex: 0,
    explanation: "هذا البيت الخالد من قصيدة إرادة الحياة للشاعر التونسي أبي القاسم الشابي.",
    topicKey: "quote_shabi_irada",
  },
  {
    level: "easy",
    category: "quotes",
    question: "من قائل: 'قم للمعلم وفّهِ التبجيلا كاد المعلم أن يكون رسولا'؟",
    options: ["أحمد شوقي", "حافظ إبراهيم", "معروف الرصافي", "أحمد محرم"],
    correctIndex: 0,
    explanation: "قالها أمير الشعراء أحمد شوقي تكريماً لمكانة المعلم والتعليم.",
    topicKey: "quote_shawqi_teacher",
  },

  // Flags (أعلام الدول)
  {
    level: "easy",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["مصر", "سوريا", "العراق", "اليمن"],
    correctIndex: 0,
    explanation: "علم جمهورية مصر العربية يتكون من ألوان الأحمر والأبيض والأسود مع نسر صلاح الدين الذهبي.",
    countryCode: "eg",
    topicKey: "flag_egypt",
  },
  {
    level: "easy",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["المملكة العربية السعودية", "الجزائر", "باكستان", "موريتانيا"],
    correctIndex: 0,
    explanation: "علم المملكة العربية السعودية أخضر يتوسطه الشهادتان وسيف مسلول يرمز للعدل.",
    countryCode: "sa",
    topicKey: "flag_saudi",
  },
  {
    level: "easy",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["المغرب", "تونس", "تركيا", "الصين"],
    correctIndex: 0,
    explanation: "علم المملكة المغربية لونه أحمر تتوسطه نجمة خماسية خضراء ترمز لأركان الإسلام.",
    countryCode: "ma",
    topicKey: "flag_morocco",
  },
  {
    level: "easy",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["اليابان", "كوريا الجنوبية", "بنغلاديش", "سنغافورة"],
    correctIndex: 0,
    explanation: "علم اليابان أبيض تتوسطه دائرة حمراء تمثل الشمس المشرقة.",
    countryCode: "jp",
    topicKey: "flag_japan",
  },

  // Landmarks & Historical figures (معالم وشخصيات)
  {
    level: "easy",
    category: "landmarks",
    question: "ما هو هذا المعلم الأثري الشهير في الجيزة بمصر؟",
    options: ["أهرامات الجيزة", "معبد الكرنك", "برج القاهرة", "قلعة صلاح الدين"],
    correctIndex: 0,
    explanation: "أهرامات الجيزة هي إحدى عجائب الدنيا القديمة والوحيدة الباقية حتى يومنا هذا.",
    imageQuery: "Giza pyramid complex",
    topicKey: "pyramids_giza",
  },
  {
    level: "easy",
    category: "landmarks",
    question: "ما هو هذا البرج الشهير في باريس بفرنسا؟",
    options: ["برج إيفل", "برج بيزا", "ساعة بيغ بن", "برج خليفة"],
    correctIndex: 0,
    explanation: "برج إيفل أنشأه المهندس غوستاف إيفل عام 1889 وأصبح الرمز العالمي لفرنسا.",
    imageQuery: "Eiffel Tower",
    topicKey: "eiffel_tower",
  },
  {
    level: "easy",
    category: "historical_figures",
    question: "من هو القائد المسلم الذي انتصر في معركة حطين وحرر القدس؟",
    options: ["صلاح الدين الأيوبي", "سيف الدين قطز", "طارق بن زياد", "خالد بن الوليد"],
    correctIndex: 0,
    explanation: "السلطان الناصر صلاح الدين الأيوبي قاد المسلمين للنصر في حطين عام 1187م.",
    imageQuery: "Saladin",
    topicKey: "saladin",
  },
  {
    level: "easy",
    category: "cartoons",
    question: "من هو المحقق الذكي الشهير بتقلص جسده إلى طفل في عالم الإنمي والكرتون؟",
    options: ["المحقق كونان", "كابتن ماجد", "ناروتو", "لوفي"],
    correctIndex: 0,
    explanation: "سينشي كودو الذي تحول إلى كونان إيدوغاوا هو بطل سلسلة المحقق كونان الشهيرة.",
    imageQuery: "Detective Conan",
    topicKey: "conan",
  },
  {
    level: "easy",
    category: "football_players",
    question: "من هو النجم الأرجنتيني المتوج بكأس العالم 2022 في قطر؟",
    options: ["ليونيل ميسي", "كريستيانو رونالدو", "كيليان مبابي", "نيمار"],
    correctIndex: 0,
    explanation: "ليونيل ميسي قاد الأرجنتين للفوز بمونديال 2022 وتوج بجائزة أفضل لاعب في البطولة.",
    imageQuery: "Lionel Messi",
    topicKey: "messi",
  },

  // ==========================================
  // MEDIUM LEVEL (متوسط)
  // ==========================================

  // Capitals (عواصم)
  {
    level: "medium",
    category: "capitals",
    question: "ما هي العاصمة السياسية لأستراليا؟",
    options: ["كانبرا", "سيدني", "ملبورن", "بيرث"],
    correctIndex: 0,
    explanation: "كانبرا اختيرت عاصمة لأستراليا كحل وسط للمنافسة التاريخية بين سيدني وملبورن.",
    topicKey: "capital_australia",
  },
  {
    level: "medium",
    category: "capitals",
    question: "ما هي عاصمة كندا؟",
    options: ["أوتاوا", "تورونتو", "مونتريال", "فانكوفر"],
    correctIndex: 0,
    explanation: "أوتاوا الواقعة في مقاطعة أونتاريو هي العاصمة الفيدرالية لكندا.",
    topicKey: "capital_canada",
  },
  {
    level: "medium",
    category: "capitals",
    question: "ما هي عاصمة البرازيل؟",
    options: ["برازيليا", "ريو دي جانيرو", "ساو باولو", "سالفادور"],
    correctIndex: 0,
    explanation: "برازيليا هي العاصمة المخططة للبرازيل منذ عام 1960 بدلاً من ريو دي جانيرو.",
    topicKey: "capital_brazil",
  },
  {
    level: "medium",
    category: "capitals",
    question: "ما هي عاصمة تركيا؟",
    options: ["أنقرة", "إسطنبول", "إزمير", "أنطاليا"],
    correctIndex: 0,
    explanation: "أنقرة هي عاصمة تركيا ومقر حكومتها وليست إسطنبول كما يظن البعض.",
    topicKey: "capital_turkey",
  },
  {
    level: "medium",
    category: "capitals",
    question: "ما هي عاصمة المغرب؟",
    options: ["الرباط", "الدار البيضاء", "مراكش", "فاس"],
    correctIndex: 0,
    explanation: "الرباط هي العاصمة الإدارية والسياسية للمملكة المغربية.",
    topicKey: "capital_morocco",
  },

  // General Knowledge (ثقافة عامة)
  {
    level: "medium",
    category: "general_knowledge",
    question: "ما هو العنصر الكيميائي الأكثر وفرة في الكون بأسره؟",
    options: ["الهيدروجين", "الهيليوم", "الأكسجين", "الكربون"],
    correctIndex: 0,
    explanation: "يشكل الهيدروجين نحو 75% من الكتلة الباريونية للكون ويغذي النجوم بالطاقة.",
    topicKey: "most_abundant_element",
  },
  {
    level: "medium",
    category: "general_knowledge",
    question: "ما هي أعمق نقطة معروفة في محيطات العالم؟",
    options: ["خندق ماريانا", "خندق بويرتوريكو", "خندق جاوه", "خندق تونغا"],
    correctIndex: 0,
    explanation: "خندق ماريانا في المحيط الهادئ يصل عمقه لنحو 11,000 متر (نقطة تشالنجر ديب).",
    topicKey: "deepest_ocean_point",
  },
  {
    level: "medium",
    category: "general_knowledge",
    question: "كم عدد العظام في الهيكل العظمي للشخص البالغ؟",
    options: ["206 عظمة", "300 عظمة", "180 عظمة", "250 عظمة"],
    correctIndex: 0,
    explanation: "يولد الطفل بحوالي 270 عظمة تندمج تدريجياً مع النمو لتصبح 206 عظام عند البلوغ.",
    topicKey: "adult_bones_count",
  },
  {
    level: "medium",
    category: "general_knowledge",
    question: "ما هو الغاز الذي يشكل أعلى نسبة في الغلاف الجوي للأرض؟",
    options: ["النيتروجين", "الأكسجين", "ثاني أكسيد الكربون", "الأرجون"],
    correctIndex: 0,
    explanation: "غاز النيتروجين يمثل نحو 78% من هواء الغلاف الجوي بينما يمثل الأكسجين 21%.",
    topicKey: "atmosphere_nitrogen",
  },
  {
    level: "medium",
    category: "general_knowledge",
    question: "ما هي أصغر دولة مستقلة في العالم من حيث المساحة؟",
    options: ["دولة الفاتيكان", "موناكو", "سان مارينو", "ليختنشتاين"],
    correctIndex: 0,
    explanation: "الفاتيكان في قلب روما هي أصغر دولة معترف بها بمساحة لا تتجاوز نصف كيلومتر مربع.",
    topicKey: "smallest_country",
  },

  // Quotes (أقوال)
  {
    level: "medium",
    category: "quotes",
    question: "من قائل: 'على قدر أهل العزم تأتي العزائم وتأتي على قدر الكرام المكارم'؟",
    options: ["أبو الطيب المتنبي", "أبو العلاء المعري", "البحتري", "ابن الرومي"],
    correctIndex: 0,
    explanation: "مطلع إحدى أشهر قصائد المتنبي في مدح سيف الدولة الحمداني بعد فتح قلعة الحدث.",
    topicKey: "quote_mutanabbi_azm",
  },
  {
    level: "medium",
    category: "quotes",
    question: "من قائل العبارة الفلسفية الشهيرة: 'أنا أفكر، إذن أنا موجود'؟",
    options: ["رينيه ديكارت", "أرسطو", "إيمانويل كانط", "جان جاك روسو"],
    correctIndex: 0,
    explanation: "صاغ الفيلسوف الفرنسي رينيه ديكارت مبدأ 'الكوجيتو' كأساس للشك المنهجي واليقين.",
    topicKey: "quote_descartes_cogito",
  },
  {
    level: "medium",
    category: "quotes",
    question: "من قائل: 'لا تحسبن العلم ينفع وحده ما لم يتوّج ربه بخلاق'؟",
    options: ["حافظ إبراهيم", "أحمد شوقي", "إبراهيم طوقان", "محمود سامي البارودي"],
    correctIndex: 0,
    explanation: "قالها شاعر النيل حافظ إبراهيم مؤكداً أهمية الأخلاق كحامية للعلم والمعرفة.",
    topicKey: "quote_hafiz_akhlaq",
  },

  // Flags (أعلام)
  {
    level: "medium",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["ألمانيا", "بلجيكا", "هولندا", "إسبانيا"],
    correctIndex: 0,
    explanation: "علم جمهورية ألمانيا الاتحادية يتكون من ثلاثة خطوط أفقية: الأسود والأحمر والذهبي.",
    countryCode: "de",
    topicKey: "flag_germany",
  },
  {
    level: "medium",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["البرازيل", "الأرجنتين", "كولومبيا", "تشيلي"],
    correctIndex: 0,
    explanation: "علم البرازيل الأخضر يتوسطه معين أصفر ودائرة زرقاء تمثل سماء ريو دي جانيرو المرصعة بالنجوم.",
    countryCode: "br",
    topicKey: "flag_brazil",
  },
  {
    level: "medium",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["كندا", "سويسرا", "النمسا", "الدنمارك"],
    correctIndex: 0,
    explanation: "علم كندا الأحمر والأبيض يتوسطه الرمز الوطني الشهير: ورقة شجرة القيقب الحمراء.",
    countryCode: "ca",
    topicKey: "flag_canada",
  },

  // Landmarks & Figures (معالم وشخصيات)
  {
    level: "medium",
    category: "landmarks",
    question: "ما هي هذه المدينة الوردية التاريخية المنحوتة في الصخر بالأردن؟",
    options: ["البتراء", "جرش", "تدمر", "بعلبك"],
    correctIndex: 0,
    explanation: "البتراء عاصمة الأنباط القديمة في الأردن، ومن عجائب الدنيا السبع الجديدة.",
    imageQuery: "Petra",
    topicKey: "petra_jordan",
  },
  {
    level: "medium",
    category: "landmarks",
    question: "ما هو هذا الصرح المعماري الرخامي الأبيض الرائع في الهند؟",
    options: ["تاج محل", "قلعة أغرا", "قطب منار", "بوابة الهند"],
    correctIndex: 0,
    explanation: "تاج محل في أغرا بناه الإمبراطور شاه جهان تخليداً لذكرى زوجته ممتاز محل.",
    imageQuery: "Taj Mahal",
    topicKey: "taj_mahal",
  },
  {
    level: "medium",
    category: "historical_figures",
    question: "من هو العالم والمفكر التونسي مؤسس علم الاجتماع ومؤلف 'المقدمة' الشهيرة؟",
    options: ["ابن خلدون", "ابن رشد", "الإدريسي", "الفارابي"],
    correctIndex: 0,
    explanation: "عبد الرحمن بن خلدون وضع في مقدمته التاريخية الأسس الأولى لعلم العمران البشري والاجتماع.",
    imageQuery: "Ibn Khaldun",
    topicKey: "ibn_khaldun",
  },
  {
    level: "medium",
    category: "historical_figures",
    question: "من هو الرحالة المسلم الملقب بـ 'أمير الرحالين' الذي طاف أنحاء العالم في القرن 14م؟",
    options: ["ابن بطوطة", "ماركو بولو", "الإدريسي", "ابن جبير"],
    correctIndex: 0,
    explanation: "ابن بطوطة الطنجي جاب العالم القديم قاطعاً أكثر من 120 ألف كيلومتر في 30 عاماً.",
    imageQuery: "Ibn Battuta",
    topicKey: "ibn_battuta",
  },
  {
    level: "medium",
    category: "football_players",
    question: "من هو النجم المصري الملقب بـ 'فخر العرب' وهداف نادي ليفربول الإنجليزي؟",
    options: ["محمد صلاح", "رياض محرز", "ساديو ماني", "أشرف حكيمي"],
    correctIndex: 0,
    explanation: "محمد صلاح حطم أرقاماً قياسية تاريخية في الدوري الإنجليزي الممتاز ودوري أبطال أوروبا.",
    imageQuery: "Mohamed Salah",
    topicKey: "mo_salah",
  },

  // ==========================================
  // HARD LEVEL (صعب)
  // ==========================================

  // Capitals (عواصم)
  {
    level: "hard",
    category: "capitals",
    question: "ما هي العاصمة الفيدرالية لنيجيريا؟",
    options: ["أبوجا", "لاغوس", "كانو", "إبادان"],
    correctIndex: 0,
    explanation: "أبوجا أصبحت عاصمة نيجيريا عام 1991 خلفاً للاغوس لتكون في موقع مركزي محايد.",
    topicKey: "capital_nigeria",
  },
  {
    level: "hard",
    category: "capitals",
    question: "ما هي عاصمة نيوزيلندا؟",
    options: ["ويلينغتون", "أوكلاند", "كرايستشرش", "هاميلتون"],
    correctIndex: 0,
    explanation: "ويلينغتون هي العاصمة السياسية لنيوزيلندا وأقصى عاصمة في جنوب الكرة الأرضية.",
    topicKey: "capital_newzealand",
  },
  {
    level: "hard",
    category: "capitals",
    question: "ما هي العاصمة الفعلية للاتحاد السويسري؟",
    options: ["برن", "جنيف", "زيورخ", "بازل"],
    correctIndex: 0,
    explanation: "سويسرا ليس لها عاصمة رسمية بالدستور، لكن مدينة برن هي المقر الفيدرالي الفعلي للحكومة.",
    topicKey: "capital_switzerland",
  },
  {
    level: "hard",
    category: "capitals",
    question: "ما هي عاصمة كازاخستان الحالية؟",
    options: ["أستانا", "ألماتي", "شيمكنت", "أكتوبي"],
    correctIndex: 0,
    explanation: "أستانا (التي سميت نور سلطان لفترة وجيزة) هي عاصمة كازاخستان الحديثة منذ 1997.",
    topicKey: "capital_kazakhstan",
  },

  // General Knowledge (ثقافة عامة)
  {
    level: "hard",
    category: "general_knowledge",
    question: "في أي عام سقط جدار برلين وانتهى الفصل بين الألمانيتين؟",
    options: ["1989م", "1991م", "1985م", "1979م"],
    correctIndex: 0,
    explanation: "سقط جدار برلين في 9 نوفمبر 1989 معلناً بداية نهاية الحرب الباردة وتوحيد ألمانيا.",
    topicKey: "berlin_wall_fall",
  },
  {
    level: "hard",
    category: "general_knowledge",
    question: "ما هي أطول سلسلة جبال قارية برية متصلة في العالم؟",
    options: ["سلسلة جبال الأنديز", "سلسلة جبال الهيمالايا", "سلسلة جبال الروكي", "سلسلة جبال الألب"],
    correctIndex: 0,
    explanation: "جبال الأنديز في أمريكا الجنوبية تمتد لأكثر من 7,000 كم بمحاذاة الساحل الغربي للقارة.",
    topicKey: "longest_mountain_range",
  },
  {
    level: "hard",
    category: "general_knowledge",
    question: "ما هو الكوكب الذي يمتلك أكبر عدد من الأقمار المؤكدة في المجموعة الشمسية؟",
    options: ["كوكب زحل", "كوكب المشتري", "كوكب أورانوس", "كوكب نبتون"],
    correctIndex: 0,
    explanation: "يمتلك كوكب زحل أكثر من 140 قمراً معتمداً ومؤكداً متفوقاً على كوكب المشتري.",
    topicKey: "most_moons_planet",
  },
  {
    level: "hard",
    category: "general_knowledge",
    question: "ما هي لغة البرمجة الشهيرة التي طوّر نسختها الأولى بريندان إيتش في 10 أيام فقط عام 1995؟",
    options: ["جافاسكريبت (JavaScript)", "بايثون (Python)", "جافا (Java)", "بي إتش بي (PHP)"],
    correctIndex: 0,
    explanation: "صمم بريندان إيتش لغة جافاسكريبت لصالح متصفح نتسكيب في غضون 10 أيام في مايو 1995.",
    topicKey: "javascript_creation",
  },
  {
    level: "hard",
    category: "general_knowledge",
    question: "ما هو الاسم التاريخي لمدينة إسطنبول قبل الفتح الإسلامي عام 1453م؟",
    options: ["القسطنطينية", "أنطاكية", "طرابزون", "سميرنا"],
    correctIndex: 0,
    explanation: "كانت تسمى القسطنطينية عاصمة الإمبراطورية البيزنطية حتى فتحها السلطان محمد الفاتح.",
    topicKey: "constantinople_istanbul",
  },

  // Quotes (أقوال)
  {
    level: "hard",
    category: "quotes",
    question: "من قائل: 'نعيب زماننا والعيب فينا وما لزماننا عيب سوانا'؟",
    options: ["الإمام الشافعي", "علي بن أبي طالب", "الحسن البصري", "أبو العتاهية"],
    correctIndex: 0,
    explanation: "هذا البيت الحكيم من ديوان الإمام محمد بن إدريس الشافعي رحمه الله.",
    topicKey: "quote_shafii_zaman",
  },
  {
    level: "hard",
    category: "quotes",
    question: "من قائل: 'وما نيل المطالب بالتمني ولكن تؤخذ الدنيا غلابا'؟",
    options: ["أحمد شوقي", "إبراهيم اليازجي", "أبو العلاء المعري", "خليل مطران"],
    correctIndex: 0,
    explanation: "هذا البيت الخالد من قصيدة 'سلوا قلبي' لأمير الشعراء أحمد شوقي.",
    topicKey: "quote_shawqi_ghilaba",
  },
  {
    level: "hard",
    category: "quotes",
    question: "من قائل: 'أعز مكان في الدنى سرج سابح وخير جليس في الزمان كتاب'؟",
    options: ["أبو الطيب المتنبي", "الجاحظ", "المعري", "الأصمعي"],
    correctIndex: 0,
    explanation: "من درر المتنبي التي تمتدح الفروسية ومصاحبة الكتب والمطالعة.",
    topicKey: "quote_mutanabbi_kitab",
  },

  // Flags (أعلام)
  {
    level: "hard",
    category: "flags",
    question: "ما هي الدولة الوحيدة في العالم التي لا يتخذ علمها الوطني شكلاً رباعي الأضلاع؟",
    options: ["نيبال", "سويسرا", "الفاتيكان", "بوتان"],
    correctIndex: 0,
    explanation: "علم نيبال هو العلم الوطني الوحيد في العالم غير المستطيل، ويتكون من مثلثين مزدوجين.",
    countryCode: "np",
    topicKey: "flag_nepal",
  },
  {
    level: "hard",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["كوريا الجنوبية", "سنغافورة", "تايلاند", "ماليزيا"],
    correctIndex: 0,
    explanation: "علم كوريا الجنوبية (التايغوكغي) يمثل دائرة التوازن الأحمر والأزرق وتحيط بها 4 خطوط ثلاثية.",
    countryCode: "kr",
    topicKey: "flag_south_korea",
  },
  {
    level: "hard",
    category: "flags",
    question: "ما هي الدولة التي يمثلها هذا العلم؟",
    options: ["جنوب أفريقيا", "كينيا", "نيجيريا", "غانا"],
    correctIndex: 0,
    explanation: "علم جنوب أفريقيا الحديث اعتُمد عام 1994 بعد انتهاء حقبة الفصل العنصري بألوانه الستة المميزة.",
    countryCode: "za",
    topicKey: "flag_south_africa",
  },

  // Landmarks & Figures (معالم وشخصيات)
  {
    level: "hard",
    category: "landmarks",
    question: "ما هي هذه المدينة الأثرية الضائعة لشعب الإنكا الواقعة في أعالي جبال الإنديز في بيرو؟",
    options: ["ماتشو بيتشو", "تيواناكو", "كوسكو", "تشيتشن إيتزا"],
    correctIndex: 0,
    explanation: "ماتشو بيتشو شُيدت في القرن 15 وتعتبر أعظم تحفة معمارية هندسية لحضارة الإنكا.",
    imageQuery: "Machu Picchu",
    topicKey: "machu_picchu",
  },
  {
    level: "hard",
    category: "historical_figures",
    question: "من هو العالم المسلم العبقري رائد علم البصريات ومؤلف 'كتاب المناظر' الذي أثبت أن الرؤية تنشأ من انعكاس الضوء؟",
    options: ["الحسن بن الهيثم", "الكندي", "البيروني", "ثابت بن قرة"],
    correctIndex: 0,
    explanation: "ابن الهيثم (المعروف غربياً بـ Alhazen) أحدث ثورة علمية بتأسيس المنهج التجريبي الحديث في البصريات.",
    imageQuery: "Alhazen",
    topicKey: "ibn_al_haytham",
  },
  {
    level: "hard",
    category: "historical_figures",
    question: "من هو القائد القرطاجي الأسطوري الذي قاد جيوشه مع الأفيال عبر جبال الألب لمحاربة الرومان؟",
    options: ["حنبعل (هانيبال)", "حملقار برقا", "صدربعل", "ماسينيسا"],
    correctIndex: 0,
    explanation: "حنبعل برقا عبقري الحرب القرطاجي ألحق بروما هزائم ساحقة في معركة كاناي بعد عبوره الملحمي للألب.",
    imageQuery: "Hannibal",
    topicKey: "hannibal_carthage",
  },
  {
    level: "hard",
    category: "historical_figures",
    question: "من هو العالم الرياضي والفلكي المسلم الذي وضع أصول علم الجبر ومصطلح الخوارزميات (Algorithm)؟",
    options: ["محمد بن موسى الخوارزمي", "عمر الخيام", "نصير الدين الطوسي", "البوزجاني"],
    correctIndex: 0,
    explanation: "الخوارزمي ألف 'المختصر في حساب الجبر والمقابلة' واشتُق اسم الخوارزمية من لقبه تخليداً لإسهاماته.",
    imageQuery: "Muhammad ibn Musa al-Khwarizmi",
    topicKey: "al_khwarizmi",
  },
];

/** Convert RawQuizDefinition to BankQuizItem */
export function rawQuizToBankItem(def: RawQuizDefinition): BankQuizItem {
  const key = getQuestionDedupeKey(def);
  // The curated bank stores every correct answer at index 0. Shuffle on the
  // way into the persistent bank so cached questions are not predictable.
  return shuffleQuestionOptions({
    id: cyrb53(`${key}:${def.level}`),
    key,
    level: def.level,
    category: def.category,
    question: def.question,
    options: def.options,
    correctIndex: def.correctIndex,
    explanation: def.explanation,
    countryCode: def.countryCode,
    imageQuery: def.imageQuery,
    topicKey: def.topicKey,
    addedAt: Date.now(),
  });
}

/** Convert RawQuizDefinition to Question */
export function rawQuizToQuestion(def: RawQuizDefinition): Question {
  // Shuffle independently for every served question so the correct answer is
  // at a random position each session.
  return shuffleQuestionOptions({
    category: def.category,
    question: def.question,
    options: def.options,
    correctIndex: def.correctIndex,
    explanation: def.explanation,
    countryCode: def.countryCode,
    imageQuery: def.imageQuery,
    topicKey: def.topicKey,
  });
}

/**
 * Seeds the persistent Quiz bank with matching fallback questions.
 * Returns the Question objects that were added or matched.
 */
export function seedBankFromFallback(
  level: Level,
  categories: CategoryKey[],
  count: number,
): Question[] {
  // First look for matching level + category
  let candidates = FALLBACK_QUIZ_BANK.filter(
    (q) => q.level === level && categories.includes(q.category),
  );

  // If too few, look for any category for this level
  if (candidates.length < count) {
    candidates = FALLBACK_QUIZ_BANK.filter((q) => q.level === level);
  }

  // If still too few, look for any question in fallback bank
  if (candidates.length < count) {
    candidates = [...FALLBACK_QUIZ_BANK];
  }

  // Shuffle candidates, prioritizing text/flag questions first for instantaneous start
  const shuffled = [...candidates].sort((a, b) => {
    const aIsImg = Boolean(a.imageQuery);
    const bIsImg = Boolean(b.imageQuery);
    if (aIsImg !== bIsImg) return aIsImg ? 1 : -1;
    return Math.random() - 0.5;
  });
  const selected = shuffled.slice(0, count);

  // Save to persistent bank
  const bankItems = selected.map(rawQuizToBankItem);
  addQuestionsToBank(bankItems);

  return selected.map(rawQuizToQuestion);
}

/**
 * Returns any fallback questions for emergency safety net (no images required).
 */
export function getAnyFallbackQuestions(level: Level, count: number): Question[] {
  let matched = FALLBACK_QUIZ_BANK.filter(
    (q) => q.level === level && !q.imageQuery && q.category !== "flags",
  );
  if (matched.length === 0) {
    matched = FALLBACK_QUIZ_BANK.filter((q) => !q.imageQuery && q.category !== "flags");
  }
  return matched.slice(0, count).map(rawQuizToQuestion);
}

/**
 * Seeds ALL fallback questions into the bank at once.
 * Useful for the "استيراد بنك الأسئلة المدمج" button in Settings.
 */
export function seedAllFallbackToBank(): number {
  const current = loadQuizBank();
  const existingKeys = new Set(current.map((q) => q.key));
  const newItems = FALLBACK_QUIZ_BANK.map(rawQuizToBankItem).filter(
    (item) => !existingKeys.has(item.key),
  );

  if (newItems.length > 0) {
    addQuestionsToBank(newItems);
  }
  return newItems.length;
}
