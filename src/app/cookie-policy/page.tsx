import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Cookie } from "lucide-react";
import { BRAND_SHORT, BRAND_NAME } from "@/lib/brand";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: `Cookie Policy | ${BRAND_NAME}`,
};

export default function CookiePolicyPage() {
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
              <Cookie size={20} />
              <h1 className="font-display text-xl font-semibold sm:text-2xl">
                Cookie Policy
              </h1>
            </div>
            <div className="space-y-6 p-6 text-sm leading-relaxed text-ink-soft md:p-10">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  The one cookie this site uses
                </h2>
                <p className="mt-2">
                  {BRAND_SHORT} uses a single essential cookie, purely to
                  keep you signed in between pages once you&apos;ve logged in
                  or started a guest test. Without it, the site would forget
                  who you are every time you clicked to a new page.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  What it isn&apos;t used for
                </h2>
                <p className="mt-2">
                  It is never used for advertising, tracking your browsing
                  elsewhere, or building a profile of you. This site doesn&apos;t
                  load any third-party cookies at all - no ad networks, no
                  analytics platforms, no social media widgets.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  How it&apos;s protected
                </h2>
                <p className="mt-2">
                  This cookie is set up so it can only be read by the site
                  itself, never by scripts running on the page, and only
                  ever travels over a secure connection.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Clearing it
                </h2>
                <p className="mt-2">
                  If you clear your browser&apos;s cookies, or use a
                  private/incognito window, you&apos;ll simply be signed out. Nothing
                  else happens - just log back in, or continue as a guest,
                  whenever you&apos;re ready.
                </p>
              </div>
              <p className="text-xs text-ink-faint">Last updated: August 2026.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
