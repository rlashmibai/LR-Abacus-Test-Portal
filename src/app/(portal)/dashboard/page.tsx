import Link from "next/link";
import { FileText, Clock, ListChecks, Award, ArrowRight } from "lucide-react";
import { getResults } from "@/lib/store";
import { requireSessionOrRedirect } from "@/lib/auth";
import AbacusIllustration from "@/components/AbacusIllustration";

const DURATION_MINUTES = 10;
const TOTAL_QUESTIONS = 100;
const TOTAL_MARKS = 100;

export default async function DashboardPage() {
  const student = await requireSessionOrRedirect();
  const results = await getResults();
  const studentResults = results.filter((r) => r.studentId === student.id);
  const lastResult = studentResults[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-soft p-8 md:p-10">
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-brand">
            PRACTICE MODE
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">
            Practice Test Details
          </h2>
          <p className="mt-3 text-ink-soft">
            Review your test information before you start your learning
            adventure!
          </p>
          <p className="mt-4 font-medium text-brand">
            Hi {student.name} 👋 - you&apos;re all set!
          </p>
          <Link
            href="/test-setup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Start Practice Test
            <ArrowRight size={16} />
          </Link>
        </div>
        <AbacusIllustration className="pointer-events-none absolute right-6 top-1/2 hidden h-40 w-40 -translate-y-1/2 md:block" />
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock size={18} />}
          label="Duration"
          value={`${DURATION_MINUTES} Mins`}
        />
        <StatCard
          icon={<ListChecks size={18} />}
          label="Questions"
          value={`${TOTAL_QUESTIONS}`}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Last Score"
          value={
            lastResult ? `${lastResult.score}/${lastResult.totalMarks}` : "-"
          }
        />
      </section>

      {/* Test specifications */}
      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-soft p-2 text-brand">
              <FileText size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">
              Test Specifications
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            Active
          </span>
        </div>

        <dl className="divide-y divide-line">
          <Row label="Student ID" value={student.id} />
          <Row label="Name" value={student.name} />
          <Row label="Center Name" value={student.centerName} />
          <Row label="Duration" value={`${DURATION_MINUTES} Mins`} />
          <Row label="Questions" value={`${TOTAL_QUESTIONS}`} />
          <Row label="Total Marks" value={`${TOTAL_MARKS}`} />
        </dl>
      </section>

      {lastResult && (
        <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">Your most recent test</p>
              <p className="text-base font-semibold text-ink">
                {lastResult.operationLabel ?? lastResult.level} · {lastResult.scorePercent}% score
              </p>
            </div>
            <Link
              href={`/results/${lastResult.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-paper px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-soft hover:text-brand"
            >
              View Result
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
      <div className="rounded-xl bg-brand-soft p-2.5 text-brand">
        {icon}
      </div>
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-base font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
