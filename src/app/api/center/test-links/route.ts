import { NextRequest, NextResponse } from "next/server";
import { getSessionCenter } from "@/lib/auth";
import { ensureTestLink } from "@/lib/store";
import { isValidLevel } from "@/lib/levels";
import { isValidMode, isValidQuestionCount } from "@/lib/testTypes";

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

  // The same level/mode/length always gives the same link, so asking again
  // returns the one already made. `regenerate` replaces it with a new code
  // (the old address stops working).
  const result = await ensureTestLink(center.id, level, body.mode, questionCount, {
    fresh: body.regenerate === true,
  });
  if (!result) {
    return NextResponse.json(
      { error: "You have reached the limit of 50 test links - delete one you no longer need first." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, code: result.link.code, existing: result.existing });
}
