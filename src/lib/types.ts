import type { OperationType, TestMode } from "./testTypes";

export interface Student {
  id: string; // e.g. "5506" (Student ID shown on portal)
  userId: string; // login id, e.g. "XGDEMOL3001"
  name: string; // display name, e.g. "XGDEMOL3"
  centerName: string;
  level: string; // "LEVEL 1" - "LEVEL 6"; set by the centre, never shown to students
  passwordHash?: string; // "<salt>:<hash>", absent for guest sessions
  isGuest?: boolean;
  createdAt?: string; // when the account was registered, ISO string
  centerId?: string; // set when a Center's teacher created this profile -
  // absent for independent, self-registered students (unchanged behavior)
}

/** A school/coaching-center account. A separate identity from Student,
 * not a role on it - a center never takes a test itself, it only
 * creates and manages student profiles underneath it. See
 * src/lib/auth.ts's SessionPayload for how a center logs in. */
export interface Center {
  id: string; // e.g. "CTR_001"
  name: string; // the school/center's display name
  userId: string; // login id - shares one namespace with student userIds, since one sign-in page serves both
  passwordHash: string;
  createdAt?: string;
}

/** What a single question asks. A "mixed" test (or a level test) carries one
 * of these per question; other tests infer it from the test-level operation. */
export type QuestionKind = "addition_subtraction" | "multiplication" | "division";

/** A shareable test a centre created for one of its levels (see
 * src/lib/levels.ts). Students of that centre open /t/<code> to take it. */
export interface TestLink {
  code: string; // unguessable id used in the URL
  centerId: string;
  level: number; // 1-6
  mode: TestMode;
  questionCount: number;
  createdAt?: string;
}

export interface AbacusQuestion {
  qNo: number;
  values: number[]; // operands, e.g. [58, 27, 16] for add/sub, [45, 3] for x or /
  signs: number[]; // 1 | -1 per value; only meaningful for addition_subtraction
  // Which kind of question this row actually is. Only set (and needed) for
  // a "mixed" or level test, where different questions in the same test can
  // be different kinds; everything else infers its rendering from the
  // test-level `operation` instead.
  opKind?: QuestionKind;
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
  // Only set when the test came from a centre's test link - centre-only
  // information, stripped from anything sent to the student's browser.
  testLevel?: number;
  linkId?: string;
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
  opKind?: QuestionKind;
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
  testLevel?: number; // centre-only, like TestSession.testLevel
  linkId?: string;
}
