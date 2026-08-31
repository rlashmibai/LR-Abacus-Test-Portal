import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, ShieldCheck } from "lucide-react";
import { BRAND_SHORT, BRAND_NAME } from "@/lib/brand";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck size={20} />
              <h1 className="font-display text-xl font-semibold sm:text-2xl">
                Privacy Policy
              </h1>
            </div>
            <div className="space-y-6 p-6 text-sm leading-relaxed text-ink-soft md:p-10">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  What I collect
                </h2>
                <p className="mt-2">
                  If you register, I ask only for a User ID you choose, your
                  name, a practice level, and a password. Your password is
                  never stored as plain text - it&apos;s protected before it
                  ever reaches the database. If you use the site as a guest,
                  nothing about you is saved at all beyond your current
                  browser session, and it disappears once that session ends.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Why I collect it
                </h2>
                <p className="mt-2">
                  Solely to let you log back in and see your own test history,
                  scores, streaks, and badges. That&apos;s the only reason any
                  of it exists.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  What I don&apos;t do
                </h2>
                <p className="mt-2">
                  No ads. No third-party analytics or tracking scripts of any
                  kind. Your data is never sold, rented, or shared with
                  anyone else. I don&apos;t ask for an email address, phone
                  number, or birthdate, because the site simply doesn&apos;t
                  need them.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Since this is built for children
                </h2>
                <p className="mt-2">
                  I&apos;d encourage a parent or guardian to be involved when
                  creating an account. I&apos;ve deliberately kept the
                  information collected to the bare minimum needed for the
                  site to work, and nothing more.
                </p>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Your data, your control
                </h2>
                <p className="mt-2">
                  Want to see, change, or delete what&apos;s stored about
                  you or your child? Reach out anytime via the{" "}
                  <Link href="/contact" className="font-medium text-brand hover:underline">
                    Contact page
                  </Link>{" "}
                  and I&apos;ll take care of it directly.
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
