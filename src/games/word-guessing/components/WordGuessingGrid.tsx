import { LetterEvaluation } from "../types";
import { evaluateGuess } from "../lib/evaluation";
import { normalizeArabicWord } from "../lib/normalization";
import type { WordGuessingWord } from "../types";

/**
 * Word guessing grid component.
 *
 * Completely isolated. Render logic only – no shared state outside this module.
 * Uses correct two-pass Arabic letter evaluation.
 */

import type { ReactNode } from "react";

/**
 * Render a single letter cell with its color status.
 */
function LetterCell({ letter: char, letterIndex, type }: {
  letter: string;
  letterIndex: number;
  type: "green" | "yellow" | "gray";
}): ReactNode {
  const colors = {
    green: "bg-easy text-easy-foreground border-2 border-easy animate-pop font-bold shadow-lg shadow-easy/25",
    yellow: "bg-hard text-hard-foreground border-2 border-hard animate-shake font-bold shadow-lg shadow-hard/25",
    gray: "border-2 border-border/50 bg-card/50 opacity-45",
  };

  const borderStyles = {
    green: "border-emerald-600",
    yellow: "border-amber-600",
    gray: "border-slate-400",
  };

  return (
    <div
      key={letterIndex}
      className={`flex-1 rounded-md text-center py-3.5 text-lg font-medium transition-all duration-200 ${colors[type]} ${borderStyles[type]} cursor-pointer`}
      style={{ direction: "rtl" }}
    >
      {char}
    </div>
  );
}

/**
 * Render the five-letter row grid for a single guess.
 */
function Row({ positionEvaluations, attemptNumber }: {
  positionEvaluations: LetterEvaluation[];
  attemptNumber: number;
}): ReactNode {
  return (
    <div className="grid grid-cols-5 gap-1.5 py-3.5">
      {positionEvaluations.map((ev, i) => (
        <LetterCell
          key={i}
          letter={ev.letter}
          letterIndex={i}
          type={ev.type}
        />
      ))}
    </div>
  );
}

/**
 * Render the on-screen keyboard with letter status highlighting.
 */
function KeyboardRow({ letters, onSelect, highlighted }: {
  letters: string[];
  onSelect: (letterIndex: number) => void;
  highlighted: Map<string, "green" | "yellow" | "gray">;
}): ReactNode {
  return (
    <div className="flex gap-2">
      {letters.map((letter, i) => (
        <div
          key={letter}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200 ${highlighted.get(letter) === "green"
            ? "bg-emerald-600 text-emerald-foreground"
            : highlighted.get(letter) === "yellow"
              ? "bg-amber-600 text-amber-foreground"
              : highlighted.get(letter) === "gray"
                ? "bg-slate-400 text-slate-foreground"
                : "bg-card text-foreground"}`}
          onClick={() => onSelect(i)}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

export { LetterCell, Row, KeyboardRow };