import { NextResponse } from "next/server";
import { getResults } from "@/lib/store";
import { getSessionStudent } from "@/lib/auth";

export async function GET() {
  const student = await getSessionStudent();
  if (!student) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const results = await getResults();
  return NextResponse.json(results.filter((r) => r.studentId === student.id));
}
