import { useEffect, useState } from "react";
import { VERIFIED_QUESTIONS } from "../data/questions";
import { dedupeQuestions } from "../lib/questions";
import { readApprovedQuestions } from "../services/firebase";
import type { TrueFalseQuestion } from "../types";

/**
 * Starts with the approved local bank immediately, then merges approved
 * questions from the game's dedicated Firestore collection in the background.
 * Gameplay never waits for the network request.
 */
export function useQuestionBank(): {
  bank: TrueFalseQuestion[];
  remoteCount: number;
} {
  const [bank, setBank] = useState<TrueFalseQuestion[]>(VERIFIED_QUESTIONS);
  const [remoteCount, setRemoteCount] = useState(0);

  useEffect(() => {
    let active = true;

    readApprovedQuestions()
      .then((remote) => {
        if (!active || remote.length === 0) return;
        setRemoteCount(remote.length);
        setBank(dedupeQuestions([...remote, ...VERIFIED_QUESTIONS]));
      })
      .catch(() => {
        // Dedicated collection may not be provisioned yet; the local verified
        // bank keeps the game fully playable.
      });

    return () => {
      active = false;
    };
  }, []);

  return { bank, remoteCount };
}
