import { redirect } from "next/navigation";
import { getSessionCenter } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import CenterRegisterForm from "@/components/CenterRegisterForm";

export default async function CenterRegisterPage() {
  const center = await getSessionCenter();
  if (center) redirect("/center");

  return <CenterRegisterForm quote={pickQuote()} />;
}
