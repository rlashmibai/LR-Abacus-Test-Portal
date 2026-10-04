import { NextRequest, NextResponse } from "next/server";
import {
  isUserIdTaken,
  getStudents,
  saveStudents,
  getStudentsByCenterId,
  nextStudentId,
  ensureTestLink,
} from "@/lib/store";
import { getSessionCenter, hashPassword, encryptPassword, generatePassword } from "@/lib/auth";
import {
  DEFAULT_LEVEL,
  DEFAULT_LINK_MODE,
  DEFAULT_LINK_QUESTIONS,
  parseLevelInput,
  levelToStored,
} from "@/lib/levels";
import type { Student } from "@/lib/types";

export async function GET() {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const roster = await getStudentsByCenterId(center.id);
  // Never send password hashes (or the encrypted copies) to the browser,
  // even though they're protected - there's no reason this response needs them.
  const safeRoster = roster.map(
    ({ passwordHash: _passwordHash, passwordEnc: _passwordEnc, ...rest }) => rest
  );
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
  // Optional: leave it blank and one is generated (and returned once, below).
  const typedPassword: string = typeof body.password === "string" ? body.password : "";
  const generated = typedPassword === "";
  const password = generated ? generatePassword() : typedPassword;
  // Optional: a missing level means Level 1, but a level that's present and
  // not one of the six is an error rather than silently becoming Level 1.
  const level =
    body.level === undefined || body.level === "" ? DEFAULT_LEVEL : parseLevelInput(body.level);

  if (level === undefined) {
    return NextResponse.json({ error: "Choose a level from 1 to 6." }, { status: 400 });
  }
  if (!userId || !name) {
    return NextResponse.json(
      { error: "User ID and name are required." },
      { status: 400 }
    );
  }
  if (!generated && password.length < 4) {
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
    level: levelToStored(level),
    passwordHash: hashPassword(password),
    passwordEnc: encryptPassword(password),
  };

  const students = await getStudents();
  students.push(student);
  await saveStudents(students);

  // Every level the centre uses gets its test link automatically.
  await ensureTestLink(center.id, level, DEFAULT_LINK_MODE, DEFAULT_LINK_QUESTIONS);

  // Deliberately no session cookie change here - the teacher stays
  // logged in as the center, not auto-switched to the new student.
  return NextResponse.json({
    ok: true,
    studentId: student.id,
    // Only sent back when we made it up - otherwise the centre typed it.
    password: generated ? password : undefined,
  });
}
