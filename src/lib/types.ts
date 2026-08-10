import type { OperationType, TestMode } from "./testTypes";

export interface Student {
  id: string; // e.g. "5506" (Student ID shown on portal)
  userId: string; // login id, e.g. "XGDEMOL3001"
  name: string; // display name, e.g. "XGDEMOL3"
  centerName: string;
  level: string; // "LEVEL 3"
  passwordHash?: string; // "<salt>:<hash>", absent for guest sessions
  isGuest?: boolean;
}

export interface AbacusQuestion {
  qNo: number;
  values: number[]; // operands, e.g. [58, 27, 16] for add/sub, [45, 3] for x or /
  signs: number[]; // 1 | -1 per value; only meaningful for addition_subtraction
}

export interface AbacusQuestionWithAnswer extends AbacusQuestion {
  answer: number;
}

export interface TestSession {
  id: string;
  studentId: string;
  studentName: string;
  userId: string;
  studentIdNumber: string;
  centerName: string;
  level: string;
  operation: OperationType;
  operationLabel: string; // e.g. "Addition & Subtraction (2-Digit)"
  variant: string; // e.g. "2-digit", "3x1"
  mode: TestMode;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  questions: AbacusQuestionWithAnswer[];
}

export type PublicQuestion = AbacusQuestion;

export interface PublicTestSession {
  id: string;
  studentId: string;
  studentName: string;
  userId: string;
  studentIdNumber: string;
  centerName: string;
  level: string;
  operation: OperationType;
  operationLabel: string;
  variant: string;
  mode: TestMode;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  questions: PublicQuestion[];
}

export interface AnswerMap {
  [qNo: number]: number | null;
}

export interface QuestionBreakdown {
  qNo: number;
  values: number[];
  signs: number[];
  correctAnswer: number;
  givenAnswer: number | null;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  userId: string;
  studentIdNumber: string;
  centerName: string;
  level: string;
  operation: OperationType;
  operationLabel: string;
  variant: string;
  mode: TestMode;
  totalQuestions: number;
  totalMarks: number;
  answered: number;
  unanswered: number;
  correct: number;
  score: number;
  scorePercent: number;
  timeTakenSeconds: number;
  status: "Completed" | "Auto-Submitted";
  submittedAt: string;
  breakdown: QuestionBreakdown[];
}
