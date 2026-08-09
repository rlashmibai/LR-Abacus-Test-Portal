"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, HelpCircle, X } from "lucide-react";

const NAV = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
const STUDENT_NAV = [{ href: "/results", label: "Results", icon: FileText }];

function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export default function Sidebar({
  studentName,
  open,
  onClose,
}: {
  studentName: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-sm">
            {initials(studentName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Hi, {studentName}!
            </p>
            <p className="text-xs text-slate-500">Let&apos;s learn 🎯</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="px-2 text-xs font-semibold tracking-wider text-slate-400">
          NAVIGATION
        </p>
        <ul className="mt-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-2 text-xs font-semibold tracking-wider text-slate-400">
          STUDENTS
        </p>
        <ul className="mt-2 space-y-1">
          {STUDENT_NAV.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-b from-indigo-50 to-violet-50 p-4">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
          🧮
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          <li>⏱ Manage your time wisely</li>
          <li>🎯 Read each question carefully</li>
          <li>💡 Attempt all questions</li>
        </ul>
      </div>

      <div className="px-4 pb-6">
        <a
          href="https://lrvirtualclassroom.co.in/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <HelpCircle size={18} />
          Need Help?
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
