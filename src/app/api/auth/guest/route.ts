import { NextResponse } from "next/server";
import { encodeSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { nextGuestId } from "@/lib/store";
import type { Student } from "@/lib/types";

// Guest profiles are never written to the students table — they live
// entirely inside the session cookie — but the id still comes from a
// persistent sequential counter (see nextGuestId), so the numbering
// itself doubles as a rough count of how many guest sessions have
// started, without storing any actual guest data.
export async function POST() {
  const id = await nextGuestId();
  const guest: Student = {
    id,
    userId: id,
    name: `Guest ${id.replace("GUEST_", "")}`,
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
