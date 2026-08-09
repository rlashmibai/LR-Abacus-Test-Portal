import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getSessionStudent } from "@/lib/auth";

export default async function ChangePasswordPage() {
  const student = await getSessionStudent();

  return <ChangePasswordForm prefillUserId={student?.isGuest ? "" : student?.userId} />;
}
