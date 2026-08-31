import Link from "next/link";

/** Shown on the public-facing marketing pages (home, about, contact,
 * legal pages) - not inside the portal, which has its own chrome. */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-brand-soft">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <p className="text-center text-sm font-medium text-ink">
          Created and designed with love by Lashmi Bai Ravindrapandian ·
          Built with Mr. Claude Code
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
          <Link href="/disclaimer" className="text-ink-soft underline-offset-4 hover:text-brand hover:underline">
            Disclaimer
          </Link>
          <Link href="/privacy-policy" className="text-ink-soft underline-offset-4 hover:text-brand hover:underline">
            Privacy Policy
          </Link>
          <Link href="/cookie-policy" className="text-ink-soft underline-offset-4 hover:text-brand hover:underline">
            Cookie Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
