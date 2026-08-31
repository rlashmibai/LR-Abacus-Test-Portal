import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Info } from "lucide-react";
import { BRAND_SHORT, BRAND_NAME } from "@/lib/brand";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: `Disclaimer | ${BRAND_NAME}`,
};

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand"
          >
            <ArrowLeft size={15} />
            Back home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
            <div className="flex items-center justify-center gap-2.5 bg-brand px-6 py-5 text-white">
              <Info size={20} />
              <h1 className="font-display text-xl font-semibold sm:text-2xl">
                Disclaimer
              </h1>
            </div>
            <div className="space-y-5 p-6 text-sm leading-relaxed text-ink-soft md:p-10">
              <p>
                {BRAND_NAME} is a personal, non-commercial project. I built it
                to give my own son extra abacus practice, and I&apos;ve made
                it free for any other family to use in the same way. There
                are no ads, no subscriptions, and no hidden costs, and there
                never will be.
              </p>
              <p>
                I&apos;m not a professional software company, and this site
                is maintained by one parent in their spare time, with the
                help of an AI coding assistant (Mr. Claude Code). While I
                do my best to keep every test question accurate and the site
                running smoothly, I can&apos;t guarantee it will always be
                error-free or available without interruption.
              </p>
              <p>
                This site is a practice tool only - it&apos;s meant to
                complement, not replace, proper abacus classes or coaching.
                It is not affiliated with, endorsed by, or certified by any
                abacus institute, school, or examination board.
              </p>
              <p>
                If you notice a wrong answer, a bug, or anything that looks
                off, I&apos;d genuinely appreciate you letting me know via
                the{" "}
                <Link href="/contact" className="font-medium text-brand hover:underline">
                  Contact page
                </Link>
                {" "}- it helps make the site better for every child using it.
              </p>
              <p className="text-xs text-ink-faint">Last updated: August 2026.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
