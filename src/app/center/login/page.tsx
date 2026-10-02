import { redirect } from "next/navigation";
import { getSessionCenter } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import CenterLoginForm from "@/components/CenterLoginForm";

export default async function CenterLoginPage() {
  const center = await getSessionCenter();
  if (center) redirect("/center");

  return <CenterLoginForm quote={pickQuote()} />;
}
