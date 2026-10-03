import { NextRequest, NextResponse } from "next/server";
import { getStudents, getCenters, addStudents, nextStudentIds } from "@/lib/store";
import { getSessionCenter, hashPasswordAsync } from "@/lib/auth";
import { DEFAULT_LEVEL, parseLevelInput, levelToStored } from "@/lib/levels";
import type { Student } from "@/lib/types";

// Each upload hashes every password (deliberately slow, scrypt), so cap
// the size of one upload to keep it comfortably within the request time
// limit. A centre can upload several files for a bigger roster.
const MAX_ROWS_PER_UPLOAD = 200;

interface IncomingRow {
  row?: number; // the row number in the teacher's spreadsheet, for error messages
  name?: unknown;
  userId?: unknown;
  password?: unknown;
  level?: unknown; // optional - blank means Level 1
}

interface SkippedRow {
  row: number;
  userId: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const incoming: IncomingRow[] = Array.isArray(body.rows) ? body.rows : [];

  if (incoming.length === 0) {
    return NextResponse.json({ error: "No student rows found in the upload." }, { status: 400 });
  }
  if (incoming.length > MAX_ROWS_PER_UPLOAD) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_ROWS_PER_UPLOAD} students at a time - split larger lists into several files.` },
      { status: 400 }
    );
  }

  // Every existing student/centre ID (case-insensitive, matching how
  // sign-in looks them up) so we can reject clashes without a query per row.
  const [students, centers] = await Promise.all([getStudents(), getCenters()]);
  const taken = new Set<string>();
  for (const s of students) {
    taken.add(s.userId.toLowerCase());
    taken.add(s.id.toLowerCase());
  }
  for (const c of centers) {
    taken.add(c.userId.toLowerCase());
    taken.add(c.id.toLowerCase());
  }

  const skipped: SkippedRow[] = [];
  const valid: { row: number; name: string; userId: string; password: string; level: number }[] = [];
  const seenInFile = new Map<string, number>();

  incoming.forEach((r, i) => {
    const row = typeof r.row === "number" ? r.row : i + 2;
    const name = String(r.name ?? "").trim();
    const userId = String(r.userId ?? "").trim();
    const password = String(r.password ?? "").trim();

    const fail = (reason: string) => skipped.push({ row, userId, reason });

    if (!name) return fail("Student name is missing");
    if (!userId) return fail("User ID is missing");
    if (name.length > 100 || userId.length > 100) return fail("Name or User ID is too long");
    if (password.length < 4) return fail("Password must be at least 4 characters");

    const levelText = String(r.level ?? "").trim();
    const level = levelText === "" ? DEFAULT_LEVEL : parseLevelInput(levelText);
    if (level === undefined) return fail("Level must be a number from 1 to 6 (or left blank)");

    const key = userId.toLowerCase();
    if (taken.has(key)) return fail("User ID is already in use");
    const firstRow = seenInFile.get(key);
    if (firstRow !== undefined) return fail(`Same User ID already used on row ${firstRow} of this file`);

    seenInFile.set(key, row);
    valid.push({ row, name, userId, password, level });
  });

  let created = 0;
  if (valid.length > 0) {
    const ids = await nextStudentIds(valid.length);
    // scrypt runs on worker threads, so these hash in parallel.
    const hashes = await Promise.all(valid.map((v) => hashPasswordAsync(v.password)));

    const newStudents: Student[] = valid.map((v, i) => ({
      id: ids[i],
      userId: v.userId,
      name: v.name,
      centerName: center.name,
      centerId: center.id,
      level: levelToStored(v.level),
      passwordHash: hashes[i],
    }));

    created = await addStudents(newStudents);
    if (created < valid.length) {
      // Only possible if someone else grabbed one of these IDs in the
      // instant between our check and the insert.
      skipped.push({
        row: 0,
        userId: "",
        reason: `${valid.length - created} student(s) could not be added because their User ID was taken a moment ago - please re-upload those.`,
      });
    }
  }

  skipped.sort((a, b) => a.row - b.row);
  return NextResponse.json({ ok: true, created, skipped });
}
