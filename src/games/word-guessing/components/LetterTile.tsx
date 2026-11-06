import React from "react";
import styles from "../styles/word-guessing.module.css";
import type { TileStatus } from "../types";

interface LetterTileProps {
  letter: string;
  status: TileStatus;
  animationDelayMs?: number;
  isWinningRow?: boolean;
}

export const LetterTile: React.FC<LetterTileProps> = ({
  letter,
  status,
  animationDelayMs = 0,
  isWinningRow = false,
}) => {
  const isEvaluated =
    status === "green" || status === "yellow" || status === "gray";
  const hasLetter = Boolean(letter);

  let colorClasses =
    "border-2 border-border/70 bg-card/60 text-foreground";

  if (isEvaluated) {
    if (status === "green") {
      colorClasses =
        "border-2 border-emerald-600 bg-emerald-600 text-white shadow-xs";
    } else if (status === "yellow") {
      colorClasses =
        "border-2 border-amber-500 bg-amber-500 text-white shadow-xs";
    } else if (status === "gray") {
      colorClasses =
        "border-2 border-slate-500 bg-slate-500 text-white dark:border-slate-700 dark:bg-slate-700";
    }
  } else if (hasLetter) {
    colorClasses =
      "border-2 border-foreground/50 bg-card text-foreground shadow-xs";
  }

  const animationClass = isWinningRow
    ? styles["rowWinBounce"]
    : isEvaluated
      ? styles["tileFlip"]
      : hasLetter
        ? styles["tilePop"]
        : "";

  return (
    <div
      className={`aspect-square w-full max-w-[62px] min-w-[42px] sm:min-w-[52px] text-xl sm:text-2xl md:text-3xl ${styles["tileBase"]} ${colorClasses} ${animationClass}`}
      style={{
        animationDelay: isEvaluated ? `${animationDelayMs}ms` : undefined,
      }}
      aria-label={
        hasLetter
          ? `${letter}${isEvaluated ? ` (${status})` : ""}`
          : "خانة فارغة"
      }
    >
      <span className="translate-y-[-1px] font-black">{letter}</span>
    </div>
  );
};

