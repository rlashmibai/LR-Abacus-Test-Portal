import { redirect } from "next/navigation";
import { getSessionStudent, getSessionCenter } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [student, center, { type }] = await Promise.all([
    getSessionStudent(),
    getSessionCenter(),
    searchParams,
  ]);
  if (student) redirect("/dashboard");
  if (center) redirect("/center");

  return (
    <RegisterForm
      quote={pickQuote()}
      initialType={type === "centre" ? "centre" : "student"}
    />
  );
}
