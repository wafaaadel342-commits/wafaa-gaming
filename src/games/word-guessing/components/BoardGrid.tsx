import React from "react";
import { MAX_ATTEMPTS } from "../constants";
import type { GuessRowData } from "../types";
import { GuessRow } from "./GuessRow";

interface BoardGridProps {
  rows: GuessRowData[];
  currentRowIndex: number;
  winningRowIndex?: number | null;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  rows,
  currentRowIndex,
  winningRowIndex = null,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 sm:gap-2.5 w-full max-w-[340px] sm:max-w-sm mx-auto px-1 sm:px-2 py-1.5 sm:py-3 select-none"
      role="grid"
      aria-label="لوحة الكلمات"
    >
      {rows.map((row, idx) => (
        <GuessRow
          key={`row-${idx}`}
          rowData={row}
          isCurrentRow={idx === currentRowIndex}
          isWinningRow={idx === winningRowIndex}
        />
      ))}
      {/* Fill empty remaining rows up to MAX_ATTEMPTS if needed */}
      {Array.from({ length: Math.max(0, MAX_ATTEMPTS - rows.length) }).map(
        (_, i) => {
          const fakeIdx = rows.length + i;
          return (
            <GuessRow
              key={`empty-row-${fakeIdx}`}
              rowData={{ letters: [], evaluations: null, isSubmitted: false }}
              isCurrentRow={fakeIdx === currentRowIndex}
            />
          );
        },
      )}
    </div>
  );
};

