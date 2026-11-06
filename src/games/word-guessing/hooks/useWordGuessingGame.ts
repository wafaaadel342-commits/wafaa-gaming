import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_ATTEMPTS, WORD_LENGTH } from "../constants";
import { getCairoDateKey, getDailySecretWord } from "../lib/daily";
import { evaluateGuess, updateKeyboardStatuses as updateKeyStatuses } from "../lib/evaluation";
import {
  getLettersArray,
  normalizeArabic,
} from "../lib/normalization";
import {
  loadDailyState,
  loadPlayerStats,
  recordGameStats,
  saveDailyState,
} from "../lib/storage";
import {
  getRandomPracticeWord,
  getTargetWordById,
  isValidGuess,
} from "../lib/word-bank-loader";
import { logWordGuessingSession } from "../services/firebase-service";
import type {
  GameMode,
  GamePlayStatus,
  GameResultPayload,
  GuessRowData,
  HintUsage,
  KeyboardKeyStatus,
  LetterEvaluation,
  PlayerStats,
  TargetWordItem,
} from "../types";

const INITIAL_ROWS: GuessRowData[] = Array.from({ length: MAX_ATTEMPTS }, () => ({
  letters: [],
  evaluations: null,
  isSubmitted: false,
}));

const INITIAL_HINT_USAGE: HintUsage = {
  revealedCategory: false,
  revealedClue: false,
  revealedLetterIndex: null,
};

