import { requireSessionOrRedirect } from "@/lib/auth";
import { pickQuote, todaySeed } from "@/lib/quotes";
import PortalChrome from "@/components/PortalChrome";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireSessionOrRedirect();
  const adminUserId = process.env.ADMIN_USER_ID;
  const isAdmin =
    Boolean(adminUserId) &&
    student.userId.toLowerCase() === adminUserId!.toLowerCase();

  return (
    <PortalChrome
      studentName={student.name}
      userId={student.userId}
      isGuest={Boolean(student.isGuest)}
      isAdmin={isAdmin}
      quote={pickQuote(todaySeed())}
    >
      {children}
    </PortalChrome>
  );
}
