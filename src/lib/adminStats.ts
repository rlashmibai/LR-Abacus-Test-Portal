import type { Student, TestResult } from "./types";
import type { OperationType, TestMode } from "./testTypes";

// Seeded once by ensureSchema() in db.ts so a fresh deployment always has
// something to sign in with - not a real student, exclude from KPIs.
const DEMO_STUDENT_ID = "5506";

export interface TopStudent {
  studentId: string;
  name: string;
  userId: string;
  testsTaken: number;
  avgScorePercent: number;
}

export interface AdminStats {
  totalStudents: number;
  totalGuestSessions: number;
  totalTests: number;
  avgScorePercent: number;
  avgTimeTakenSeconds: number;
  byOperation: Record<OperationType, number>;
  byMode: Record<TestMode, number>;
  byStatus: Record<"Completed" | "Auto-Submitted", number>;
  testsPerDay: { label: string; value: number }[];
  avgScorePerDay: { label: string; value: number }[];
  recentResults: TestResult[];
  students: Student[];
  topStudents: TopStudent[];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  return new Date(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function computeAdminStats(
  students: Student[],
  results: TestResult[],
  guestSessionCount: number
): AdminStats {
  const realStudents = students.filter((s) => s.id !== DEMO_STUDENT_ID);

  const byOperation: Record<OperationType, number> = {
    addition_subtraction: 0,
    multiplication: 0,
    division: 0,
    mixed: 0,
  };
  const byMode: Record<TestMode, number> = { practice: 0, exam: 0 };
  const byStatus: Record<"Completed" | "Auto-Submitted", number> = {
    Completed: 0,
    "Auto-Submitted": 0,
  };

  const byDay = new Map<string, TestResult[]>();
  const byStudent = new Map<string, { name: string; userId: string; results: TestResult[] }>();

  for (const r of results) {
    byOperation[r.operation] = (byOperation[r.operation] ?? 0) + 1;
    byMode[r.mode] = (byMode[r.mode] ?? 0) + 1;
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

    const key = dayKey(r.submittedAt);
    const dayBucket = byDay.get(key) ?? [];
    dayBucket.push(r);
    byDay.set(key, dayBucket);

    const studentBucket = byStudent.get(r.studentId) ?? {
      name: r.studentName,
      userId: r.userId,
      results: [],
    };
    studentBucket.results.push(r);
    byStudent.set(r.studentId, studentBucket);
  }

  const sortedDayKeys = [...byDay.keys()].sort();
  const testsPerDay = sortedDayKeys.map((key) => ({
    label: dayLabel(key),
    value: byDay.get(key)!.length,
  }));
  const avgScorePerDay = sortedDayKeys.map((key) => ({
    label: dayLabel(key),
    value: mean(byDay.get(key)!.map((r) => r.scorePercent)),
  }));

  const topStudents: TopStudent[] = [...byStudent.entries()]
    .map(([studentId, bucket]) => ({
      studentId,
      name: bucket.name,
      userId: bucket.userId,
      testsTaken: bucket.results.length,
      avgScorePercent: mean(bucket.results.map((r) => r.scorePercent)),
    }))
    .sort((a, b) => b.testsTaken - a.testsTaken || b.avgScorePercent - a.avgScorePercent)
    .slice(0, 10);

  return {
    totalStudents: realStudents.length,
    totalGuestSessions: guestSessionCount,
    totalTests: results.length,
    avgScorePercent: mean(results.map((r) => r.scorePercent)),
    avgTimeTakenSeconds: mean(results.map((r) => r.timeTakenSeconds)),
    byOperation,
    byMode,
    byStatus,
    testsPerDay,
    avgScorePerDay,
    recentResults: results.slice(0, 20),
    students: realStudents,
    topStudents,
  };
}
