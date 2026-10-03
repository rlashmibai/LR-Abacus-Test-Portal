import { NextRequest, NextResponse } from "next/server";
import { getSessionCenter } from "@/lib/auth";
import { getTestLink, deleteTestLink } from "@/lib/store";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const center = await getSessionCenter();
  if (!center) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { code } = await params;
  const link = await getTestLink(code);
  // 404, not 403, so another centre's link can't be confirmed to exist.
  if (!link || link.centerId !== center.id) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await deleteTestLink(link.code);
  return NextResponse.json({ ok: true });
}
