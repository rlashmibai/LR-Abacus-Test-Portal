import { NextRequest, NextResponse } from "next/server";
import { getStudent } from "@/lib/store";
import {
  encodeSession,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId: string = (body.userId ?? "").trim();
  const password: string = body.password ?? "";

  if (!userId || !password) {
    return NextResponse.json(
      { error: "User ID and password are required." },
      { status: 400 }
    );
  }

  const student = await getStudent(userId);
  if (!student || !verifyPassword(password, student.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect User ID or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ kind: "student", studentId: student.id }),
    SESSION_COOKIE_OPTIONS
  );
  return res;
}
