// The six practice levels a centre can assign to students and build test
// links from. Levels are centre-only: students never see a level number or
// name - they just get a test, labelled by what it contains (`testLabel`).
//
// The ladder adds one new skill per step, starting from single-digit
// add/subtract and ending with every operation at its largest size:
//   1  add/subtract, 1-digit
//   2  add/subtract, 2-digit
//   3  + 4-row add/subtract, and multiplication/division tables (1 x 1)
//   4  + 3-digit add/subtract, and 2 x 1 multiplication/division
//   5  + 3 x 1 multiplication
//   6  + 3 x 1 division - every operation at full size

import type { OperationType } from "./testTypes";
import type { QuestionKind } from "./types";

export interface LevelSection {
  kind: QuestionKind;
  digits: 1 | 2 | 3; // size of the first number (add/sub: every number)
  rows?: number; // add/sub only: numbers per question
  percent: number; // share of the test's questions; a level's sections sum to 100
}

export interface LevelDef {
  level: number;
  name: string; // shown to the centre only
  description: string; // shown to the centre only
  /** What the student sees instead of a level - on the instructions page
   * and in their results. Deliberately says nothing about rank. */
  testLabel: string;
  // How the finished test is recorded, so it fits the existing
  // operation/variant fields (a level with several kinds is "mixed").
  operation: OperationType;
  variant: string;
  sections: LevelSection[];
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    name: "Foundation",
    description: "Single-digit addition and subtraction - building the basic bead movements.",
    testLabel: "Addition & Subtraction (1-Digit)",
    operation: "addition_subtraction",
    variant: "1-digit",
    sections: [{ kind: "addition_subtraction", digits: 1, rows: 3, percent: 100 }],
  },
  {
    level: 2,
    name: "Beginner",
    description: "Two-digit addition and subtraction.",
    testLabel: "Addition & Subtraction (2-Digit)",
    operation: "addition_subtraction",
    variant: "2-digit",
    sections: [{ kind: "addition_subtraction", digits: 2, rows: 3, percent: 100 }],
  },
  {
    level: 3,
    name: "Developing",
    description:
      "Longer two-digit add/subtract sums, plus the first multiplication and division (single digit by single digit).",
    testLabel: "Mixed Operations (Basic)",
    operation: "mixed",
    variant: "2-digit",
    sections: [
      { kind: "addition_subtraction", digits: 2, rows: 4, percent: 50 },
      { kind: "multiplication", digits: 1, percent: 25 },
      { kind: "division", digits: 1, percent: 25 },
    ],
  },
  {
    level: 4,
    name: "Intermediate",
    description: "Three-digit add/subtract sums, with two-digit by one-digit multiplication and division.",
    testLabel: "Mixed Operations (Intermediate)",
    operation: "mixed",
    variant: "3-digit",
    sections: [
      { kind: "addition_subtraction", digits: 3, rows: 3, percent: 50 },
      { kind: "multiplication", digits: 2, percent: 25 },
      { kind: "division", digits: 2, percent: 25 },
    ],
  },
  {
    level: 5,
    name: "Advanced",
    description:
      "Four-row three-digit add/subtract sums, with three-digit multiplication and two-digit division.",
    testLabel: "Mixed Operations (Advanced)",
    operation: "mixed",
    variant: "3-digit",
    sections: [
      { kind: "addition_subtraction", digits: 3, rows: 4, percent: 40 },
      { kind: "multiplication", digits: 3, percent: 30 },
      { kind: "division", digits: 2, percent: 30 },
    ],
  },
  {
    level: 6,
    name: "Master",
    description: "Every operation at its largest size - the full mix of the hardest add/subtract, multiplication and division.",
    testLabel: "Mixed Operations (Expert)",
    operation: "mixed",
    variant: "3-digit",
    sections: [
      { kind: "addition_subtraction", digits: 3, rows: 4, percent: 34 },
      { kind: "multiplication", digits: 3, percent: 33 },
      { kind: "division", digits: 3, percent: 33 },
    ],
  },
];

export const DEFAULT_LEVEL = 1;

export function isValidLevel(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= LEVELS.length;
}

export function getLevel(n: number): LevelDef {
  return LEVELS.find((l) => l.level === n) ?? LEVELS[0];
}

/** "Level 3 - Developing", for the centre's screens. */
export function levelTitle(n: number): string {
  const def = getLevel(n);
  return `Level ${def.level} - ${def.name}`;
}

const KIND_NAMES: Record<QuestionKind, string> = {
  addition_subtraction: "Add / Subtract",
  multiplication: "Multiplication",
  division: "Division",
};

/** One line describing a section for the centre, e.g.
 * "Add / Subtract - 3-digit, 4 rows". */
export function describeSection(s: LevelSection): string {
  if (s.kind === "addition_subtraction") {
    return `${KIND_NAMES[s.kind]} - ${s.digits}-digit, ${s.rows ?? 3} rows`;
  }
  const symbol = s.kind === "multiplication" ? "x" : "/";
  return `${KIND_NAMES[s.kind]} - ${s.digits}-digit ${symbol} 1-digit`;
}

/** A student's stored level ("LEVEL 4") as a number; anything unreadable is
 * level 1, so older accounts never break the page. */
export function levelFromStored(stored: string | undefined): number {
  const n = Number(/\d+/.exec(stored ?? "")?.[0]);
  return isValidLevel(n) ? n : DEFAULT_LEVEL;
}

export function levelToStored(n: number): string {
  return `LEVEL ${n}`;
}

/** Reads a level a person typed or a spreadsheet held - "3", 3, "Level 3",
 * "L3" - returning undefined when it isn't one of the six. */
export function parseLevelInput(value: unknown): number | undefined {
  const match = /^(?:level|lvl|l)?\s*(\d)$/i.exec(String(value ?? "").trim());
  if (!match) return undefined;
  const n = Number(match[1]);
  return isValidLevel(n) ? n : undefined;
}

/** Strips everything that would reveal a level from a session/result before
 * it's sent to a student's browser. */
export function hideCentreFields<T extends { level: string; testLevel?: number; linkId?: string }>(
  item: T
): T {
  return { ...item, level: "", testLevel: undefined, linkId: undefined };
}
