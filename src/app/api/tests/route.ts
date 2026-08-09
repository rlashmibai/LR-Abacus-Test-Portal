import { NextRequest, NextResponse } from "next/server";
import { getStudent, saveSession, newId } from "@/lib/store";
import { generateQuestions } from "@/lib/questions";
import type { TestSession, PublicTestSession } from "@/lib/types";

const DURATION_MINUTES = 10;
const TOTAL_QUESTIONS = 100;
const TOTAL_MARKS = 100;

function toPublic(session: TestSession): PublicTestSession {
  return {
    ...session,
    questions: session.questions.map(({ qNo, values, signs }) => ({
      qNo,
      values,
      signs,
    })),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const studentId: string = body.studentId ?? "5506";

  const student = await getStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const testId = newId();
  const questions = generateQuestions(testId, student.level, TOTAL_QUESTIONS);

  const session: TestSession = {
    id: testId,
    studentId: student.id,
    studentName: student.name,
    userId: student.userId,
    studentIdNumber: student.id,
    centerName: student.centerName,
    level: student.level,
    durationMinutes: DURATION_MINUTES,
    totalQuestions: TOTAL_QUESTIONS,
    totalMarks: TOTAL_MARKS,
    createdAt: new Date().toISOString(),
    questions,
  };

  await saveSession(session);

  return NextResponse.json(toPublic(session));
}
