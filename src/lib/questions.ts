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
  // Rows per addition_subtraction question (2, 3, or 4). Ignored by every
  // other operation - Mixed picks its own varying row count internally.
  rows?: number;
}

function digitRange(digits: 2 | 3): [number, number] {
  return digits === 3 ? [100, 999] : [10, 99];
}

type Row = { values: number[]; signs: number[]; answer: number };

/** A running-total add/subtract question across `rows` operands. The
 * first row is always positive (the starting number); every later row is
 * randomly added or subtracted, but subtraction is only ever chosen when
 * it keeps the running total strictly positive - so a student's abacus
 * never has to represent a negative number at any step, not just in the
 * final answer. */
function generateAddSubRow(rand: () => number, digits: 2 | 3, rows: number): Row {
  const [min, max] = digitRange(digits);
  const values: number[] = [];
  const signs: number[] = [];
  let running = 0;

  for (let r = 0; r < rows; r++) {
    const v = min + Math.floor(rand() * (max - min + 1));
    let sign = 1;
    if (r > 0) {
      const canSubtract = running - v > 0;
      sign = canSubtract && rand() < 0.5 ? -1 : 1;
    }
    values.push(v);
    signs.push(sign);
    running += sign * v;
  }

  return { values, signs, answer: running };
}

function generateMultiplicationRow(rand: () => number, digits: 2 | 3): Row {
  const [min, max] = digitRange(digits);
  const a = min + Math.floor(rand() * (max - min + 1));
  const b = 2 + Math.floor(rand() * 8); // 2-9, avoids trivial x0/x1
  return { values: [a, b], signs: [1, 1], answer: a * b };
}

/** A dividend (2 or 3 digits) that divides evenly by a single-digit
 * divisor (2-9), so the answer is always a whole number. */
function generateDivisionRow(rand: () => number, digits: 2 | 3): Row {
  const [min, max] = digitRange(digits);
  const divisor = 2 + Math.floor(rand() * 8); // 2-9
  const minQuotient = Math.max(2, Math.ceil(min / divisor));
  const maxQuotient = Math.floor(max / divisor);
  const quotient =
    minQuotient + Math.floor(rand() * (maxQuotient - minQuotient + 1));
  const dividend = divisor * quotient;
  return { values: [dividend, divisor], signs: [1, 1], answer: quotient };
}

// For a "mixed" test: roughly the first 60% of questions are add/subtract
// running totals (a varying 2-4 rows each, for a more realistic paper feel
// instead of always the same shape), and the rest are multiplication.
const MIXED_ADD_SUB_SHARE = 0.6;

export function generateQuestions({
  testId,
  operation,
  variant,
  totalQuestions,
  rows: rowsInput,
}: GenerateParams): AbacusQuestionWithAnswer[] {
  const rand = mulberry32(hashSeed(testId));
  const questions: AbacusQuestionWithAnswer[] = [];

  for (let qNo = 1; qNo <= totalQuestions; qNo++) {
    if (operation === "multiplication") {
      const row = generateMultiplicationRow(rand, variant === "3x1" ? 3 : 2);
      questions.push({ qNo, ...row });
    } else if (operation === "division") {
      const row = generateDivisionRow(rand, variant === "3x1" ? 3 : 2);
      questions.push({ qNo, ...row });
    } else if (operation === "mixed") {
      const digits = variant === "3-digit" ? 3 : 2;
      const isAddSub = qNo <= Math.round(totalQuestions * MIXED_ADD_SUB_SHARE);
      if (isAddSub) {
        const rows = 2 + Math.floor(rand() * 3); // 2, 3, or 4 rows
        const row = generateAddSubRow(rand, digits, rows);
        questions.push({ qNo, ...row, opKind: "addition_subtraction" });
      } else {
        const row = generateMultiplicationRow(rand, digits);
        questions.push({ qNo, ...row, opKind: "multiplication" });
      }
    } else {
      // addition_subtraction: a running total across the chosen row count
      // (2, 3, or 4 operands), defaulting to 3 if not specified.
      const rows = rowsInput === 2 || rowsInput === 4 ? rowsInput : 3;
      const row = generateAddSubRow(rand, variant === "3-digit" ? 3 : 2, rows);
      questions.push({ qNo, ...row });
    }
  }

  return questions;
}
