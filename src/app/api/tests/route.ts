import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent } from "@/lib/auth";
import { saveSession, newId } from "@/lib/store";
import { generateQuestions } from "@/lib/questions";
import {
  DEFAULT_OPERATION,
  DEFAULT_VARIANT,
  isValidOperation,
  isValidVariant,
  operationLabel,
} from "@/lib/testTypes";
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
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const operation = isValidOperation(body.operation) ? body.operation : DEFAULT_OPERATION;
  const variant = isValidVariant(operation, body.variant) ? body.variant : DEFAULT_VARIANT;

  // A fresh id (timestamp + random) per call means every test - even two
  // started back to back by the same student - gets its own question set.
  const testId = newId();
  const questions = generateQuestions({
    testId,
    operation,
    variant,
    totalQuestions: TOTAL_QUESTIONS,
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
    durationMinutes: DURATION_MINUTES,
    totalQuestions: TOTAL_QUESTIONS,
    totalMarks: TOTAL_MARKS,
    createdAt: new Date().toISOString(),
    questions,
  };

  await saveSession(session);

  return NextResponse.json(toPublic(session));
}
