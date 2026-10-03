import { NextRequest, NextResponse } from "next/server";
import { getSessionCenter } from "@/lib/auth";
import { createTestLink, getTestLinksByCenterId, newTestLinkCode } from "@/lib/store";
import { isValidLevel } from "@/lib/levels";
import { isValidMode, isValidQuestionCount } from "@/lib/testTypes";
import type { TestLink } from "@/lib/types";

const MAX_LINKS_PER_CENTER = 50;

export async function POST(req: NextRequest) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const level = Number(body.level);
  const questionCount = Number(body.questionCount);

  if (!isValidLevel(level)) {
    return NextResponse.json({ error: "Choose a level from 1 to 6." }, { status: 400 });
  }
  if (!isValidMode(body.mode)) {
    return NextResponse.json({ error: "Choose practice or exam mode." }, { status: 400 });
  }
  if (!isValidQuestionCount(questionCount)) {
    return NextResponse.json({ error: "Choose 25, 50 or 100 questions." }, { status: 400 });
  }

  // The same level/mode/length always gives the same link - asking twice
  // returns the one already made instead of cluttering the list.
  const existing = await getTestLinksByCenterId(center.id);
  const duplicate = existing.find(
    (l) => l.level === level && l.mode === body.mode && l.questionCount === questionCount
  );
  if (duplicate) {
    return NextResponse.json({ ok: true, code: duplicate.code, existing: true });
  }
  if (existing.length >= MAX_LINKS_PER_CENTER) {
    return NextResponse.json(
      { error: `You can have up to ${MAX_LINKS_PER_CENTER} test links - delete one you no longer need first.` },
      { status: 400 }
    );
  }

  // centerId always comes from the session, never from the request body.
  const link: TestLink = {
    code: newTestLinkCode(),
    centerId: center.id,
    level,
    mode: body.mode,
    questionCount,
  };
  await createTestLink(link);

  return NextResponse.json({ ok: true, code: link.code, existing: false });
}
