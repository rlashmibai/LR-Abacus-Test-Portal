import Link from "next/link";
import { GraduationCap, LayoutDashboard, Users, Link2 } from "lucide-react";
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
        {/* On a phone: logo and Log Out on the first row, and the three pages
            on a row of their own beneath, each with its name showing. From
            `sm` up it's the single row it always was. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 md:px-8">
          <Link href="/" className="order-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1 rounded-xl bg-paper p-1 sm:order-2 sm:w-auto">
            <Link
              href="/center"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface hover:text-brand sm:flex-none"
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/center/students"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface hover:text-brand sm:flex-none"
            >
              <Users size={15} />
              <span>Students</span>
            </Link>
            <Link
              href="/center/tests"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface hover:text-brand sm:flex-none"
            >
              <Link2 size={15} />
              <span>Tests</span>
            </Link>
          </nav>

          <div className="order-2 flex items-center gap-3 sm:order-3">
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
