import type { AbacusQuestionWithAnswer } from "./types";

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

const ROWS_BY_LEVEL: Record<string, number> = {
  "LEVEL 1": 2,
  "LEVEL 2": 3,
  "LEVEL 3": 3,
  "LEVEL 4": 4,
  "LEVEL 5": 5,
};

const MAX_BY_LEVEL: Record<string, number> = {
  "LEVEL 1": 20,
  "LEVEL 2": 50,
  "LEVEL 3": 99,
  "LEVEL 4": 999,
  "LEVEL 5": 9999,
};

export function generateQuestions(
  testId: string,
  level: string,
  totalQuestions: number
): AbacusQuestionWithAnswer[] {
  const rand = mulberry32(hashSeed(testId));
  const rows = ROWS_BY_LEVEL[level] ?? 3;
  const max = MAX_BY_LEVEL[level] ?? 99;
  const min = Math.max(1, Math.floor(max * 0.1));

  const questions: AbacusQuestionWithAnswer[] = [];
  for (let qNo = 1; qNo <= totalQuestions; qNo++) {
    const values: number[] = [];
    const signs: number[] = [];
    let running = 0;

    for (let r = 0; r < rows; r++) {
      const v = min + Math.floor(rand() * (max - min + 1));
      // First row always positive (it's the starting number).
      // Later rows are randomly added or subtracted, but never let the
      // running total drop below zero (matches real abacus drills).
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
  return questions;
}
