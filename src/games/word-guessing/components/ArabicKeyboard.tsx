import { CornerDownLeft, Delete } from "lucide-react";
import React from "react";
import { ARABIC_KEYBOARD_ROWS } from "../constants";
import styles from "../styles/word-guessing.module.css";
import type { KeyboardKeyStatus } from "../types";

interface ArabicKeyboardProps {
  keyStatuses: Record<string, KeyboardKeyStatus>;
  onKeyPress: (char: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export const ArabicKeyboard: React.FC<ArabicKeyboardProps> = ({
  keyStatuses,
  onKeyPress,
  onEnter,
  onBackspace,
  disabled = false,
}) => {
  const getKeyStyle = (char: string) => {
    const status = keyStatuses[char] || "default";

    if (status === "green") {
      return "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs";
    }
    if (status === "yellow") {
      return "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-xs";
    }
    if (status === "gray") {
      return "bg-slate-400 dark:bg-slate-700/80 text-white/90 border-slate-400 dark:border-slate-700";
    }

    return "bg-muted/90 hover:bg-muted text-foreground border-border/70 hover:border-border";
  };

  return (
    <div
      className="w-full max-w-lg mx-auto flex flex-col gap-1 sm:gap-2 px-0.5 xs:px-1 sm:px-2 pt-1 sm:pt-2 pb-2 sm:pb-4 select-none touch-manipulation"
      dir="rtl"
      role="group"
      aria-label="لوحة المفاتيح العربية"
    >
      {/* Row 1 */}
      <div className="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
        {ARABIC_KEYBOARD_ROWS[0]?.map((char) => (
          <button
            key={`key-${char}`}
            type="button"
            disabled={disabled}
            onClick={() => onKeyPress(char)}
            className={`flex-1 min-w-0 max-w-[38px] sm:max-w-[44px] h-9 xs:h-10 sm:h-12 rounded-lg sm:rounded-xl font-bold text-xs xs:text-sm sm:text-base md:text-lg flex items-center justify-center border transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none p-0 ${styles["keyBase"]} ${getKeyStyle(
              char,
            )}`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 w-full px-1 sm:px-2">
        {ARABIC_KEYBOARD_ROWS[1]?.map((char) => (
          <button
            key={`key-${char}`}
            type="button"
            disabled={disabled}
            onClick={() => onKeyPress(char)}
            className={`flex-1 min-w-0 max-w-[38px] sm:max-w-[44px] h-9 xs:h-10 sm:h-12 rounded-lg sm:rounded-xl font-bold text-xs xs:text-sm sm:text-base md:text-lg flex items-center justify-center border transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none p-0 ${styles["keyBase"]} ${getKeyStyle(
              char,
            )}`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 3 with Enter & Backspace */}
      <div className="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 w-full">
        {/* Enter Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className={`flex-[1.5] min-w-0 h-9 xs:h-10 sm:h-12 px-1 xs:px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[11px] xs:text-xs sm:text-sm flex items-center justify-center gap-0.5 sm:gap-1 border border-primary transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none ${styles["keyBase"]}`}
          title="تأكيد التخمين"
          aria-label="تأكيد"
        >
          <CornerDownLeft className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span>إدخال</span>
        </button>

        {ARABIC_KEYBOARD_ROWS[2]?.map((char) => (
          <button
            key={`key-${char}`}
            type="button"
            disabled={disabled}
            onClick={() => onKeyPress(char)}
            className={`flex-1 min-w-0 max-w-[38px] sm:max-w-[44px] h-9 xs:h-10 sm:h-12 rounded-lg sm:rounded-xl font-bold text-xs xs:text-sm sm:text-base md:text-lg flex items-center justify-center border transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none p-0 ${styles["keyBase"]} ${getKeyStyle(
              char,
            )}`}
          >
            {char}
          </button>
        ))}

        {/* Backspace Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className={`flex-[1.3] min-w-0 h-9 xs:h-10 sm:h-12 px-1 xs:px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] xs:text-xs flex items-center justify-center border border-border transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${styles["keyBase"]}`}
          title="مسح الحرف"
          aria-label="مسح"
        >
          <Delete className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
};

