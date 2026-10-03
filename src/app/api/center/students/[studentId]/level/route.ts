import { NextRequest, NextResponse } from "next/server";
import { getStudent, setStudentLevel } from "@/lib/store";
import { getSessionCenter } from "@/lib/auth";
import { parseLevelInput, levelToStored } from "@/lib/levels";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { studentId } = await params;
  const body = await req.json().catch(() => ({}));
  const level = parseLevelInput(body.level);
  if (level === undefined) {
    return NextResponse.json({ error: "Choose a level from 1 to 6." }, { status: 400 });
  }

  const student = await getStudent(studentId);
  // 404, not 403, so a centre can't confirm another centre's student exists.
  if (!student || student.centerId !== center.id) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await setStudentLevel(student.id, levelToStored(level));
  return NextResponse.json({ ok: true, level });
}
