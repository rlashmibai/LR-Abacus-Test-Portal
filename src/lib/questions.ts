import type { AbacusQuestionWithAnswer } from "./types";
import type { OperationType } from "./testTypes";

// Simple deterministic PRNG (mulberry32) so a given testId always
// regenerates the same question set (survives a page refresh).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

interface GenerateParams {
  testId: string;
  operation: OperationType;
  variant: string;
  totalQuestions: number;
}

function digitRange(digits: 2 | 3): [number, number] {
  return digits === 3 ? [100, 999] : [10, 99];
}

export function generateQuestions({
  testId,
  operation,
  variant,
  totalQuestions,
}: GenerateParams): AbacusQuestionWithAnswer[] {
  const rand = mulberry32(hashSeed(testId));
  const questions: AbacusQuestionWithAnswer[] = [];

  for (let qNo = 1; qNo <= totalQuestions; qNo++) {
    if (operation === "multiplication") {
      const [min, max] = digitRange(variant === "3x1" ? 3 : 2);
      const a = min + Math.floor(rand() * (max - min + 1));
      const b = 2 + Math.floor(rand() * 8); // 2-9, avoids trivial x0/x1
      questions.push({ qNo, values: [a, b], signs: [1, 1], answer: a * b });
    } else if (operation === "division") {
      // "2x1": a 2-digit dividend split evenly by a single-digit divisor.
      const divisor = 2 + Math.floor(rand() * 8); // 2-9
      const minQuotient = Math.max(2, Math.ceil(10 / divisor));
      const maxQuotient = Math.floor(99 / divisor);
      const quotient =
        minQuotient + Math.floor(rand() * (maxQuotient - minQuotient + 1));
      const dividend = divisor * quotient;
      questions.push({
        qNo,
        values: [dividend, divisor],
        signs: [1, 1],
        answer: quotient,
      });
    } else {
      // addition_subtraction: a running total across 3 rows.
      const [min, max] = digitRange(variant === "3-digit" ? 3 : 2);
      const rows = 3;
      const values: number[] = [];
      const signs: number[] = [];
      let running = 0;

      for (let r = 0; r < rows; r++) {
        const v = min + Math.floor(rand() * (max - min + 1));
        // First row is always positive (the starting number). Later rows
        // are randomly added or subtracted, but never let the running
        // total drop too far negative.
        let sign = 1;
        if (r > 0) {
          sign = rand() < 0.5 && running - v >= -Math.floor(max / 2) ? -1 : 1;
        }
        values.push(v);
        signs.push(sign);
        running += sign * v;
      }

      questions.push({ qNo, values, signs, answer: running });
    }
  }

  return questions;
}
