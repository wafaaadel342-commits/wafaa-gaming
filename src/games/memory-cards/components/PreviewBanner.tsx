import { Eye, Play } from "lucide-react";
import React from "react";

interface PreviewBannerProps {
  remainingSeconds: number;
  totalSeconds: number;
  onSkip: () => void;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({
  remainingSeconds,
  totalSeconds,
  onSkip,
}) => {
  const percent = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  return (
    <div className="w-full max-w-xl mx-auto mb-2 sm:mb-4 px-2 sm:px-4">
      <div className="bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 shadow-xs animate-in fade-in">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-xs sm:text-base text-foreground truncate">
                احفظ أماكن الكروت!
              </span>
              <span className="text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                {remainingSeconds} ث
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:block">
              ستنقلب الكروت تلقائياً بعد قليل لتبدأ جولة التركيز
            </p>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] sm:text-xs transition-colors shadow-xs"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
          <span>ابدأ الآن</span>
        </button>
      </div>

      {/* Progress countdown indicator line */}
      <div className="w-full bg-border/40 h-1.5 rounded-full mt-2 overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

