export interface Student {
  id: string; // e.g. "5506" (Student ID shown on portal)
  userId: string; // login id, e.g. "XGDEMOL3001"
  name: string; // display name, e.g. "XGDEMOL3"
  centerName: string;
  level: string; // "LEVEL 3"
}

export interface AbacusQuestion {
  qNo: number;
  values: number[]; // magnitudes, e.g. [58, 27, 16]
  signs: number[]; // 1 | -1 per value, values[0]'s sign is always 1
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
