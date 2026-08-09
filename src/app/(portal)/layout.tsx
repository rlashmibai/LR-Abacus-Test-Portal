import { getStudent } from "@/lib/store";
import PortalChrome from "@/components/PortalChrome";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await getStudent("5506");
  return (
    <PortalChrome studentName={student?.name ?? "Student"}>
      {children}
    </PortalChrome>
  );
}
