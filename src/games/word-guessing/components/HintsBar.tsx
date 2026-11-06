import { BookOpen, HelpCircle, KeyRound, Sparkles } from "lucide-react";
import React from "react";
import type { HintUsage, TargetWordItem } from "../types";

interface HintsBarProps {
  secretWord: TargetWordItem;
  hintUsage: HintUsage;
  onRevealCategory: () => void;
  onRevealClue: () => void;
  onRevealLetter: () => void;
  disabled?: boolean;
}

export const HintsBar: React.FC<HintsBarProps> = ({
  secretWord,
  hintUsage,
  onRevealCategory,
  onRevealClue,
  onRevealLetter,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-1.5 px-1 sm:px-2 py-0.5 sm:py-1 select-none">
      {/* Revealed Info Banners */}
      {(hintUsage.revealedCategory || hintUsage.revealedClue) && (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-xs flex flex-col gap-0.5 sm:gap-1 text-foreground animate-in fade-in">
          {hintUsage.revealedCategory && (
            <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] sm:text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>المجال: {secretWord.category}</span>
            </div>
          )}
          {hintUsage.revealedClue && (
            <div className="flex items-start gap-1.5 text-foreground/90 font-medium text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>تلميح: {secretWord.hint || secretWord.meaning}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
        {!hintUsage.revealedCategory && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRevealCategory}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] sm:text-[11px] font-bold border border-border/60 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-primary" />
            <span>كشف المجال</span>
          </button>
        )}

        {!hintUsage.revealedClue && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRevealClue}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] sm:text-[11px] font-bold border border-border/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>تلميح المعنى</span>
          </button>
        )}

        {hintUsage.revealedLetterIndex === null && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRevealLetter}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] sm:text-[11px] font-bold border border-border/60 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-emerald-500" />
            <span>كشف حرف</span>
          </button>
        )}
      </div>
    </div>
  );
};

