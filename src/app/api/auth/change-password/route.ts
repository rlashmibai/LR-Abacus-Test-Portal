import { NextRequest, NextResponse } from "next/server";
import { getStudents, saveStudents } from "@/lib/store";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId: string = (body.userId ?? "").trim();
  const currentPassword: string = body.currentPassword ?? "";
  const newPassword: string = body.newPassword ?? "";

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }
  if (newPassword.length < 4) {
    return NextResponse.json(
      { error: "New password must be at least 4 characters." },
      { status: 400 }
    );
  }

  const students = await getStudents();
  const needle = userId.toLowerCase();
  const idx = students.findIndex((s) => s.userId.toLowerCase() === needle);

  if (idx === -1) {
    return NextResponse.json(
      { error: "No account found with that User ID." },
      { status: 404 }
    );
  }

  const student = students[idx];
  if (!verifyPassword(currentPassword, student.passwordHash)) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  students[idx] = { ...student, passwordHash: hashPassword(newPassword) };
  await saveStudents(students);

  return NextResponse.json({ ok: true });
}
