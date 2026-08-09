"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";

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
  onMenuClick,
  center,
}: {
  studentName: string;
  onMenuClick: () => void;
  center?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
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
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            {initials(studentName)}
          </div>
          <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
            {studentName}
          </span>
        </div>
      </div>
    </header>
  );
}
