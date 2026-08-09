import { NextRequest, NextResponse } from "next/server";
import { getStudent, getStudents, saveStudents, newId } from "@/lib/store";
import {
  encodeSession,
  hashPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import type { Student } from "@/lib/types";

const VALID_LEVELS = ["LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4", "LEVEL 5"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId: string = (body.userId ?? "").trim();
  const name: string = (body.name ?? "").trim();
  const centerName: string = (body.centerName ?? "").trim() || "Demo Center";
  const level: string = VALID_LEVELS.includes(body.level) ? body.level : "LEVEL 3";
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

  const existing = await getStudent(userId);
  if (existing) {
    return NextResponse.json(
      { error: "That User ID is already registered." },
      { status: 409 }
    );
  }

  const student: Student = {
    id: newId(),
    userId,
    name,
    centerName,
    level,
    passwordHash: hashPassword(password),
  };

  const students = await getStudents();
  students.push(student);
  await saveStudents(students);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ kind: "student", studentId: student.id }),
    SESSION_COOKIE_OPTIONS
  );
  return res;
}
