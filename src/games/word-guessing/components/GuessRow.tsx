import React from "react";
import { WORD_LENGTH } from "../constants";
import styles from "../styles/word-guessing.module.css";
import type { GuessRowData, TileStatus } from "../types";
import { LetterTile } from "./LetterTile";

interface GuessRowProps {
  rowData: GuessRowData;
  isCurrentRow: boolean;
  isWinningRow?: boolean;
}

export const GuessRow: React.FC<GuessRowProps> = ({
  rowData,
  isCurrentRow,
  isWinningRow = false,
}) => {
  const cells = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const letter = rowData.letters[i] || "";
    let status: TileStatus = "empty";

    if (rowData.isSubmitted && rowData.evaluations) {
      status = rowData.evaluations[i]?.status || "gray";
    } else if (letter) {
      status = "tapped";
    }

    cells.push(
      <LetterTile
        key={`cell-${i}`}
        letter={letter}
        status={status}
        animationDelayMs={i * 120}
        isWinningRow={isWinningRow}
      />,
    );
  }

  const shakeClass = rowData.isInvalidShake ? styles["rowShake"] : "";

  return (
    <div
      className={`flex items-center justify-center gap-1.5 sm:gap-2.5 w-full dir-rtl ${shakeClass}`}
      role="row"
      aria-current={isCurrentRow ? "true" : "false"}
    >
      {cells}
    </div>
  );
};

