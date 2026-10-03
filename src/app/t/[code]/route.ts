import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent, getSessionCenter, SESSION_COOKIE } from "@/lib/auth";

// The address a centre shares with its students. It only decides where to
// send the visitor - the instructions page and /api/tests do the real
// checks (link exists, student belongs to that centre).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const [student, center] = await Promise.all([getSessionStudent(), getSessionCenter()]);

  // A centre opening its own link isn't a student - send it back to the
  // list it copied the link from, with a note.
  if (center) {
    return NextResponse.redirect(new URL("/center/tests?notice=student-link", req.url));
  }

  if (student && !student.isGuest) {
    return NextResponse.redirect(
      new URL(`/instructions?link=${encodeURIComponent(code)}`, req.url)
    );
  }

  // Signed out, or only a guest (who can't belong to a centre): go to the
  // sign-in page and come straight back here afterwards.
  const login = NextResponse.redirect(
    new URL(`/login?next=${encodeURIComponent(`/t/${code}`)}`, req.url)
  );
  if (student?.isGuest) login.cookies.delete(SESSION_COOKIE);
  return login;
}
