import { NextRequest, NextResponse } from "next/server";
import {
  isUserIdTaken,
  getStudents,
  saveStudents,
  getStudentsByCenterId,
  nextStudentId,
} from "@/lib/store";
import { getSessionCenter, hashPassword } from "@/lib/auth";
import type { Student } from "@/lib/types";

export async function GET() {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const roster = await getStudentsByCenterId(center.id);
  // Never send password hashes to the browser, even though they're
  // salted - there's no reason this response needs them.
  const safeRoster = roster.map(({ passwordHash: _passwordHash, ...rest }) => rest);
  return NextResponse.json(safeRoster);
}

export async function POST(req: NextRequest) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const userId: string = (body.userId ?? "").trim();
  const name: string = (body.name ?? "").trim();
  const password: string = body.password ?? "";

  if (!userId || !name || !password) {
    return NextResponse.json(
      { error: "User ID, name, and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  }

  // User IDs are unique site-wide (students and centres share one
  // sign-in page), not just within one centre.
  if (await isUserIdTaken(userId)) {
    return NextResponse.json(
      { error: "That User ID is already taken - IDs must be unique across every school and centre on the site, not just yours." },
      { status: 409 }
    );
  }

  const student: Student = {
    id: await nextStudentId(),
    userId,
    name,
    centerName: center.name,
    centerId: center.id,
    level: "LEVEL 3", // not shown or used anywhere - tests are picked by operation/difficulty, not level
    passwordHash: hashPassword(password),
  };

  const students = await getStudents();
  students.push(student);
  await saveStudents(students);

  // Deliberately no session cookie change here - the teacher stays
  // logged in as the center, not auto-switched to the new student.
  return NextResponse.json({ ok: true, studentId: student.id });
}
