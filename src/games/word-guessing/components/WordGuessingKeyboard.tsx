/**
 * Arabic on-screen keyboard for Word Guessing game.
 *
 * Completely isolated component. RTL layout, letter status highlighting,
 * physical keyboard support, mobile touch support.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LetterEvaluation } from "../types";

const ARABIC_ROWS = [
  ["ء", "آ", "أ", "ؤ", "ئ", "ا", "ب", "ة", "ت", "ث"],
  ["ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص"],
  ["ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م"],
  ["ن", "ه", "و", "ى", "ي", "ـ", "", "", "", ""],
];

const ARABIC_ROWS_COMPACT = [
  ["ا", "ب", "ت", "ث", "ج", "ح", "خ"],
  ["د", "ذ", "ر", "ز", "س", "ش", "ص"],
  ["ض", "ط", "ظ", "ع", "غ", "ف", "ق"],
  ["ك", "ل", "م", "ن", "ه", "و", "ى", "ي"],
];

const KEY_WIDTH = "calc((100% - 12px) / 7)";
const ROW_GAP = "8px";

interface WordGuessingKeyboardProps {
  letterStatus: Map<string, "green" | "yellow" | "gray">;
  onLetterClick: (letter: string) => void;
  onEnterClick: () => void;
  onBackspaceClick: () => void;
  disabled?: boolean;
}

export function WordGuessingKeyboard({
  letterStatus,
  onLetterClick,
  onEnterClick,
  onBackspaceClick,
  disabled = false,
}: WordGuessingKeyboardProps) {
  const [keyPressed, setKeyPressed] = useState<string | null>(null);
  const keyRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      const key = e.key;
      if (key === "Enter") {
        e.preventDefault();
        onEnterClick();
        return;
      }
      if (key === "Backspace" || key === "Delete") {
        e.preventDefault();
        onBackspaceClick();
        return;
      }

      // Arabic letters
      const arabicLetters = [
        "ا", "ب", "ت", "ث", "ج", "ح", "خ",
        "د", "ذ", "ر", "ز", "س", "ش", "ص",
        "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
        "ك", "ل", "م", "ن", "ه", "و", "ى", "ي",
      ];
      if (arabicLetters.includes(key)) {
        e.preventDefault();
        onLetterClick(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onLetterClick, onEnterClick, onBackspaceClick]);

  const handleKeyDown = useCallback((letter: string) => {
    if (disabled) return;
    setKeyPressed(letter);
    setTimeout(() => setKeyPressed(null), 100);
  }, [disabled]);

  const keyStyles = useMemo(
    () => ({
      base: `w-full rounded-lg text-sm font-medium transition-all duration-100 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
      }`,
      green: "bg-emerald-600 text-emerald-foreground",
      yellow: "bg-amber-600 text-amber-foreground",
      gray: "bg-slate-400 text-slate-foreground",
      default: "bg-card text-foreground border border-border/50",
      pressed: "ring-2 ring-primary/50",
    }),
    [disabled]
  );

  const getKeyColor = useCallback(
    (letter: string) => {
      const status = letterStatus.get(letter);
      if (status === "green") return keyStyles.green;
      if (status === "yellow") return keyStyles.yellow;
      if (status === "gray") return keyStyles.gray;
      return keyStyles.default;
    },
    [letterStatus, keyStyles]
  );

  const renderKey = useCallback(
    (letter: string, isAction = false) => {
      if (!letter && !isAction) return null;

      const statusColor = isAction ? keyStyles.default : getKeyColor(letter);
      const pressed = keyPressed === letter;
      const ref = keyRefs.current.get(letter);

      return (
        <button
          ref={(el) => {
            if (el) keyRefs.current.set(letter, el);
          }}
          key={letter}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!isAction && !disabled) {
              onLetterClick(letter);
            } else if (isAction && letter === "Enter" && !disabled) {
              onEnterClick();
            } else if (isAction && letter === "Backspace" && !disabled) {
              onBackspaceClick();
            }
          }}
          onMouseDown={() => handleKeyDown(letter)}
          onMouseUp={() => setKeyPressed(null)}
          onMouseLeave={() => setKeyPressed(null)}
          className={`${keyStyles.base} ${statusColor} ${pressed ? keyStyles.pressed : ""} py-2.5 min-h-[44px] flex items-center justify-center`}
          style={{
            minWidth: isAction ? "calc(50% - 4px)" : "calc((100% - 48px) / 7)",
          }}
          aria-label={letter || (isAction ? "إدخال" : "مسح")}
        >
          {letter}
        </button>
      );
    },
    [disabled, keyStyles, getKeyColor, onLetterClick, onEnterClick, onBackspaceClick, handleKeyDown]
  );

  return (
    <div className="flex flex-col gap-2 p-2" dir="rtl" style={{ direction: "rtl" }}>
      {ARABIC_ROWS_COMPACT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center">
          {row.map((letter) => renderKey(letter))}
        </div>
      ))}

      {/* Action keys row */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnterClick}
          className={`${keyStyles.base} ${keyStyles.default} py-2.5 min-h-[44px] flex items-center justify-center min-w-[80px]`}
          aria-label="إدخال"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspaceClick}
          className={`${keyStyles.base} ${keyStyles.default} py-2.5 min-h-[44px] flex items-center justify-center min-w-[80px]`}
          aria-label="مسح"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}