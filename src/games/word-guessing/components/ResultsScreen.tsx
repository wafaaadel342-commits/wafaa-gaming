/**
 * Results screen for Word Guessing game.
 *
 * Shows win/loss outcome, final answer, scoring, and share functionality.
 */

import { CheckCircle2, XCircle, Share2, RotateCcw, ArrowLeft, Lightbulb } from "lucide-react";
import type { WordGuessingResult } from "../types";

interface ResultsScreenProps {
  result: WordGuessingResult;
  attempts: Array<{ guess: string; isCorrect: boolean; positions: any[] }>;
  onRestart: () => void;
  onExit: () => void;
  onClose: () => void;
}

export function WordGuessingResultsScreen({
  result,
  attempts,
  onRestart,
  onExit,
  onClose,
}: ResultsScreenProps) {
  const won = result.attempts.some((a) => a.isCorrect);

  const handleShare = () => {
    const shareText = `أنا لعبت لعبة "خمن الكلمة" و ${won ? "فزت" : "خسرت"}! الكلمة كانت ${result.secretWord.word} - ${result.secretWord.meaning}`;
    if (navigator.share) {
      navigator.share({
        title: "خمن الكلمة",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
  };

  const finalAnswer = result.secretWord.word;
  const meaning = result.secretWord.meaning;
  const finalGuess = attempts[attempts.length - 1]?.guess;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-foreground">نتيجتك</h2>
          <button
            onClick={onClose}
            className="size-10 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          {won ? (
            <>
              <CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-extrabold text-emerald-600">مبارك! 🎉</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                فزت بخياطة كلمة "{finalAnswer}"
              </p>
            </>
          ) : (
            <>
              <XCircle className="size-16 text-rose-600 mx-auto mb-4" />
              <h3 className="text-2xl font-extrabold text-rose-600">حاولت بكل محاولاتك!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                كلمة السر كانت: <span className="font-bold text-foreground">{finalAnswer}</span>
              </p>
            </>
          )}
        </div>

        {/* Word info */}
        <div className="mt-6 rounded-xl bg-card/50 p-4 border border-border/50">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-primary">{finalAnswer}</p>
            <p className="mt-1 text-sm text-muted-foreground">{meaning}</p>
          </div>
        </div>

        {/* Score info */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
            <div className="text-3xl font-extrabold text-emerald-600">{won ? "1" : "0"}</div>
            <div className="text-xs text-muted-foreground mt-1">النتيجة</div>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
            <div className="text-3xl font-extrabold text-blue-600">{attempts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">المحاولات</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            <RotateCcw className="size-4" />
            جولة جديدة
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
          >
            <ArrowLeft className="size-4" />
            العودة للقائمة
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/30 px-4 py-3 text-sm font-medium"
          >
            <Share2 className="size-4" />
            مشاركة النتيجة
          </button>
        </div>
      </div>
    </div>
  );
}