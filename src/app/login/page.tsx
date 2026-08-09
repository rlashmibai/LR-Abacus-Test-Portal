import { redirect } from "next/navigation";
import { getSessionStudent } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const student = await getSessionStudent();
  if (student) redirect("/dashboard");

  return <LoginForm quote={pickQuote()} />;
}
