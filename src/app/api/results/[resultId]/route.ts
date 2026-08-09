import { NextRequest, NextResponse } from "next/server";
import { getResult } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  const { resultId } = await params;
  const result = await getResult(resultId);
  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
