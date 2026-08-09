import { requireSessionOrRedirect } from "@/lib/auth";
import PortalChrome from "@/components/PortalChrome";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireSessionOrRedirect();
  return (
    <PortalChrome
      studentName={student.name}
      userId={student.userId}
      isGuest={Boolean(student.isGuest)}
    >
      {children}
    </PortalChrome>
  );
}
