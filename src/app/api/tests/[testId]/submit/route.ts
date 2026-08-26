import { NextRequest, NextResponse } from "next/server";
import { getSession, saveResult, newId } from "@/lib/store";
import { getSessionStudent } from "@/lib/auth";
import type { AnswerMap, QuestionBreakdown, TestResult } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { testId } = await params;
  const session = await getSession(testId);
  if (!session || session.studentId !== student.id) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const answers: AnswerMap = body.answers ?? {};
  const timeTakenSeconds: number = Math.max(0, Math.round(body.timeTakenSeconds ?? 0));
  const autoSubmitted: boolean = Boolean(body.autoSubmitted);

  const breakdown: QuestionBreakdown[] = session.questions.map((q) => {
    const raw = answers[q.qNo];
    const given = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
    return {
      qNo: q.qNo,
      values: q.values,
      signs: q.signs,
      opKind: q.opKind,
      correctAnswer: q.answer,
      givenAnswer: given,
      isCorrect: given !== null && given === q.answer,
    };
  });

  const answered = breakdown.filter((b) => b.givenAnswer !== null).length;
  const correct = breakdown.filter((b) => b.isCorrect).length;
  const unanswered = session.totalQuestions - answered;
  const score = correct; // 1 mark per question, no negative marking
  const scorePercent = Math.round((score / session.totalMarks) * 100);

  const result: TestResult = {
    id: newId(),
    testId: session.id,
    studentId: session.studentId,
    studentName: session.studentName,
    userId: session.userId,
    studentIdNumber: session.studentIdNumber,
    centerName: session.centerName,
    level: session.level,
    operation: session.operation,
    operationLabel: session.operationLabel,
    variant: session.variant,
    mode: session.mode,
    totalQuestions: session.totalQuestions,
    totalMarks: session.totalMarks,
    answered,
    unanswered,
    correct,
    score,
    scorePercent,
    timeTakenSeconds,
    status: autoSubmitted ? "Auto-Submitted" : "Completed",
    submittedAt: new Date().toISOString(),
    breakdown,
  };

  await saveResult(result);

  return NextResponse.json({ resultId: result.id });
}
