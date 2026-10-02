import { NextRequest, NextResponse } from "next/server";
import { getStudent, getCenter } from "@/lib/store";
import {
  encodeSession,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

// One sign-in serves both account types: students and centres share a
// single User ID namespace (enforced at registration), so at most one of
// the two lookups below can match.
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

  const [student, center] = await Promise.all([getStudent(userId), getCenter(userId)]);

  if (student && verifyPassword(password, student.passwordHash)) {
    const res = NextResponse.json({ ok: true, role: "student" });
    res.cookies.set(
      SESSION_COOKIE,
      encodeSession({ kind: "student", studentId: student.id }),
      SESSION_COOKIE_OPTIONS
    );
    return res;
  }

  if (center && verifyPassword(password, center.passwordHash)) {
    const res = NextResponse.json({ ok: true, role: "center" });
    res.cookies.set(
      SESSION_COOKIE,
      encodeSession({ kind: "center", centerId: center.id }),
      SESSION_COOKIE_OPTIONS
    );
    return res;
  }

  return NextResponse.json(
    { error: "Incorrect User ID or password." },
    { status: 401 }
  );
}
