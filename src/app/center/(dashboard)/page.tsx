import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  TrendingUp,
  Clock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { requireCenterSessionOrRedirect } from "@/lib/auth";
import { getStudentsByCenterId, getResults } from "@/lib/store";
import { computeAdminStats } from "@/lib/adminStats";
import StatCard from "@/components/dashboard/StatCard";
import BreakdownCard from "@/components/dashboard/BreakdownCard";
import Row from "@/components/dashboard/Row";
import ChartSection from "@/components/dashboard/ChartSection";
import TableSection from "@/components/dashboard/TableSection";
import Pagination from "@/components/dashboard/Pagination";
import EmptyNote from "@/components/dashboard/EmptyNote";
import StudentFilter from "@/components/StudentFilter";

const OPERATION_LABELS: Record<string, string> = {
  addition_subtraction: "Addition & Subtraction",
  multiplication: "Multiplication",
  division: "Division",
  mixed: "Mixed",
};

const PAGE_SIZE = 20;

// Same IST-pinning as /admin - the server defaults to UTC regardless of
// who's viewing it.
const IST = "Asia/Kolkata";

function formatDate(iso: string) {
  return (
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: IST,
    }) + " IST"
  );
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default async function CenterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; student?: string }>;
}) {
  const center = await requireCenterSessionOrRedirect();
  const { page, student } = await searchParams;

  const roster = await getStudentsByCenterId(center.id);
  // Only a student from this centre's own roster can be selected - any
  // other value in the URL just shows everyone.
  const selected = roster.find((s) => s.id === student);
  const scopeStudents = selected ? [selected] : roster;
  const scopeIds = new Set(scopeStudents.map((s) => s.id));
  const allResults = await getResults();
  const scopedResults = allResults.filter((r) => scopeIds.has(r.studentId));
  const scopeLabel = selected ? selected.name : "your students";

  // A center has no guest-session concept of its own, unlike the
  // site-wide /admin dashboard - pass 0.
  const stats = computeAdminStats(scopeStudents, scopedResults, 0);

  const totalPages = Math.max(1, Math.ceil(stats.allResults.length / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const pageResults = stats.allResults.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
        <div className="flex items-center justify-center gap-2.5 bg-brand px-6 py-5 text-white">
          <LayoutDashboard size={20} />
          <h1 className="font-display text-xl font-semibold sm:text-2xl">
            {center.name}
          </h1>
        </div>
        <p className="p-6 text-center text-sm text-ink-soft md:px-10">
          {selected
            ? `Showing results for ${selected.name} (${selected.userId}) only.`
            : "Usage across your own registered students."}
        </p>
      </div>

      {roster.length === 0 ? (
        <Link
          href="/center/students"
          className="flex items-center justify-between rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line transition hover:ring-brand"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-soft p-2.5 text-brand">
              <Users size={18} />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-ink">
                Add your first student
              </p>
              <p className="text-sm text-ink-soft">
                Your dashboard will fill in once students start taking tests.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-ink-faint" />
        </Link>
      ) : (
        <>
          <StudentFilter
            students={roster.map((s) => ({ id: s.id, name: s.name, userId: s.userId }))}
            selectedId={selected?.id ?? ""}
          />

          {/* Top KPI row */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selected ? (
              <StatCard icon={<Users size={18} />} label="Student" value={selected.name} />
            ) : (
              <StatCard icon={<Users size={18} />} label="Total Students" value={String(stats.totalStudents)} />
            )}
            <StatCard icon={<ListChecks size={18} />} label="Tests Taken" value={String(stats.totalTests)} />
            <StatCard icon={<TrendingUp size={18} />} label="Avg Score" value={`${stats.avgScorePercent}%`} />
            <StatCard icon={<Clock size={18} />} label="Avg Time Taken" value={formatClock(stats.avgTimeTakenSeconds)} />
          </section>

          {/* Breakdown row */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BreakdownCard title="By Operation">
              {Object.entries(stats.byOperation).map(([key, count]) => (
                <Row key={key} label={OPERATION_LABELS[key] ?? key} value={String(count)} />
              ))}
            </BreakdownCard>
            <BreakdownCard title="By Mode">
              <Row label="Practice" value={String(stats.byMode.practice)} />
              <Row label="Exam" value={String(stats.byMode.exam)} />
            </BreakdownCard>
            <BreakdownCard title="By Status">
              <Row label="Completed" value={String(stats.byStatus.Completed)} />
              <Row label="Auto-Submitted" value={String(stats.byStatus["Auto-Submitted"])} />
            </BreakdownCard>
          </section>

          {/* Trend charts */}
          <ChartSection
            title="Tests Per Day"
            description={`Number of tests submitted each day by ${scopeLabel}.`}
            data={stats.testsPerDay}
            color="var(--brand)"
            valueFormat={(v) => String(v)}
          />
          <ChartSection
            title="Average Score Per Day"
            description="Mean score percentage across every test submitted that day."
            data={stats.avgScorePerDay}
            color="var(--good)"
            valueFormat={(v) => `${v}%`}
          />

          {/* Leaderboard - a ranking of one student is meaningless, so it
              only appears when looking at everyone. */}
          {!selected && (
          <TableSection
            icon={<Trophy size={18} />}
            title="Top Students"
            description="Ranked by tests taken, then average score."
          >
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-faint">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">User ID</th>
                  <th className="pb-2 pr-4">Tests Taken</th>
                  <th className="pb-2">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.topStudents.map((s) => (
                  <tr key={s.studentId}>
                    <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{s.userId}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{s.testsTaken}</td>
                    <td className="py-2.5 font-semibold text-ink">{s.avgScorePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.topStudents.length === 0 && <EmptyNote text="No tests submitted yet." />}
          </TableSection>
          )}

          {/* Submissions */}
          <TableSection
            icon={<ListChecks size={18} />}
            title="All Submissions"
            description={`${stats.allResults.length} test${stats.allResults.length === 1 ? "" : "s"} submitted by ${scopeLabel} - most recent first.`}
          >
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-faint">
                  <th className="pb-2 pr-4">Student</th>
                  <th className="pb-2 pr-4">User ID</th>
                  <th className="pb-2 pr-4">Operation</th>
                  <th className="pb-2 pr-4">Mode</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageResults.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-4 font-medium text-ink">{r.studentName}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{r.userId}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">
                      {OPERATION_LABELS[r.operation] ?? r.operation}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-soft capitalize">{r.mode}</td>
                    <td className="py-2.5 pr-4 font-semibold text-ink">{r.scorePercent}%</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{formatClock(r.timeTakenSeconds)}</td>
                    <td className="py-2.5 text-ink-soft">{formatDate(r.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.allResults.length === 0 && <EmptyNote text="No tests submitted yet." />}
            {totalPages > 1 && (
              <Pagination
                basePath="/center"
                paramName="page"
                currentPage={currentPage}
                totalPages={totalPages}
                preserve={{ student: selected?.id }}
              />
            )}
          </TableSection>
        </>
      )}
    </div>
  );
}
