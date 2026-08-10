import type { ReactNode } from "react";
import Link from "next/link";
import { Gauge, Target, Sparkles, GraduationCap } from "lucide-react";
import AbacusIllustration from "./AbacusIllustration";

const HIGHLIGHTS = [
  { icon: Gauge, label: "Speed", text: "Beat the clock on 100 timed questions" },
  { icon: Target, label: "Accuracy", text: "Instant, question-by-question review" },
  { icon: Sparkles, label: "Confidence", text: "Practice addition to division, your way" },
];

/**
 * Full-viewport, two-column shell shared by the login, register, and
 * change-password pages, so all three feel like one consistent product
 * instead of a small floating card on an empty page.
 */
export default function AuthShell({
  children,
  quote,
}: {
  children: ReactNode;
  quote: string;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center bg-surface p-6 py-12 md:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-7 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-brand">
              Student Portal
            </span>
          </Link>
          {children}
        </div>
      </div>

      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-brand-soft p-10 md:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
        />

        <div className="relative z-10 flex max-w-sm flex-col items-center gap-8 text-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-brand">
            ABACUS PRACTICE TEST
          </span>

          <AbacusIllustration className="h-60 w-60" />

          <p className="text-balance font-display text-xl italic leading-snug text-brand-dark">
            &ldquo;{quote}&rdquo;
          </p>

          <div className="grid w-full gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 text-left shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
