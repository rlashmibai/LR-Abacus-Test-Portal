import { NextRequest, NextResponse } from "next/server";
import { getResults } from "@/lib/store";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  const results = await getResults();
  const filtered = studentId
    ? results.filter((r) => r.studentId === studentId)
    : results;
  return NextResponse.json(filtered);
}
