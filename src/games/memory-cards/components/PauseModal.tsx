import { Home, Play, RotateCcw } from "lucide-react";
import React from "react";

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
          <Play className="w-8 h-8 fill-primary translate-x-0.5" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            اللعبة متوقفة مؤقتاً
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            خُذ نفسًا عميقًا واستعد لاستكمال تحدي الذاكرة
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-primary-foreground" />
            <span>متابعة اللعب</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-muted/80 hover:bg-muted text-foreground font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-border/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الجولة الحالية</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-2.5 rounded-2xl text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>الرجوع للقائمة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

