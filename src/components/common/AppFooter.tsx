import { Heart, Sparkles } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="w-full mt-auto border-t border-border/70 bg-card/60 backdrop-blur-md text-foreground transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6 text-center">
        {/* Dedication Banner */}
        <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-rose-500/20 bg-rose-500/5 font-medium leading-relaxed max-w-full text-muted-foreground shadow-2xs">
          <Heart className="size-3.5 sm:size-4 text-rose-500 fill-rose-500 shrink-0" />
          <span
            className="whitespace-nowrap text-[clamp(8.5px,2.6vw,14px)] sm:text-sm text-center leading-normal tracking-tight"
            style={{ whiteSpace: "nowrap" }}
          >
            تم التصميم بواسطة{" "}
            <strong className="font-bold text-foreground underline decoration-rose-500/40 underline-offset-4">
              اسلام زايد
            </strong>{" "}
            ك هدية لحبيبتوا{" "}
            <strong className="font-bold text-rose-600 dark:text-rose-400">وفاء عادل</strong> بكل حب ❤️
          </span>
          <Sparkles className="size-3.5 sm:size-4 text-amber-500 shrink-0" />
        </div>

        
      </div>
    </footer>
  );
}
