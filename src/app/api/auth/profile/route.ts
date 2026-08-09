import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent } from "@/lib/auth";
import { getStudents, saveStudents } from "@/lib/store";

export async function POST(req: NextRequest) {
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (student.isGuest) {
    return NextResponse.json(
      { error: "Guest sessions don't have a profile to edit." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const name: string = (body.name ?? "").trim();
  const centerName: string = (body.centerName ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const students = await getStudents();
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  students[idx] = {
    ...students[idx],
    name,
    centerName: centerName || students[idx].centerName,
  };
  await saveStudents(students);

  return NextResponse.json({ ok: true });
}
