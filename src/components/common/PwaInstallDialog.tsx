import { useEffect, useState } from "react";
import {
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Smartphone,
  Sparkles,
  WifiOff,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getPwaState,
  promptPwaInstall,
  subscribePwaState,
  updatePwa,
  type PwaState,
} from "@/lib/pwa";
import { sound } from "@/lib/sound";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PwaInstallDialog({ open, onOpenChange }: Props) {
  const [pwaState, setPwaState] = useState<PwaState>(() => getPwaState());

  useEffect(() => {
    const unsub = subscribePwaState(setPwaState);
    return unsub;
  }, []);

  const handleInstallClick = async () => {
    sound.unlock();
    sound.playClick();
    const installed = await promptPwaInstall();
    if (installed) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center p-1.5 shadow-2xs">
              <img src="/logogame.png" alt="العب وتعلم" className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                تثبيت تطبيق "العب وتعلم"
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                تطبيق ويب تقدمي (PWA) فائق السرعة وبدون إعلانات
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {pwaState.isStandalone ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              التطبيق مثبت وتعمل في الوضع المستقل!
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              أنت تستخدم المنصة حالياً كتطبيق هاتف ذكي مباشر مع دعم كامل للشاشة وتجربة اللعب
              التفاعلي.
            </p>
          </div>
        ) : pwaState.isIOS ? (
          /* iOS Safari Instructions */
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl border border-primary/25 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
              لتثبيت التطبيق على جهاز <strong>iPhone</strong> أو <strong>iPad</strong>، اتبع الخطوات
              البسيطة التالية من متصفح Safari:
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-card/60">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  ١
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-foreground block">
                    اضغط على زر المشاركة (Share)
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    أيقونة المربع ذو السهم لأعلى
                    <Share2 className="size-3.5 text-primary inline" /> أسفل شاشة المتصفح.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-card/60">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  ٢
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-foreground block">
                    اختر "إضافة إلى الصفحة الرئيسية"
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    مرر للأسفل واضغط على خيار
                    <PlusSquare className="size-3.5 text-primary inline" /> Add to Home Screen.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-card/60">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  ٣
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-foreground block">اضغط "إضافة" (Add)</span>
                  <span className="text-muted-foreground">
                    سيظهر تطبيق "العب وتعلم" على شاشتك الرئيسية كأي تطبيق هاتف أصيل.
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full font-bold" onClick={() => onOpenChange(false)}>
              فهمت ذلك
            </Button>
          </div>
        ) : (
          /* Android / Desktop Chrome / Edge Native Install */
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 space-y-2">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                مميزات تثبيت التطبيق:
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>فتح فوري بلمسة واحدة من شاشتك الرئيسية.</li>
                <li>تجربة ملء الشاشة بدون أشرطة المتصفح المزعجة.</li>
                <li>حفظ استهلاك البيانات وسرعة فائقة في التنقل.</li>
                <li>إمكانية اللعب بالمحتوى المخزن حتى بدون إنترنت.</li>
              </ul>
            </div>

            {pwaState.canInstall ? (
              <Button
                onClick={handleInstallClick}
                className="w-full font-bold gap-2 text-base h-12 shadow-md cursor-pointer"
                size="lg"
              >
                <Download className="size-5" />
                تثبيت التطبيق الآن
              </Button>
            ) : (
              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 text-xs text-muted-foreground text-center">
                يمكنك أيضاً تثبيت التطبيق مباشرة من قائمة متصفحك (⋮) ثم اختيار{" "}
                <strong>"تثبيت التطبيق"</strong> أو <strong>"Install app"</strong>.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Floating App Update Banner when a new SW version is waiting */
export function PwaUpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const unsub = subscribePwaState((st) => {
      setUpdateAvailable(st.updateAvailable);
    });
    return unsub;
  }, []);

  if (!updateAvailable) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-20 sm:top-24 start-4 end-4 sm:end-auto sm:start-6 z-50 flex items-center gap-3 p-3.5 rounded-2xl border border-amber-500/35 bg-card/95 backdrop-blur-xl shadow-2xl max-w-sm sm:max-w-md animate-rise"
    >
      <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
        <RefreshCw className="size-4.5 animate-spin" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 text-start">
        <span className="text-xs font-bold text-foreground">يتوفر تحديث جديد للمنصة</span>
        <span className="text-[11px] text-muted-foreground">
          قم بتحديث التطبيق للحصول على أحدث الميزات
        </span>
      </div>

      <Button
        size="sm"
        onClick={() => {
          sound.unlock();
          sound.playClick();
          updatePwa();
        }}
        className="font-bold text-xs h-8 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
      >
        تحديث الآن
      </Button>
    </aside>
  );
}

/** Offline floating status strip */
export function OfflineStatusStrip() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = subscribePwaState((st) => {
      setIsOnline(st.isOnline);
    });
    return unsub;
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="sticky top-16 z-30 w-full bg-amber-500/15 border-b border-amber-500/25 backdrop-blur-md px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 transition-colors"
    >
      <WifiOff className="size-3.5 shrink-0" />
      <span>أنت في وضع عدم الاتصال — يمكنك الاستمتاع بالأسئلة المحفوظة محلياً في البنك.</span>
    </div>
  );
}
