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
    <div className="w-full max-w-xl mx-auto mb-4 px-4">
      <div className="bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-foreground">
                احفظ أماكن الكروت!
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {remainingSeconds} ثوانٍ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              ستنقلب الكروت تلقائياً بعد قليل لتبدأ جولة التركيز
            </p>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
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

