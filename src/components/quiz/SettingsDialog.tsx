import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  KeyRound,
  Layers,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { clearAllBanks, clearSeenHistory, getBankStats, type BankStats } from "@/lib/anti-repeat";
import { seedAllFallbackToBank } from "@/lib/quiz-fallback";
import {
  startGlobalBankFilling,
  cancelGlobalBankFilling,
  subscribeGlobalBankFiller,
  getGlobalBankFillerState,
  type FillProgress,
  type FillTarget,
} from "@/lib/bank-filler";
import { type Settings } from "@/lib/quiz";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function SettingsDialog({ open, onOpenChange, settings, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "bank">("general");
  const [draft, setDraft] = useState<Settings>(settings);

  // Content Bank Manager State
  const [bankStats, setBankStats] = useState<BankStats>(() => getBankStats());
  const [fillTarget, setFillTarget] = useState<FillTarget>("all");
  const [fillCount, setFillCount] = useState<number>(200);
  const [isFilling, setIsFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState<FillProgress | null>(null);

  const [confirmClearSeen, setConfirmClearSeen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const refreshStats = () => {
    setBankStats(getBankStats());
  };

  // Subscribe to global bank filler updates
  useEffect(() => {
    const unsub = subscribeGlobalBankFiller((st) => {
      setIsFilling(st.isFilling);
      setFillProgress(st.progress);
      if (st.isFilling) {
        setFillTarget(st.target);
        setFillCount(st.totalRequested);
      }
      refreshStats();
    });
    return unsub;
  }, []);

  // Resync draft and bank stats when dialog opens
  useEffect(() => {
    if (open) {
      setDraft({ ...settings });
      refreshStats();
      setConfirmClearSeen(false);
      setConfirmClearAll(false);
      const currentGlobal = getGlobalBankFillerState();
      setIsFilling(currentGlobal.isFilling);
      setFillProgress(currentGlobal.progress);
    }
  }, [open, settings]);

  const handleVolumeChange = (value: number[]) => {
    const val = value[0] ?? 80;
    setDraft((d) => ({ ...d, volume: val }));
  };

  const testSound = () => {
    sound.setVolume(draft.volume);
    sound.play("correct");
  };

  const handleSave = () => {
    sound.setVolume(draft.volume);
    onSave(draft);
    toast.success("تم الحفظ بنجاح");
  };

  // Content Bank Actions
  const handleStartFill = async () => {
    try {
      const res = await startGlobalBankFilling(draft, fillTarget, fillCount);
      refreshStats();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`تمت تعبئة البنك بنجاح بإضافة ${res.added} عنصراً جديداً! 🎉`);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("حدث خطأ أثناء تعبئة البنك.");
    } finally {
      refreshStats();
    }
  };

  const handleCancelFill = () => {
    cancelGlobalBankFilling();
    toast.info("جاري إيقاف العملية...");
  };

  const handleImportFallback = () => {
    const added = seedAllFallbackToBank();
    refreshStats();
    if (added > 0) {
      toast.success(`تم استيراد ${added} سؤالاً مدمجاً إلى بنك الأسئلة بنجاح! 🎉`);
    } else {
      toast.info("جميع الأسئلة المدمجة موجودة بالفعل في البنك.");
    }
  };

  const handleClearSeen = () => {
    clearSeenHistory();
    setConfirmClearSeen(false);
    refreshStats();
    toast.success("تم مسح سجل المشاهدة! أصبحت جميع عناصر البنك غير مشاهدة وجاهزة للعب.");
  };

  const handleClearAll = () => {
    clearAllBanks();
    clearSeenHistory();
    setConfirmClearAll(false);
    refreshStats();
    toast.success("تم مسح محتوى البنك بالكامل.");
  };

  const totalBankItems = bankStats.quiz.total + bankStats.words.total + bankStats.sentences.total;
  const totalUnseenItems =
    bankStats.quiz.unseen + bankStats.words.unseen + bankStats.sentences.unseen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">الإعدادات وبنك المحتوى</DialogTitle>
          <DialogDescription>
            إعدادات الصوت، حالة الذكاء الاصطناعي التلقائي، وإدارة بنك المحتوى لمنع التكرار.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/70 pb-3 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === "general"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary/40",
            )}
          >
            <Sparkles className="size-4" />
            الصوت والذكاء الاصطناعي
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("bank");
              refreshStats();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative",
              activeTab === "bank"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary/40",
            )}
          >
            <Database className="size-4" />
            بنك المحتوى
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-mono font-bold",
                activeTab === "bank"
                  ? "bg-primary-foreground/20 text-inherit"
                  : "bg-secondary text-foreground",
              )}
            >
              {totalBankItems}
            </span>
          </button>
        </div>

        {activeTab === "general" ? (
          <div className="mt-4 space-y-6">
            {/* Automatic AI Provider Status Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Zap className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      مزود الذكاء الاصطناعي: OpenRouter
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      مفعل تلقائياً بنماذج مجانية فقط مع التبديل التلقائي في حال تعثر أي نموذج
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-easy/15 text-easy">
                  <CheckCircle2 className="size-3.5" />
                  جاهز للعب
                </span>
              </div>

              <div className="rounded-xl bg-background/50 border border-border/60 p-3 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-2 font-medium">
                  <span className="size-2 rounded-full bg-easy animate-pulse" />
                  تم تعيين OpenRouter كمزود وحيد واكتشاف النماذج المجانية واختيار الأفضل تلقائياً.
                </p>
                {draft.lastUsedModel && (
                  <p className="text-xs pt-1 border-t border-border/40 font-medium">
                    النموذج الأخير المستخدم:{" "}
                    <span className="font-bold text-foreground font-mono" dir="ltr">
                      {draft.lastUsedModel}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* OpenRouter API Key Input Card */}
            <div className="space-y-3 rounded-2xl bg-secondary/30 p-4 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" />
                  <Label htmlFor="openrouter-key" className="font-bold text-sm">
                    مفتاح OpenRouter API (اختياري)
                  </Label>
                </div>
                {draft.openrouterKey.trim() ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-easy/15 text-easy">
                    <CheckCircle2 className="size-3" /> مفتاح مخصص
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    البنك المدمج نشط
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  id="openrouter-key"
                  type="password"
                  dir="ltr"
                  placeholder="sk-or-v1-..."
                  value={draft.openrouterKey}
                  onChange={(e) => setDraft((d) => ({ ...d, openrouterKey: e.target.value.trim() }))}
                  className="font-mono text-xs bg-background/60"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  يمكنك إدخال مفتاح مجاني من{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline font-medium hover:text-primary/80 inline-flex items-center gap-0.5"
                  >
                    OpenRouter.ai <ExternalLink className="size-3" />
                  </a>{" "}
                  لتوليد أسئلة غير محدودة مجاناً. إذا تركته فارغاً ستعتمد اللعبة على بنك الأسئلة المدمج دون الحاجة لأي مفتاح.
                </p>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="space-y-3 rounded-2xl bg-secondary/30 p-4 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="size-5 text-primary" />
                  <Label className="font-bold text-sm">مستوى المؤثرات الصوتية</Label>
                </div>
                <span className="text-xs font-bold text-primary">{draft.volume}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[draft.volume]}
                onValueChange={handleVolumeChange}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={testSound}
                  className="text-xs font-semibold"
                >
                  تجربة الصوت 🔊
                </Button>
              </div>
            </div>

            <Button className="w-full text-base font-bold shadow-md" size="lg" onClick={handleSave}>
              حفظ الإعدادات
            </Button>
          </div>
        ) : (
          /* ================= ACTIVE TAB: CONTENT BANK ================= */
          <div className="mt-4 space-y-6">
            {/* Explainer Banner */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
              <Database className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground text-sm">
                  نظام منع التكرار وبنك المحتوى المحلي الدائم
                </p>
                <p>
                  يتم حفظ الأسئلة والكلمات والجمل المُنشأة محلياً في متصفحك بمعرفات مشفّرة ومضادة
                  للتكرار. تُسجل المشاهدة فقط عندما يُعرض السؤال أو الكلمة على الشاشة، مما يضمن
                  تجربة لعب جديدة دائماً وبلا انتظار.
                </p>
              </div>
            </div>

            {/* Bank Stats Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  إحصائيات بنك المحتوى الحالي
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  الإجمالي: <strong className="text-foreground">{totalBankItems}</strong> عنصر (
                  {totalUnseenItems} غير مشاهد)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Quiz */}
                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">تحدّي المعرفة</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {bankStats.quiz.unseen} غير مشاهد
                    </span>
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {bankStats.quiz.total}{" "}
                    <span className="text-xs font-normal text-muted-foreground">سؤال مخزن</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>
                      <span className="block text-easy font-bold">سهل</span>
                      {bankStats.quiz.byLevel.easy.unseen} / {bankStats.quiz.byLevel.easy.total}
                    </div>
                    <div>
                      <span className="block text-medium font-bold">متوسط</span>
                      {bankStats.quiz.byLevel.medium.unseen} / {bankStats.quiz.byLevel.medium.total}
                    </div>
                    <div>
                      <span className="block text-hard font-bold">صعب</span>
                      {bankStats.quiz.byLevel.hard.unseen} / {bankStats.quiz.byLevel.hard.total}
                    </div>
                  </div>
                </div>

                {/* Card 2: Words */}
                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">ركّب الكلمة</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-bold">
                      {bankStats.words.unseen} غير مشاهد
                    </span>
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {bankStats.words.total}{" "}
                    <span className="text-xs font-normal text-muted-foreground">كلمة مخزنة</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>
                      <span className="block text-easy font-bold">سهل</span>
                      {bankStats.words.byLevel.easy.unseen} / {bankStats.words.byLevel.easy.total}
                    </div>
                    <div>
                      <span className="block text-medium font-bold">متوسط</span>
                      {bankStats.words.byLevel.medium.unseen} /{" "}
                      {bankStats.words.byLevel.medium.total}
                    </div>
                    <div>
                      <span className="block text-hard font-bold">صعب</span>
                      {bankStats.words.byLevel.hard.unseen} / {bankStats.words.byLevel.hard.total}
                    </div>
                  </div>
                </div>

                {/* Card 3: Sentences */}
                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">ركّب الجملة</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-easy/20 text-easy font-bold">
                      {bankStats.sentences.unseen} غير مشاهد
                    </span>
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {bankStats.sentences.total}{" "}
                    <span className="text-xs font-normal text-muted-foreground">جملة مخزنة</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>
                      <span className="block text-easy font-bold">سهل</span>
                      {bankStats.sentences.byLevel.easy.unseen} /{" "}
                      {bankStats.sentences.byLevel.easy.total}
                    </div>
                    <div>
                      <span className="block text-medium font-bold">متوسط</span>
                      {bankStats.sentences.byLevel.medium.unseen} /{" "}
                      {bankStats.sentences.byLevel.medium.total}
                    </div>
                    <div>
                      <span className="block text-hard font-bold">صعب</span>
                      {bankStats.sentences.byLevel.hard.unseen} /{" "}
                      {bankStats.sentences.byLevel.hard.total}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Built-in Content Import Card */}
            <div className="rounded-2xl border border-easy/30 bg-easy/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="size-5 text-easy" />
                  <h3 className="font-bold text-sm text-foreground">
                    بنك الأسئلة المدمج مسبقاً (أوفلاين)
                  </h3>
                </div>
                <span className="text-xs font-bold text-easy bg-easy/10 px-2.5 py-0.5 rounded-full">
                  70+ سؤال مجهز
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                استيراد عشرات الأسئلة المجهزة مسبقاً لجميع المستويات والتصنيفات في بنكك المحلي بنقرة واحدة، لتتمكن من اللعب فوراً دون الحاجة للاتصال بالذكاء الاصطناعي.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportFallback}
                className="w-full text-xs font-bold gap-2 border-easy/40 hover:bg-easy/10 text-foreground"
              >
                <Download className="size-3.5 text-easy" />
                استيراد بنك الأسئلة المدمج الآن
              </Button>
            </div>

            {/* Filling Tool */}
            <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h3 className="font-bold text-base">
                    تعبئة البنك تلقائياً بواسطة الذكاء الاصطناعي
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  توليد دفعات متتالية من الأسئلة والكلمات والجمل عبر نماذج OpenRouter المجانية
                  وتخزينها مسبقاً لبدء فوري بدون أي انتظار.
                </p>
              </div>

              {!isFilling ? (
                <div className="space-y-3.5">
                  {/* Target Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      نوع المحتوى المراد تعبئته
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "all", label: "الكل (توازن)" },
                        { id: "quiz", label: "تحدّي المعرفة" },
                        { id: "words", label: "ركّب الكلمة" },
                        { id: "sentences", label: "ركّب الجملة" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFillTarget(t.id as FillTarget)}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                            fillTarget === t.id
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "border-border/60 hover:bg-muted/60 text-muted-foreground",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Count Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      العدد المطلوب توليده
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 200].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFillCount(c)}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                            fillCount === c
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "border-border/60 hover:bg-muted/60 text-muted-foreground",
                          )}
                        >
                          {c} عنصر
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStartFill}
                    className="w-full font-bold gap-2 text-sm shadow-md"
                    size="lg"
                  >
                    <Sparkles className="size-4" />
                    بدء تعبئة البنك ({fillCount} عنصر)
                  </Button>
                </div>
              ) : (
                /* Active Filling Progress UI */
                <div className="space-y-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-primary">
                      <RefreshCw className="size-3.5 animate-spin" />
                      جاري التعبئة في الخلفية...
                    </span>
                    <span className="font-mono text-foreground">
                      {fillProgress ? `${fillProgress.completed} / ${fillProgress.total}` : ""}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full rounded-full bg-secondary/80 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${
                          fillProgress
                            ? Math.min(
                                100,
                                Math.round((fillProgress.completed / fillProgress.total) * 100),
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    {fillProgress?.currentTask || "جاري التوليد..."}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelFill}
                    className="w-full text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                  >
                    <XCircle className="size-4" />
                    إلغاء التعبئة
                  </Button>
                </div>
              )}
            </div>

            {/* Maintenance & Reset Actions */}
            <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <RotateCcw className="size-4 text-muted-foreground" />
                خيارات الصيانة وإعادة التعيين
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reset Seen History */}
                <div className="rounded-xl border border-border/60 p-3 bg-background/50 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-foreground">تصفير سجل المشاهدة</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      يُعيد اعتبار جميع الأسئلة والكلمات كأنها جديدة لتلعب بها من جديد، مع الحفاظ
                      على كل المحتوى المخزن.
                    </p>
                  </div>

                  {!confirmClearSeen ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmClearSeen(true)}
                      className="w-full text-xs font-bold gap-1"
                    >
                      <RotateCcw className="size-3.5" />
                      تصفير سجل المشاهدة
                    </Button>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleClearSeen}
                        className="flex-1 text-xs font-bold"
                      >
                        تأكيد التصفير
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmClearSeen(false)}
                        className="text-xs"
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>

                {/* Clear Entire Bank */}
                <div className="rounded-xl border border-destructive/30 p-3 bg-destructive/5 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      مسح البنك بالكامل
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      حذف جميع الأسئلة والكلمات والجمل المخزنة محلياً في هذا المتصفح تماماً.
                    </p>
                  </div>

                  {!confirmClearAll ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmClearAll(true)}
                      className="w-full text-xs font-bold text-destructive border-destructive/40 hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      مسح البنك بالكامل
                    </Button>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAll}
                        className="flex-1 text-xs font-bold"
                      >
                        نعم، احذف كل شيء
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmClearAll(false)}
                        className="text-xs"
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
