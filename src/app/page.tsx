import Link from "next/link";
import {
  GraduationCap,
  Timer,
  Calculator,
  Layers,
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getSessionStudent } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import AbacusIllustration from "@/components/AbacusIllustration";
import GuestCtaButton from "@/components/GuestCtaButton";

const FEATURES = [
  {
    icon: Timer,
    color: "bg-indigo-100 text-indigo-600",
    title: "100-Question Timed Tests",
    text: "A 10-minute countdown keeps every practice session focused and game-like.",
  },
  {
    icon: Calculator,
    color: "bg-amber-100 text-amber-600",
    title: "4 Operations to Master",
    text: "Addition & subtraction, multiplication, and division - all in one place.",
  },
  {
    icon: Layers,
    color: "bg-rose-100 text-rose-600",
    title: "Pick Your Difficulty",
    text: "2-digit or 3-digit numbers, so every student can start at the right level.",
  },
  {
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600",
    title: "Instant Answer Review",
    text: "See exactly which questions were right, wrong, or skipped - right after submitting.",
  },
  {
    icon: BarChart3,
    color: "bg-sky-100 text-sky-600",
    title: "Track Every Attempt",
    text: "A running history of results makes it easy to watch speed and accuracy improve.",
  },
  {
    icon: Zap,
    color: "bg-violet-100 text-violet-600",
    title: "No Sign-Up Needed",
    text: "Jump straight into a test as a guest, or register to save your progress.",
  },
];

const STEPS = [
  {
    title: "Choose your test",
    text: "Pick an operation and a digit size that fits your level.",
  },
  {
    title: "Race the clock",
    text: "Answer as many of the 100 questions as you can in 10 minutes.",
  },
  {
    title: "Review & improve",
    text: "See your score instantly and study exactly where you slipped up.",
  },
];

export default async function Home() {
  const student = await getSessionStudent();
  const quote = pickQuote();

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-brand">
              Abacus Test Portal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {student ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-ink-soft hover:text-brand"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-ink">
            <Sparkles size={13} />
            ABACUS PRACTICE TEST
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Where fast fingers grow into faster minds
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            Free, timed abacus practice tests that build lightning-quick
            mental math - built for kids, loved by abacus centers, and
            ready in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {student ? (
              <Link
                href="/test-setup"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Start a Practice Test
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Create Free Account
                  <ArrowRight size={16} />
                </Link>
                <GuestCtaButton className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand-soft px-6 py-3.5 text-sm font-semibold text-brand transition hover:bg-brand-soft/70 disabled:cursor-not-allowed disabled:opacity-70" />
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute h-80 w-80 rounded-full bg-gold/15 blur-3xl"
          />
          <div className="relative rounded-3xl bg-brand-soft p-10">
            <AbacusIllustration className="h-72 w-72" />
            <p className="mt-6 max-w-[260px] text-balance text-center font-display text-base italic text-brand-dark">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Everything a student needs to practice smarter
          </h2>
          <p className="mt-3 text-ink-soft">
            Built to help kids build speed and accuracy, one test at a time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, color, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-soft py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Ready to test your speed?
        </h2>
        <p className="mt-3 text-ink-soft">
          It takes ten seconds to start - no card, no commitment, just beads
          and numbers.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {student ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Create Free Account
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink-soft transition hover:bg-paper"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-ink-faint">
        Abacus Test Portal - practice built for speed, accuracy, and confidence.
      </footer>
    </div>
  );
}
