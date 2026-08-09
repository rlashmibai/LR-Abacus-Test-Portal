"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, HelpCircle, X } from "lucide-react";
import AbacusIllustration from "./AbacusIllustration";

const NAV = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
const STUDENT_NAV = [{ href: "/results", label: "Results", icon: FileText }];

function initials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export default function Sidebar({
  studentName,
  quote,
  open,
  onClose,
}: {
  studentName: string;
  quote: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const content = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between gap-3 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">
            {initials(studentName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Hi, {studentName}!
            </p>
            <p className="text-xs text-ink-soft">Let&apos;s learn 🎯</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-ink-faint hover:bg-paper md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="px-2 text-xs font-semibold tracking-wider text-ink-faint">
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
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-2 text-xs font-semibold tracking-wider text-ink-faint">
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
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-4 mb-4 rounded-2xl bg-brand-soft p-4">
        <AbacusIllustration className="mx-auto mb-2 h-16 w-20" />
        <p className="text-center text-xs italic leading-snug text-brand-dark">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="px-4 pb-6">
        <a
          href="https://lrvirtualclassroom.co.in/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-paper px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-soft"
        >
          <HelpCircle size={18} />
          Need Help?
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop - sticky + its own viewport height, so it never stretches
          to match a taller main-content column and push the quote card
          below the fold. */}
      <aside className="sticky top-0 z-10 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-line md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
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
