import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Timer,
  Calculator,
  Layers,
  CheckCircle2,
  BarChart3,
  Award,
  FileBadge,
  Zap,
  ArrowRight,
  Sparkles,
  Rows3,
  Monitor,
} from "lucide-react";
import { getSessionStudent } from "@/lib/auth";
import { pickQuote } from "@/lib/quotes";
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand";
import AbacusIllustration from "@/components/AbacusIllustration";
import GuestCtaButton from "@/components/GuestCtaButton";
import AccountMenu from "@/components/AccountMenu";

const FEATURES = [
  {
    icon: Layers,
    color: "bg-indigo-100 text-indigo-600",
    title: "Custom-Length Tests",
    text: "Pick 25, 50, or 100 questions - short warm-ups or full-length exams.",
  },
  {
    icon: Timer,
    color: "bg-amber-100 text-amber-600",
    title: "Practice or Exam Mode",
    text: "Untimed practice to learn, or a timed exam to test yourself for real.",
  },
  {
    icon: Calculator,
    color: "bg-rose-100 text-rose-600",
    title: "4 Operations to Master",
    text: "Addition & subtraction, multiplication, and division - all in one place.",
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
    title: "Progress Charts",
    text: "Watch your score and speed improve over time, test after test.",
  },
  {
    icon: Award,
    color: "bg-violet-100 text-violet-600",
    title: "Badges & Achievements",
    text: "Earn badges for milestones - your first perfect score, 10 tests, 100 tests, and more.",
  },
  {
    icon: FileBadge,
    color: "bg-fuchsia-100 text-fuchsia-600",
    title: "Printable Certificates",
    text: "Unlock a personalized certificate to celebrate every milestone.",
  },
  {
    icon: Zap,
    color: "bg-orange-100 text-orange-600",
    title: "No Sign-Up Needed",
    text: "Jump straight into a test as a guest, or register to save your progress.",
  },
  {
    icon: Rows3,
    color: "bg-teal-100 text-teal-600",
    title: "Choose Your Row Count",
    text: "Pick 2, 3, or 4 rows per question for addition & subtraction.",
  },
];

const SHOWCASE = [
  {
    src: "/images/showcase/operations.png",
    alt: "Screenshot of the operation picker: Addition & Subtraction, Multiplication, Division, and Mixed",
    caption:
      "Start by picking what to practice: addition & subtraction, multiplication, division, or a mixed test that blends them all together in one go.",
  },
  {
    src: "/images/showcase/digit-size.png",
    alt: "Screenshot of the digit size picker: 1-Digit, 2-Digit, 3-Digit",
    caption:
      "Then choose how big the numbers should be - simple 1-digit sums for beginners, or 2- and 3-digit numbers as your child gets faster and more confident.",
  },
  {
    src: "/images/showcase/rows.png",
    alt: "Screenshot of the rows-per-question picker: 2, 3, or 4 rows",
    caption:
      "For addition & subtraction, decide how many numbers to add up in each question - 2 for a quick sum, up to 4 for a longer running total.",
  },
  {
    src: "/images/showcase/sample-preview.png",
    alt: "Screenshot of a live sample question preview",
    caption:
      "Before the test even starts, see a real example question built from your exact choices - so there are no surprises once you begin.",
  },
  {
    src: "/images/showcase/question-count.png",
    alt: "Screenshot of the question count picker: 25, 50, or 100 questions",
    caption:
      "Choose how long the practice session should be: a quick 25-question warm-up, or a full 100-question session for serious practice.",
  },
  {
    src: "/images/showcase/mode.png",
    alt: "Screenshot of the Practice Mode vs Exam Mode picker",
    caption:
      "Pick Practice Mode to take your time and learn without pressure, or Exam Mode to race a countdown clock and build real exam speed.",
  },
  {
    src: "/images/showcase/elegant-ui.png",
    alt: "Screenshot of the clean question-answering grid during a test",
    caption:
      "While taking the test, every question sits in its own clean card with the numbers laid out just like on a real abacus worksheet - simple and easy to focus on.",
  },
  {
    src: "/images/showcase/correction.png",
    alt: "Screenshot of the answer review showing correct, wrong, and skipped questions",
    caption:
      "The moment you submit, every question is marked correct, wrong, or skipped, with the right answer shown right there - so you know exactly what to practice next.",
  },
  {
    src: "/images/showcase/scorecard.png",
    alt: "Screenshot of the results scorecard: total questions, answered, correct, time taken",
    caption:
      "A clear scorecard sums up how you did - how many questions you answered, how many you got right, and how long the whole test took.",
  },
  {
    src: "/images/showcase/results-summary.png",
    alt: "Screenshot of the results history table listing every past test",
    caption:
      "Every test is saved automatically, so you can look back anytime and see how you've been doing across every attempt.",
  },
  {
    src: "/images/showcase/weekly-streak.png",
    alt: "Screenshot of the weekly practice streak indicator",
    caption:
      "A simple weekly streak tracker shows which days you practiced, encouraging kids to come back and keep the habit going.",
  },
  {
    src: "/images/showcase/dashboard.png",
    alt: "Screenshot of the personalized sidebar greeting and navigation",
    caption:
      "Log in and you're greeted by name, with your Dashboard, Progress, Achievements, and Results all just one click away.",
  },
];

