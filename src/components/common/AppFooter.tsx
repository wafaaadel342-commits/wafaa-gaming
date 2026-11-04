import { Heart, Sparkles, BookOpen, ShieldCheck } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-border/70 bg-card/60 backdrop-blur-md text-foreground transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6 text-center">
        {/* Dedication Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-rose-500/20 bg-rose-500/5 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl text-muted-foreground shadow-2xs">
          <Heart className="size-4 text-rose-500 fill-rose-500 shrink-0" />
          <span>
            تم التصميم بواسطة{" "}
            <strong className="font-bold text-foreground underline decoration-rose-500/40 underline-offset-4">
              اسلام زايد
            </strong>{" "}
            ك هدية لحبيبتوا{" "}
            <strong className="font-bold text-rose-600 dark:text-rose-400">وفاء عادل</strong> بكل حب

          </span>
          <Sparkles className="size-4 text-amber-500 shrink-0" />
        </div>

        {/* Site Details & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-4 border-t border-border/40 text-xs text-muted-foreground gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/logogame.png"
              alt="العب وتعلم"
              className="size-5 rounded-md object-contain"
            />
            <span className="font-bold text-foreground">العب وتعلم</span>
            <span className="text-border">•</span>
            <span>منصة ألعاب تعليمية وثقافية تفاعلية</span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground/80">
            <span>جميع الحقوق محفوظة © {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
