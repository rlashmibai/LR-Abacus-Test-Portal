import { NextRequest, NextResponse } from "next/server";
import { isUserIdTaken, createCenter, nextCenterId } from "@/lib/store";
import {
  encodeSession,
  hashPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import type { Center } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name: string = (body.name ?? "").trim();
  const userId: string = (body.userId ?? "").trim();
  const password: string = body.password ?? "";
  const confirm: string = body.confirm ?? "";

  if (!name || !userId || !password) {
    return NextResponse.json(
      { error: "Centre name, User ID, and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  }
  if (password !== confirm) {
    return NextResponse.json(
      { error: "Passwords don't match." },
      { status: 400 }
    );
  }

  // One shared sign-in page serves students and centres, so a User ID
  // must be free across both.
  if (await isUserIdTaken(userId)) {
    return NextResponse.json(
      { error: "That User ID is already registered." },
      { status: 409 }
    );
  }

  const center: Center = {
    id: await nextCenterId(),
    name,
    userId,
    passwordHash: hashPassword(password),
  };
  await createCenter(center);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ kind: "center", centerId: center.id }),
    SESSION_COOKIE_OPTIONS
  );
  return res;
}
