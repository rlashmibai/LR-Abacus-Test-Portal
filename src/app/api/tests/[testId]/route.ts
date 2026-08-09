import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";
import { getSessionStudent } from "@/lib/auth";
import type { PublicTestSession } from "@/lib/types";

export async function GET(
  _req: NextRequest,
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

  const publicSession: PublicTestSession = {
    ...session,
    questions: session.questions.map(({ qNo, values, signs }) => ({
      qNo,
      values,
      signs,
    })),
  };

  return NextResponse.json(publicSession);
}
