import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { BRAND_SHORT } from "@/lib/brand";
import { requireSessionOrRedirect } from "@/lib/auth";
import Footer from "@/components/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireSessionOrRedirect();

  const adminUserId = process.env.ADMIN_USER_ID;
  const isAdmin =
    Boolean(adminUserId) &&
    student.userId.toLowerCase() === adminUserId!.toLowerCase();

  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
