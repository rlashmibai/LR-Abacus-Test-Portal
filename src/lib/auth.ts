import { createHmac, randomBytes, scrypt, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStudent, getCenter } from "./store";
import type { Student, Center } from "./types";

export const SESSION_COOKIE = "abacus_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Same hash format as hashPassword, but computed off the main thread so a
 * bulk upload can hash many passwords in parallel instead of one by one. */
export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key)))
  );
  return `${salt}:${hash.toString("hex")}`;
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

export type SessionPayload =
  | { kind: "student"; studentId: string }
  | { kind: "guest"; student: Student }
  | { kind: "center"; centerId: string };

/** The session cookie is signed with this so a client can't hand-craft
 * `{"kind":"student","studentId":"STUD_002"}` and log in as someone else -
 * it must be set in every environment (see .env.local / Netlify env vars). */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set - sessions cannot be signed without it."
    );
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
}

export function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  return `${data}.${sign(data)}`;
}

function decodeSession(raw: string): SessionPayload | null {
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return null;
  const data = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  const expected = sign(data);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
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
  if (payload.kind === "student") return (await getStudent(payload.studentId)) ?? null;
  return null; // a center session is a different identity, not a Student
}

/** For server components/pages: redirects to /login when there's no session. */
export async function requireSessionOrRedirect(): Promise<Student> {
  const student = await getSessionStudent();
  if (!student) redirect("/login");
  return student;
}

/** Center accounts are a separate identity from Student (a center never
 * takes a test itself) - see the Center type and getSessionStudent above,
 * which deliberately returns null for a "center"-kind session. */
export async function getSessionCenter(): Promise<Center | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = decodeSession(raw);
  if (!payload || payload.kind !== "center") return null;

  return (await getCenter(payload.centerId)) ?? null;
}

/** For server components/pages: redirects to the shared /login page when
 * there's no centre session. */
export async function requireCenterSessionOrRedirect(): Promise<Center> {
  const center = await getSessionCenter();
  if (!center) redirect("/login");
  return center;
}