const STEPS = [
  {
    title: "Choose your test",
    text: "Pick an operation, a digit size, a length, and practice or exam mode.",
  },
  {
    title: "Race the clock (or don't)",
    text: "Answer at your own pace in practice mode, or beat the timer in exam mode.",
  },
  {
    title: "Review & improve",
    text: "See your score instantly, track your progress, and earn badges.",
  },
];

const BADGES = [
  { icon: "🏆", label: "Perfect Mind" },
  { icon: "⚡", label: "Lightning Mind" },
  { icon: "🌱", label: "Number Ninja" },
  { icon: "🔥", label: "Practice Warrior" },
  { icon: "💎", label: "Abacus Expert" },
  { icon: "🚀", label: "Abacus Champion" },
  { icon: "👑", label: "Abacus Legend" },
  { icon: "📅", label: "7-Day Streak" },
  { icon: "🌟", label: "First Breakthrough" },
  { icon: "🏅", label: "New Personal Best" },
  { icon: "🧮", label: "Addition Ace" },
  { icon: "➖", label: "Subtraction Star" },
  { icon: "✖️", label: "Multiplication Master" },
  { icon: "➗", label: "Division Pro" },
];

export default async function Home() {
  const student = await getSessionStudent();
  const quote = pickQuote();

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-display text-base font-semibold leading-tight text-brand sm:text-lg">
              {BRAND_SHORT}
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/about"
              className="rounded-xl bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-brand-soft hover:text-brand sm:px-5 sm:py-3 sm:text-base"
            >
              About Us
            </Link>
            {student ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:px-5 sm:py-3 sm:text-base"
                >
                  Go to Dashboard
                </Link>
                <AccountMenu
                  studentName={student.name}
                  userId={student.userId}
                  isGuest={Boolean(student.isGuest)}
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-brand-soft hover:text-brand sm:px-5 sm:py-3 sm:text-base"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:px-5 sm:py-3 sm:text-base"
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
            100% FREE ABACUS PRACTICE TEST
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Where fast fingers grow into faster minds
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            {BRAND_NAME} - a free, simple practice tool built by a mother
            for her son, helping him practise abacus speed and accuracy,
            one test at a time.
          </p>
          <p className="mt-3 max-w-lg font-display text-base italic text-ink-soft">
            Dedicated to all the lovely abacus students fingering every day.
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
                  Create Free Account - Sign In To Save Your Progress
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
            Built to help kids build speed and accuracy, one test at a time -
            completely free.
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

      {/* What You See Is What You Get */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-center gap-2.5 bg-brand px-6 py-5 text-white">
            <Monitor size={20} />
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              What You See Is What You Get
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:p-10">
            {SHOWCASE.map(({ src, alt, caption }) => (
              <div
                key={src}
                className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-line"
              >
                <div className="overflow-hidden rounded-xl bg-brand-soft ring-1 ring-line">
                  <Image
                    src={src}
                    alt={alt}
                    width={1200}
                    height={750}
                    className="h-auto w-full"
                  />
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-ink">
                  {caption}
                </p>
              </div>
            ))}
          </div>
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

      {/* Badges - gold band, distinct from the lavender "How it works"
          section above and the solid brand CTA below. */}
      <section className="bg-gold-soft py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">
              {BADGES.length} Badges Waiting to Be Earned
            </h2>
            <p className="mt-3 text-ink-soft">
              Every practice test brings you closer to your next badge.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {BADGES.map(({ icon, label }) => (
              <div
                key={label}
                className="rounded-2xl bg-surface p-4 text-center shadow-sm ring-1 ring-line"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-2xl">
                  {icon}
                </div>
                <p className="mt-3 text-xs font-semibold text-ink">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal-use disclaimer - keeps the site's voice honest: a mom's
          project, not a business. */}
      <section className="bg-brand-soft py-16 text-center">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Disclaimer
          </h2>
          <p className="mt-4 text-base text-ink-soft">
            I built this site just for my son&apos;s abacus practice -
            not as a business. It&apos;s my first application built using
            Mr. Claude Code, and it&apos;s free for anyone to use, always
            will be, no strings attached.
          </p>
        </div>
      </section>

      {/* Final CTA - solid brand band so it reads as the closing statement. */}
      <section className="bg-brand py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <h2 className="font-display text-3xl font-semibold text-white">
            Ready to test your speed?
          </h2>
          <p className="mt-3 text-white/80">
            It takes ten seconds to start - always free, no card, no
            commitment, just beads and numbers.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {student ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand transition hover:bg-gold-soft"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand transition hover:bg-gold-soft"
                >
                  Create Free Account - Sign In To Save Your Progress
                  <ArrowRight size={16} />
                </Link>
                <GuestCtaButton className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70" />
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
