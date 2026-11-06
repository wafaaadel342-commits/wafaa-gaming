import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import React from "react";
import { EgyptianSymbolIcon } from "../lib/symbols-svg";
import styles from "../styles/memory-cards.module.css";
import type { MemoryCard } from "../types";
import { EgyptianCardBack } from "./EgyptianPattern";

interface CardProps {
  card: MemoryCard;
  onClick: (card: MemoryCard) => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const isRevealed = card.isFlipped || card.isMatched;

  const handleClick = () => {
    if (disabled || isRevealed) return;
    onClick(card);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`group relative aspect-[3/4] w-full min-h-[75px] xs:min-h-[90px] sm:min-h-[130px] md:min-h-[155px] cursor-pointer select-none rounded-xl sm:rounded-2xl ${styles["cardContainer"]}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isRevealed || disabled ? -1 : 0}
      aria-label={
        card.mode === "visual"
          ? isRevealed
            ? `كارت ${card.visual?.label}`
            : "كارت مقلوب"
          : isRevealed
            ? card.knowledge?.role === "question"
              ? `سؤال: ${card.knowledge?.text}`
              : `إجابة: ${card.knowledge?.text}`
            : "كارت معرفة مقلوب"
      }
    >
      <div
        className={`w-full h-full ${styles["cardInner"]} ${
          isRevealed ? styles["cardFlipped"] : ""
        } ${card.isMismatchPulse ? styles["cardMismatch"] : ""} ${
          card.isMatched ? styles["cardMatchedAnim"] : ""
        }`}
      >
        {/* Card Back (Face Down) */}
        <div className={`${styles["cardFace"]} ${styles["cardBack"]}`}>
          <EgyptianCardBack />
        </div>

        {/* Card Front (Face Up) */}
        <div
          className={`${styles["cardFace"]} ${styles["cardFront"]} rounded-xl sm:rounded-2xl flex flex-col items-center justify-between p-1.5 xs:p-2 sm:p-3 text-center border sm:border-2 transition-colors ${
            card.isMatched
              ? "bg-emerald-50/95 dark:bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-500/20"
              : "bg-amber-50/95 dark:bg-slate-900/95 border-amber-400 dark:border-amber-600 shadow-sm sm:shadow-md"
          }`}
        >
          {card.mode === "visual" && card.visual && (
            <>
              {/* Category tag & match badge */}
              <div className="w-full flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs font-semibold px-0.5 sm:px-1 text-muted-foreground leading-none">
                <span className="truncate max-w-[50px] xs:max-w-[70px] sm:max-w-[80px]">
                  {card.visual.category}
                </span>
                {card.isMatched ? (
                  <CheckCircle2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-emerald-600 animate-in zoom-in shrink-0" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 opacity-60 shrink-0" />
                )}
              </div>

              {/* Symbol illustration */}
              <div className="my-auto flex items-center justify-center p-0.5 sm:p-1 w-full overflow-hidden">
                <EgyptianSymbolIcon
                  symbolKey={card.visual.symbolKey}
                  className="w-8 h-8 xs:w-10 xs:h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Symbol label */}
              <div className="w-full">
                <span className="block truncate text-[10px] xs:text-xs sm:text-sm md:text-base font-bold text-foreground leading-tight">
                  {card.visual.label}
                </span>
              </div>
            </>
          )}

          {card.mode === "knowledge" && card.knowledge && (
            <>
              {/* Role badge */}
              <div className="w-full flex items-center justify-between text-[9px] xs:text-[10px] sm:text-xs font-bold px-0.5 sm:px-1 leading-none">
                {card.knowledge.role === "question" ? (
                  <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                    <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> سؤال
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> إجابة
                  </span>
                )}
                {card.isMatched && (
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                )}
              </div>

              {/* Question / Answer text */}
              <div className="my-auto flex items-center justify-center w-full px-0.5 sm:px-1 overflow-hidden">
                <p
                  className={`font-bold leading-tight sm:leading-snug line-clamp-3 sm:line-clamp-4 ${
                    card.knowledge.role === "question"
                      ? "text-[9px] xs:text-[11px] sm:text-sm text-foreground"
                      : "text-[10px] xs:text-xs sm:text-base md:text-lg text-primary font-black"
                  }`}
                >
                  {card.knowledge.text}
                </p>
              </div>

              {/* Category footer */}
              <div className="w-full text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground truncate leading-none">
                {card.knowledge.category}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
