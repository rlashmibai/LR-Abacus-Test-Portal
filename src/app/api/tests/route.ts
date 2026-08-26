import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent } from "@/lib/auth";
import { saveSession, newId } from "@/lib/store";
import { generateQuestions } from "@/lib/questions";
import {
  DEFAULT_OPERATION,
  DEFAULT_VARIANT,
  DEFAULT_MODE,
  DEFAULT_QUESTION_COUNT,
  DEFAULT_ROW_COUNT,
  isValidOperation,
  isValidVariant,
  isValidMode,
  isValidQuestionCount,
  isValidRowCount,
  operationLabel,
  durationForQuestionCount,
} from "@/lib/testTypes";
import type { TestSession, PublicTestSession } from "@/lib/types";

function toPublic(session: TestSession): PublicTestSession {
  return {
    ...session,
    questions: session.questions.map(({ qNo, values, signs, opKind }) => ({
      qNo,
      values,
      signs,
      opKind,
    })),
  };
}

export async function POST(req: NextRequest) {
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const operation = isValidOperation(body.operation) ? body.operation : DEFAULT_OPERATION;
  const variant = isValidVariant(operation, body.variant) ? body.variant : DEFAULT_VARIANT;
  const mode = isValidMode(body.mode) ? body.mode : DEFAULT_MODE;
  const totalQuestions = isValidQuestionCount(Number(body.questionCount))
    ? Number(body.questionCount)
    : DEFAULT_QUESTION_COUNT;
  const rows = isValidRowCount(Number(body.rows)) ? Number(body.rows) : DEFAULT_ROW_COUNT;

  // A fresh id (timestamp + random) per call means every test - even two
  // started back to back by the same student - gets its own question set.
  const testId = newId();
  const questions = generateQuestions({
    testId,
    operation,
    variant,
    totalQuestions,
    rows,
  });

  const session: TestSession = {
    id: testId,
    studentId: student.id,
    studentName: student.name,
    userId: student.userId,
    studentIdNumber: student.id,
    centerName: student.centerName,
    level: student.level,
    operation,
    operationLabel: operationLabel(operation, variant),
    variant,
    mode,
    durationMinutes: durationForQuestionCount(totalQuestions),
    totalQuestions,
    totalMarks: totalQuestions,
    createdAt: new Date().toISOString(),
    questions,
  };

  await saveSession(session);

  return NextResponse.json(toPublic(session));
}
