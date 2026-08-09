import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudent } from "./store";
import type { Student } from "./types";

export const SESSION_COOKIE = "abacus_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

type SessionPayload =
  | { kind: "student"; studentId: string }
  | { kind: "guest"; student: Student };

export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

function decodeSession(raw: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function getSessionStudent(): Promise<Student | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = decodeSession(raw);
  if (!payload) return null;

  if (payload.kind === "guest") return payload.student;
  return (await getStudent(payload.studentId)) ?? null;
}

/** For server components/pages: redirects to /login when there's no session. */
export async function requireSessionOrRedirect(): Promise<Student> {
  const student = await getSessionStudent();
  if (!student) redirect("/login");
  return student;
}