export function useWordGuessingGame(initialMode: GameMode = "daily") {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [dateKey, setDateKey] = useState<string>(getCairoDateKey());
  const [secretWord, setSecretWord] = useState<TargetWordItem>(() =>
    getDailySecretWord(getCairoDateKey()),
  );

  const [rows, setRows] = useState<GuessRowData[]>(INITIAL_ROWS);
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [keyStatuses, setKeyStatuses] = useState<
    Record<string, KeyboardKeyStatus>
  >({});
  const [gameStatus, setGameStatus] = useState<GamePlayStatus>("playing");
  const [winningRowIndex, setWinningRowIndex] = useState<number | null>(null);

  const [hintUsage, setHintUsage] = useState<HintUsage>(INITIAL_HINT_USAGE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

  const [resultPayload, setResultPayload] = useState<GameResultPayload | null>(
    null,
  );
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() =>
    loadPlayerStats(initialMode === "daily"),
  );

  const startTimeRef = useRef<number>(Date.now());

  // Show auto-dismissing toast notification
  const showToast = useCallback(
    (msg: string) => {
      if (toastTimeout) clearTimeout(toastTimeout);
      setToastMessage(msg);
      const to = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      setToastTimeout(to);
    },
    [toastTimeout],
  );

  // Initialize or restart a game session
  const initRound = useCallback(
    (selectedMode: GameMode, practiceWord?: TargetWordItem) => {
      setMode(selectedMode);
      setPlayerStats(loadPlayerStats(selectedMode === "daily"));
      setToastMessage(null);
      setWinningRowIndex(null);
      setHintUsage(INITIAL_HINT_USAGE);
      startTimeRef.current = Date.now();

      if (selectedMode === "daily") {
        const todayKey = getCairoDateKey();
        setDateKey(todayKey);
        const dailyState = loadDailyState();

        const target = dailyState?.secretWordId
          ? (getTargetWordById(dailyState.secretWordId) ??
            getDailySecretWord(todayKey))
          : getDailySecretWord(todayKey);

        setSecretWord(target);

        // Replay previous guesses if any
        if (dailyState && dailyState.guesses.length > 0) {
          const newRows: GuessRowData[] = Array.from(
            { length: MAX_ATTEMPTS },
            () => ({
              letters: [],
              evaluations: null,
              isSubmitted: false,
            }),
          );

          let updatedKeys: Record<string, KeyboardKeyStatus> = {};
          const evaluationsGrid: LetterEvaluation[][] = [];

          dailyState.guesses.forEach((guessStr, idx) => {
            const evals = evaluateGuess(guessStr, target.normalized);
            newRows[idx] = {
              letters: getLettersArray(guessStr),
              evaluations: evals,
              isSubmitted: true,
            };
            updatedKeys = updateKeyStatuses(updatedKeys, evals);
            evaluationsGrid.push(evals);
          });

          setRows(newRows);
          setKeyStatuses(updatedKeys);
          setCurrentGuess([]);

          if (dailyState.completed) {
            setCurrentRowIndex(dailyState.guesses.length);
            setGameStatus(dailyState.won ? "won" : "lost");
            if (dailyState.won) {
              setWinningRowIndex(dailyState.guesses.length - 1);
            }
            const payload: GameResultPayload = {
              mode: "daily",
              dateKey: todayKey,
              won: dailyState.won,
              attemptsCount: dailyState.solvedInAttempts || dailyState.guesses.length,
              secretWord: target,
              guesses: dailyState.guesses,
              evaluationsGrid,
              timeElapsedSeconds: Math.floor(
                (Date.now() - (dailyState.timestamp || Date.now())) / 1000,
              ),
            };
            setResultPayload(payload);
            setShowResultModal(true);
          } else {
            setCurrentRowIndex(dailyState.guesses.length);
            setGameStatus("playing");
            setResultPayload(null);
            setShowResultModal(false);
          }
        } else {
          // Fresh daily puzzle
          setRows(
            Array.from({ length: MAX_ATTEMPTS }, () => ({
              letters: [],
              evaluations: null,
              isSubmitted: false,
            })),
          );
          setKeyStatuses({});
          setCurrentRowIndex(0);
          setCurrentGuess([]);
          setGameStatus("playing");
          setResultPayload(null);
          setShowResultModal(false);
        }
      } else {
        // Practice Mode
        const target = practiceWord ?? getRandomPracticeWord();
        setSecretWord(target);
        setRows(
          Array.from({ length: MAX_ATTEMPTS }, () => ({
            letters: [],
            evaluations: null,
            isSubmitted: false,
          })),
        );
        setKeyStatuses({});
        setCurrentRowIndex(0);
        setCurrentGuess([]);
        setGameStatus("playing");
        setResultPayload(null);
        setShowResultModal(false);
      }
    },
    [],
  );

  // Initialize on mount
  useEffect(() => {
    initRound(initialMode);
  }, [initRound, initialMode]);

  // Handle typing an Arabic letter
  const handleKeyPress = useCallback(
    (char: string) => {
      if (gameStatus !== "playing") return;
      if (currentGuess.length >= WORD_LENGTH) return;

      const normalizedChar = normalizeArabic(char);
      if (!normalizedChar) return;

      const nextGuess = [...currentGuess, normalizedChar];
      setCurrentGuess(nextGuess);

      setRows((prev) => {
        const copy = [...prev];
        const currentRow = copy[currentRowIndex];
        if (currentRow) {
          copy[currentRowIndex] = {
            ...currentRow,
            letters: nextGuess,
          };
        }
        return copy;
      });
    },
    [currentGuess, currentRowIndex, gameStatus],
  );

  // Handle backspace / delete
  const handleBackspace = useCallback(() => {
    if (gameStatus !== "playing") return;
    if (currentGuess.length === 0) return;

    const nextGuess = currentGuess.slice(0, -1);
    setCurrentGuess(nextGuess);

    setRows((prev) => {
      const copy = [...prev];
      const currentRow = copy[currentRowIndex];
      if (currentRow) {
        copy[currentRowIndex] = {
          ...currentRow,
          letters: nextGuess,
        };
      }
      return copy;
    });
  }, [currentGuess, currentRowIndex, gameStatus]);

  // Handle submitting a guess
  const handleSubmitGuess = useCallback(() => {
    if (gameStatus !== "playing") return;

    // Check letter count
    if (currentGuess.length < WORD_LENGTH) {
      showToast("أكمل ٥ حروف أولاً للكلمة");
      setRows((prev) => {
        const copy = [...prev];
        const currentRow = copy[currentRowIndex];
        if (currentRow) {
          copy[currentRowIndex] = { ...currentRow, isInvalidShake: true };
        }
        return copy;
      });
      setTimeout(() => {
        setRows((prev) => {
          const copy = [...prev];
          const currentRow = copy[currentRowIndex];
          if (currentRow) {
            copy[currentRowIndex] = { ...currentRow, isInvalidShake: false };
          }
          return copy;
        });
      }, 600);
      return;
    }

    const guessStr = currentGuess.join("");

    // Validate against dictionary
    if (!isValidGuess(guessStr)) {
      showToast("الكلمة غير موجودة في معجم اللعبة");
      setRows((prev) => {
        const copy = [...prev];
        const currentRow = copy[currentRowIndex];
        if (currentRow) {
          copy[currentRowIndex] = { ...currentRow, isInvalidShake: true };
        }
        return copy;
      });
      setTimeout(() => {
        setRows((prev) => {
          const copy = [...prev];
          const currentRow = copy[currentRowIndex];
          if (currentRow) {
            copy[currentRowIndex] = { ...currentRow, isInvalidShake: false };
          }
          return copy;
        });
      }, 600);
      return;
    }

    // Evaluate guess
    const evals = evaluateGuess(guessStr, secretWord.normalized);
    const isWon = evals.every((e) => e.status === "green");
    const isLastAttempt = currentRowIndex === MAX_ATTEMPTS - 1;

    const updatedRows = [...rows];
    updatedRows[currentRowIndex] = {
      letters: currentGuess,
      evaluations: evals,
      isSubmitted: true,
      isInvalidShake: false,
    };
    setRows(updatedRows);

    // Update keyboard statuses
    const nextKeyStatuses = updateKeyStatuses(keyStatuses, evals);
    setKeyStatuses(nextKeyStatuses);

    // Gather evaluations grid
    const evaluationsGrid: LetterEvaluation[][] = [];
    const submittedGuesses: string[] = [];
    for (let i = 0; i <= currentRowIndex; i++) {
      const r = updatedRows[i];
      if (r?.evaluations) {
        evaluationsGrid.push(r.evaluations);
        submittedGuesses.push(r.letters.join(""));
      }
    }

    const timeElapsedSeconds = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 1000),
    );

    if (isWon) {
      setWinningRowIndex(currentRowIndex);
      setGameStatus("won");
      const updatedStats = recordGameStats(
        mode === "daily",
        true,
        currentRowIndex + 1,
        dateKey,
      );
      setPlayerStats(updatedStats);

      if (mode === "daily") {
        saveDailyState({
          dateKey,
          completed: true,
          won: true,
          guesses: submittedGuesses,
          secretWordId: secretWord.id,
          solvedInAttempts: currentRowIndex + 1,
          timestamp: Date.now(),
        });
      }

      const payload: GameResultPayload = {
        mode,
        dateKey: mode === "daily" ? dateKey : undefined,
        won: true,
        attemptsCount: currentRowIndex + 1,
        secretWord,
        guesses: submittedGuesses,
        evaluationsGrid,
        timeElapsedSeconds,
      };
      setResultPayload(payload);
      void logWordGuessingSession(payload);

      // Open results modal after animation completes
      setTimeout(() => {
        setShowResultModal(true);
      }, 1600);
    } else if (isLastAttempt) {
      setGameStatus("lost");
      const updatedStats = recordGameStats(
        mode === "daily",
        false,
        MAX_ATTEMPTS,
        dateKey,
      );
      setPlayerStats(updatedStats);

      if (mode === "daily") {
        saveDailyState({
          dateKey,
          completed: true,
          won: false,
          guesses: submittedGuesses,
          secretWordId: secretWord.id,
          solvedInAttempts: MAX_ATTEMPTS,
          timestamp: Date.now(),
        });
      }

      const payload: GameResultPayload = {
        mode,
        dateKey: mode === "daily" ? dateKey : undefined,
        won: false,
        attemptsCount: MAX_ATTEMPTS,
        secretWord,
        guesses: submittedGuesses,
        evaluationsGrid,
        timeElapsedSeconds,
      };
      setResultPayload(payload);
      void logWordGuessingSession(payload);

      setTimeout(() => {
        setShowResultModal(true);
      }, 1600);
    } else {
      // Continue next attempt
      const nextIdx = currentRowIndex + 1;
      setCurrentRowIndex(nextIdx);
      setCurrentGuess([]);

      if (mode === "daily") {
        saveDailyState({
          dateKey,
          completed: false,
          won: false,
          guesses: submittedGuesses,
          secretWordId: secretWord.id,
          solvedInAttempts: 0,
          timestamp: Date.now(),
        });
      }
    }
  }, [
    currentGuess,
    currentRowIndex,
    dateKey,
    gameStatus,
    keyStatuses,
    mode,
    rows,
    secretWord,
    showToast,
  ]);

  // In-Game Hints handlers
  const handleRevealCategory = useCallback(() => {
    setHintUsage((prev) => ({ ...prev, revealedCategory: true }));
  }, []);

  const handleRevealClue = useCallback(() => {
    setHintUsage((prev) => ({ ...prev, revealedClue: true }));
  }, []);

  const handleRevealLetter = useCallback(() => {
    if (hintUsage.revealedLetterIndex !== null) return;

    const secretLetters = getLettersArray(secretWord.normalized);
    // Find first letter index not yet correctly guessed in green
    let targetIndex = -1;
    for (let i = 0; i < secretLetters.length; i++) {
      const isAlreadyGreen = rows.some((r) => r.evaluations?.[i]?.status === "green");
      if (!isAlreadyGreen) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      targetIndex = 0;
    }

    const revealedChar = secretLetters[targetIndex] ?? "";
    setHintUsage((prev) => ({
      ...prev,
      revealedLetterIndex: targetIndex,
    }));
    showToast(`الحرف رقم ${targetIndex + 1} هو: (${revealedChar})`);
  }, [hintUsage.revealedLetterIndex, rows, secretWord.normalized, showToast]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is active or focused on an input element, do not capture
      if (showResultModal) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (/^[\u0600-\u06FF]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBackspace, handleKeyPress, handleSubmitGuess, showResultModal]);

  return {
    mode,
    dateKey,
    secretWord,
    rows,
    currentRowIndex,
    currentGuess,
    keyStatuses,
    gameStatus,
    winningRowIndex,
    hintUsage,
    toastMessage,
    resultPayload,
    showResultModal,
    setShowResultModal,
    playerStats,
    handleKeyPress,
    handleBackspace,
    handleSubmitGuess,
    handleRevealCategory,
    handleRevealClue,
    handleRevealLetter,
    initRound,
  };
}
