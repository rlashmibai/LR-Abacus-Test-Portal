import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getSessionStudent } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";

export default async function ChangePasswordPage() {
  const student = await getSessionStudent();

  return (
    <ChangePasswordForm
      prefillUserId={student?.isGuest ? "" : student?.userId}
      quote={pickQuote()}
    />
  );
}
