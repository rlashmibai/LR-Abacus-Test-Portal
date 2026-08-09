"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown, KeyRound, LogOut } from "lucide-react";

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
    <header className="relative z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold text-indigo-600">
          {titleFor(pathname)}
        </h1>
      </div>

      {center}

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            1
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              {initials(studentName)}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
              {studentName}
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:inline" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{studentName}</p>
                  <p className="text-xs text-slate-500">
                    {isGuest ? "Guest session" : userId}
                  </p>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                {!isGuest && (
                  <Link
                    href="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <KeyRound size={15} />
                    Change Password
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <LogOut size={15} />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
