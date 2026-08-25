"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home } from "lucide-react";
import AccountMenu from "./AccountMenu";

const TITLES: Record<string, string> = {
  "/dashboard": "Student Portal",
  "/instructions": "Instructions",
  "/test-setup": "Choose Your Test",
  "/results": "Results",
  "/profile": "Edit Profile",
  "/progress": "Your Progress",
  "/achievements": "Achievements",
  "/certificate": "Your Certificate",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/results/")) return "Result View";
  if (pathname.startsWith("/test/")) return "Online Test";
  return "Student Portal";
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

      <AccountMenu studentName={studentName} userId={userId} isGuest={isGuest} />
    </header>
  );
}
