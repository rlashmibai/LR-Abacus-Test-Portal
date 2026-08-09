import Link from "next/link";
import { FileText, Clock, ListChecks, Award, ArrowRight } from "lucide-react";
import { getResults } from "@/lib/store";
import { requireSessionOrRedirect } from "@/lib/auth";

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-100 p-8 md:p-10">
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-indigo-200/70 px-3 py-1 text-xs font-bold tracking-wide text-indigo-700">
            PRACTICE MODE
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Practice Test Details
          </h2>
          <p className="mt-3 text-slate-600">
            Review your test information before you start your learning
            adventure!
          </p>
          <p className="mt-4 font-semibold text-indigo-700">
            Hi {student?.name ?? "there"} 👋 - you&apos;re all set!
          </p>
          <Link
            href="/test-setup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-300 transition hover:bg-indigo-700"
          >
            Start Practice Test
            <ArrowRight size={16} />
          </Link>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 hidden h-64 w-64 rounded-full bg-gradient-to-br from-violet-300/50 to-indigo-300/50 blur-2xl md:block"
        />
        <div
          aria-hidden
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-8xl md:block"
        >
          🧮
        </div>
      </section>

      {/* Test specifications */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Test Specifications
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        <dl className="divide-y divide-slate-100">
          <Row label="Student ID" value={student?.id ?? "-"} />
          <Row label="Name" value={student?.name ?? "-"} />
          <Row label="Center Name" value={student?.centerName ?? "-"} />
          <Row label="Level" value={student?.level ?? "-"} />
          <Row label="Duration" value={`${DURATION_MINUTES} Mins`} />
          <Row label="Questions" value={`${TOTAL_QUESTIONS}`} />
          <Row label="Total Marks" value={`${TOTAL_MARKS}`} />
        </dl>
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

      {lastResult && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Your most recent test</p>
              <p className="text-base font-semibold text-slate-900">
                Result #{lastResult.id} · {lastResult.scorePercent}% score
              </p>
            </div>
            <Link
              href={`/results/${lastResult.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
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
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
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
    <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-base font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
