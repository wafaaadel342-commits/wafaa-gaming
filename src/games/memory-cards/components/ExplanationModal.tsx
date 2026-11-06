import { BookOpen, Sparkles, X } from "lucide-react";
import React from "react";

interface ExplanationModalProps {
  explanation: {
    text: string;
    praise: string;
    sourceName?: string | undefined;
  };
  onDismiss: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  explanation,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-lg border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xl text-foreground flex flex-col gap-2 relative">
        <button
          onClick={onDismiss}
          className="absolute top-2.5 left-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="إغلاق التوضيح"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
          <Sparkles className="w-4 h-4 fill-emerald-500" />
          <span>{explanation.praise}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 mr-auto">
            تطابق معرفي صحيح
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium leading-relaxed pr-1 text-foreground/90">
          {explanation.text}
        </p>

        {explanation.sourceName && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 border-t border-border/40 pt-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>المصدر المعتمد: {explanation.sourceName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
