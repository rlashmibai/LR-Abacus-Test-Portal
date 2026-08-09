import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";
import type { PublicTestSession } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const session = await getSession(testId);
  if (!session) {
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
