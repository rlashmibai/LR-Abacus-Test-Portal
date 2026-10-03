import { redirect } from "next/navigation";
import { getSessionStudent, getSessionCenter } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import LoginForm from "@/components/LoginForm";

// Only a centre test link is a valid place to return to after signing in -
// anything else in ?next= is ignored, so this can't be used as an open
// redirect.
function safeNext(next: string | undefined): string | undefined {
  return next && /^\/t\/[a-z0-9]{6,32}$/.test(next) ? next : undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  const [student, center] = await Promise.all([getSessionStudent(), getSessionCenter()]);
  if (student) redirect(student.isGuest ? "/dashboard" : (next ?? "/dashboard"));
  if (center) redirect("/center");

  return <LoginForm quote={pickQuote()} next={next} />;
}
