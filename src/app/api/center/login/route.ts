import { NextRequest, NextResponse } from "next/server";
import { getCenter } from "@/lib/store";
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

  const center = await getCenter(userId);
  if (!center || !verifyPassword(password, center.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect User ID or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ kind: "center", centerId: center.id }),
    SESSION_COOKIE_OPTIONS
  );
  return res;
}
