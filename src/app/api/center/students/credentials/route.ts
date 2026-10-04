import { NextRequest, NextResponse } from "next/server";
import { getStudentsByCenterId, ensureTestLink, setStudentCredentials } from "@/lib/store";
import {
  getSessionCenter,
  decryptPassword,
  encryptPassword,
  generatePassword,
  hashPasswordAsync,
} from "@/lib/auth";
import {
  DEFAULT_LINK_MODE,
  DEFAULT_LINK_QUESTIONS,
  isValidLevel,
  levelFromStored,
} from "@/lib/levels";
import { isValidMode, isValidQuestionCount } from "@/lib/testTypes";

// Same limit as a bulk upload: each new password is hashed with scrypt, which
// is deliberately slow.
const MAX_PASSWORDS_TO_SET = 200;

/** Everything a centre needs to hand out: each student's name, User ID,
 * password, level and test-link code. Passwords already on file are returned
 * as they are - they never change between downloads. A student with no saved
 * password (an older account, or one who chose their own) is only given one
 * when the request says `assignMissing: true`; without that the request just
 * reports how many there are so the centre can decide. */
export async function POST(req: NextRequest) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const levelFilter = body.level === undefined || body.level === "all" ? undefined : Number(body.level);
  if (levelFilter !== undefined && !isValidLevel(levelFilter)) {
    return NextResponse.json({ error: "Choose a level from 1 to 6." }, { status: 400 });
  }
  const mode = body.mode === undefined ? DEFAULT_LINK_MODE : body.mode;
  const questionCount =
    body.questionCount === undefined ? DEFAULT_LINK_QUESTIONS : Number(body.questionCount);
  if (!isValidMode(mode) || !isValidQuestionCount(questionCount)) {
    return NextResponse.json({ error: "Choose a valid test style." }, { status: 400 });
  }

  const roster = (await getStudentsByCenterId(center.id))
    .filter((s) => levelFilter === undefined || levelFromStored(s.level) === levelFilter)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (roster.length === 0) {
    return NextResponse.json(
      { error: levelFilter ? "No students at that level yet." : "No students yet - add some first." },
      { status: 400 }
    );
  }

  const passwords = new Map<string, string | null>(
    roster.map((s) => [s.id, decryptPassword(s.passwordEnc)])
  );
  const missing = roster.filter((s) => passwords.get(s.id) === null);

  if (missing.length > 0 && body.assignMissing === undefined) {
    return NextResponse.json({ ok: true, needsConfirm: true, missing: missing.length, total: roster.length });
  }

  if (missing.length > 0 && body.assignMissing === true) {
    if (missing.length > MAX_PASSWORDS_TO_SET) {
      return NextResponse.json(
        { error: `${missing.length} students need a password - please do this one level at a time (at most ${MAX_PASSWORDS_TO_SET} at once).` },
        { status: 400 }
      );
    }
    const fresh = missing.map((s) => ({ id: s.id, password: generatePassword() }));
    const hashes = await Promise.all(fresh.map((f) => hashPasswordAsync(f.password)));
    await setStudentCredentials(
      center.id,
      fresh.map((f, i) => ({
        id: f.id,
        passwordHash: hashes[i],
        passwordEnc: encryptPassword(f.password),
      }))
    );
    for (const f of fresh) passwords.set(f.id, f.password);
  }

  // One link per level in use - created now if the level doesn't have one yet.
  const linkCodes = new Map<number, string | null>();
  for (const level of new Set(roster.map((s) => levelFromStored(s.level)))) {
    const result = await ensureTestLink(center.id, level, mode, questionCount);
    linkCodes.set(level, result ? result.link.code : null);
  }

  return NextResponse.json({
    ok: true,
    rows: roster.map((s) => {
      const level = levelFromStored(s.level);
      return {
        name: s.name,
        userId: s.userId,
        password: passwords.get(s.id) ?? null,
        level,
        linkCode: linkCodes.get(level) ?? null,
      };
    }),
  });
}
