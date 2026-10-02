import { NextRequest, NextResponse } from "next/server";
import { getStudent, getStudents, saveStudents } from "@/lib/store";
import { getSessionCenter, hashPassword } from "@/lib/auth";

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
  const password: string = body.password ?? "";

  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  }

  const student = await getStudent(studentId);
  // 404, not 403, so a center can't even confirm another center's
  // student exists by probing this endpoint.
  if (!student || student.centerId !== center.id) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const students = await getStudents();
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  students[idx] = { ...students[idx], passwordHash: hashPassword(password) };
  await saveStudents(students);

  return NextResponse.json({ ok: true });
}
