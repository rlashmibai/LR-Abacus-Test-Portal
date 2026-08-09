import { redirect } from "next/navigation";
import { getSessionStudent } from "@/lib/auth";

export default async function Home() {
  const student = await getSessionStudent();
  redirect(student ? "/dashboard" : "/login");
}
