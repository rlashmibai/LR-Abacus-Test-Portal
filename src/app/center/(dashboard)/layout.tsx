import Link from "next/link";
import { GraduationCap, LayoutDashboard, Users } from "lucide-react";
import { BRAND_SHORT } from "@/lib/brand";
import { requireCenterSessionOrRedirect } from "@/lib/auth";
import CenterLogoutButton from "@/components/CenterLogoutButton";

// Guards every page nested here with a center session - register/login
// live as plain siblings of this route group (outside it) specifically
// so they stay reachable without one. Deliberately a small dedicated
// chrome, not a retrofit of PortalChrome/Sidebar (those assume a
// Student, not a Center).
export default async function CenterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const center = await requireCenterSessionOrRedirect();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-xl bg-paper p-1">
            <Link
              href="/center"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface hover:text-brand"
            >
              <LayoutDashboard size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/center/students"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface hover:text-brand"
            >
              <Users size={15} />
              <span className="hidden sm:inline">Students</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-ink-soft sm:inline">
              {center.name}
            </span>
            <CenterLogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
