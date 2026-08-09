import { NextResponse } from "next/server";
import { encodeSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import type { Student } from "@/lib/types";

// Guest profiles are never written to disk — they live entirely inside the
// session cookie, so "instant access" never touches students.json.
export async function POST() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const guest: Student = {
    id: `guest-${suffix}`,
    userId: `GUEST${suffix}`,
    name: `Guest${suffix}`,
    centerName: "Demo Center",
    level: "LEVEL 3",
    isGuest: true,
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ kind: "guest", student: guest }),
    SESSION_COOKIE_OPTIONS
  );
  return res;
}
