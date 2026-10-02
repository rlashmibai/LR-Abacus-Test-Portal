import { redirect } from "next/navigation";
import { getSessionStudent, getSessionCenter } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const [student, center] = await Promise.all([getSessionStudent(), getSessionCenter()]);
  if (student) redirect("/dashboard");
  if (center) redirect("/center");

  return <LoginForm quote={pickQuote()} />;
}
