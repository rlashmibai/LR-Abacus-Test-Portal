import { NextRequest, NextResponse } from "next/server";
import { getResult } from "@/lib/store";
import { getSessionStudent } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { resultId } = await params;
  const result = await getResult(resultId);
  if (!result || result.studentId !== student.id) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
