"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, KeyRound, LogOut, UserRound, Home } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "Student Portal",
  "/instructions": "Instructions",
  "/results": "Results",
  "/profile": "Edit Profile",
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
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [signingOut, setSigningOut] = useState(false);
  const accountBtnRef = useRef<HTMLButtonElement>(null);

  function toggleMenu() {
    if (!menuOpen && accountBtnRef.current) {
      const rect = accountBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setMenuOpen((v) => !v);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur print:hidden md:px-8">
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
        <Link
          href="/"
          className="rounded-lg p-2 text-ink-soft hover:bg-paper hover:text-brand"
          aria-label="Go to homepage"
          title="Go to homepage"
        >
          <Home size={18} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-brand">
          {titleFor(pathname)}
        </h1>
      </div>

      {center}

      <button
        ref={accountBtnRef}
        onClick={toggleMenu}
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

      {/* Portalled to <body> so the header's own stacking context
          (backdrop-blur triggers one) can never cap it below other
          page content, like the sidebar. */}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)} />
            <div
              style={{ top: menuPos.top, right: menuPos.right }}
              className="fixed z-[101] w-56 rounded-xl bg-surface p-1.5 shadow-lg ring-1 ring-line"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink">{studentName}</p>
                <p className="text-xs text-ink-soft">
                  {isGuest ? "Guest session" : userId}
                </p>
              </div>
              <div className="my-1 h-px bg-line" />
              {!isGuest && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper"
                  >
                    <UserRound size={15} />
                    Edit Profile
                  </Link>
                  <Link
                    href="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper"
                  >
                    <KeyRound size={15} />
                    Change Password
                  </Link>
                </>
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
          </>,
          document.body
        )}
    </header>
  );
}
