import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { calculatePoints } from "../lib/scoring";
import type {
  TrueFalseAnswerRecord,
  TrueFalseQuestion,
  TrueFalseResult,
  TrueFalseSetup,
} from "../types";

export type GamePhase = "playing" | "feedback" | "finished";

export interface GameState {
  questions: TrueFalseQuestion[];
  timerMs: number;
  index: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  bestStreak: number;
  phase: GamePhase;
  selected: boolean | null;
  timedOut: boolean;
  lastPoints: number;
  timeLeftMs: number;
  answers: TrueFalseAnswerRecord[];
}

type GameAction =
  | { type: "tick"; timeLeftMs: number }
  | { type: "answer"; value: boolean | null; timeLeftMs: number }
  | { type: "next" };

function createInitialState(questions: TrueFalseQuestion[], timerMs: number): GameState {
  return {
    questions,
    timerMs,
    index: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    bestStreak: 0,
    phase: "playing",
    selected: null,
    timedOut: false,
    lastPoints: 0,
    timeLeftMs: timerMs,
    answers: [],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "tick": {
      if (state.phase !== "playing") return state;
      return { ...state, timeLeftMs: Math.max(0, action.timeLeftMs) };
    }

    case "answer": {
      // Atomic guard: a second click, a late timeout, or a duplicate event
      // can never apply score twice.
      if (state.phase !== "playing") return state;

      const question = state.questions[state.index];
      if (!question) return state;

      const timedOut = action.value === null;
      const correct = action.value !== null && action.value === question.answer;
      const streakAfter = correct ? state.streak + 1 : 0;
      const points = correct
        ? calculatePoints(question, action.timeLeftMs, state.timerMs / 1000, streakAfter).total
        : 0;

      const record: TrueFalseAnswerRecord = {
        question,
        chosen: action.value,
        correct,
        timedOut,
        points,
        timeLeftMs: Math.max(0, Math.round(action.timeLeftMs)),
        streakAfter,
      };

      return {
        ...state,
        phase: "feedback",
        selected: action.value,
        timedOut,
        score: state.score + points,
        correctCount: state.correctCount + (correct ? 1 : 0),
        incorrectCount: state.incorrectCount + (correct ? 0 : 1),
        streak: streakAfter,
        bestStreak: Math.max(state.bestStreak, streakAfter),
        lastPoints: points,
        timeLeftMs: Math.max(0, action.timeLeftMs),
        answers: [...state.answers, record],
      };
    }

    case "next": {
      if (state.phase !== "feedback") return state;

      const nextIndex = state.index + 1;
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          phase: "finished",
          selected: null,
          timedOut: false,
          timeLeftMs: 0,
        };
      }

      return {
        ...state,
        index: nextIndex,
        phase: "playing",
        selected: null,
        timedOut: false,
        lastPoints: 0,
        timeLeftMs: state.timerMs,
      };
    }

    default:
      return state;
  }
}

interface UseTrueFalseGameOptions {
  questions: TrueFalseQuestion[];
  setup: TrueFalseSetup;
  onFinish: (result: TrueFalseResult) => void;
}

export function useTrueFalseGame({ questions, setup, onFinish }: UseTrueFalseGameOptions) {
  const timerMs = setup.timerSeconds * 1000;

  const [state, dispatch] = useReducer(
    gameReducer,
    { questions, timerMs },
    (init: { questions: TrueFalseQuestion[]; timerMs: number }) =>
      createInitialState(init.questions, init.timerMs),
  );

  const timeLeftRef = useRef(timerMs);
  const finishedRef = useRef(false);

  // Countdown: one interval per question, auto-timeout without freezing.
  useEffect(() => {
    if (state.phase !== "playing") return;

    const deadline = Date.now() + state.timerMs;
    const interval = setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        timeLeftRef.current = 0;
        dispatch({ type: "tick", timeLeftMs: 0 });
        dispatch({ type: "answer", value: null, timeLeftMs: 0 });
        return;
      }
      timeLeftRef.current = remaining;
      dispatch({ type: "tick", timeLeftMs: remaining });
    }, 100);

    return () => clearInterval(interval);
  }, [state.phase, state.index, state.timerMs]);

  const answer = useCallback(
    (value: boolean | null) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "answer", value, timeLeftMs: timeLeftRef.current });
    },
    [state.phase],
  );

  const next = useCallback(() => {
    if (state.phase !== "feedback") return;
    timeLeftRef.current = state.timerMs;
    dispatch({ type: "next" });
  }, [state.phase, state.timerMs]);

  const result = useMemo<TrueFalseResult>(() => {
    const total = state.answers.length;
    const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;
    return {
      score: state.score,
      correctCount: state.correctCount,
      incorrectCount: state.incorrectCount,
      total: state.questions.length,
      bestStreak: state.bestStreak,
      accuracy,
      setup,
      answers: state.answers,
    };
  }, [state, setup]);

  useEffect(() => {
    if (state.phase !== "finished" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish(result);
  }, [state.phase, result, onFinish]);

  const currentQuestion = state.questions[state.index] ?? null;
  const lastAnswer = state.answers[state.answers.length - 1] ?? null;

  return {
    state,
    currentQuestion,
    lastAnswer,
    result,
    answer,
    next,
    timeLeftMs: state.timeLeftMs,
  };
}
