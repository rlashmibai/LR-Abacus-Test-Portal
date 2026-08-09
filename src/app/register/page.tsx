import { redirect } from "next/navigation";
import { getSessionStudent } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const student = await getSessionStudent();
  if (student) redirect("/dashboard");

  return <RegisterForm />;
}
