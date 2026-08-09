"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, KeyRound, LogOut } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "Student Portal",
  "/instructions": "Instructions",
  "/results": "Results",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/results/")) return "Result View";
  if (pathname.startsWith("/test/")) return "Online Test";
  return "Student Portal";
}

function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export default function TopBar({
  studentName,
  userId,
  isGuest,
  onMenuClick,
  center,
}: {
  studentName: string;
  userId: string;
  isGuest: boolean;
  onMenuClick: () => void;
  center?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        {/* Only meaningful on mobile - the sidebar is always visible on
            desktop, so a toggle there wouldn't do anything. */}
        <button
          onClick={onMenuClick}
          className="rounded-lg bg-paper p-2 text-ink-soft hover:bg-brand-soft md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-display text-lg font-semibold text-brand">
          {titleFor(pathname)}
        </h1>
      </div>

      {center}

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-paper"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials(studentName)}
          </div>
          <span className="hidden text-sm font-semibold text-ink sm:inline">
            {studentName}
          </span>
          <ChevronDown size={14} className="hidden text-ink-faint sm:inline" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl bg-surface p-1.5 shadow-lg ring-1 ring-line">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink">{studentName}</p>
                <p className="text-xs text-ink-soft">
                  {isGuest ? "Guest session" : userId}
                </p>
              </div>
              <div className="my-1 h-px bg-line" />
              {!isGuest && (
                <Link
                  href="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper"
                >
                  <KeyRound size={15} />
                  Change Password
                </Link>
              )}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-bad hover:bg-bad-soft disabled:opacity-60"
              >
                <LogOut size={15} />
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
