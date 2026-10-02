import type { Metadata } from "next";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListChecks,
  TrendingUp,
  Clock,
  Trophy,
  Eye,
  Building2,
} from "lucide-react";
import { getStudents, getResults, getCounterValue, getPageViews, getCenters } from "@/lib/store";
import { computeAdminStats } from "@/lib/adminStats";
import { BRAND_NAME } from "@/lib/brand";
import StatCard from "@/components/dashboard/StatCard";
import BreakdownCard from "@/components/dashboard/BreakdownCard";
import Row from "@/components/dashboard/Row";
import ChartSection from "@/components/dashboard/ChartSection";
import TableSection from "@/components/dashboard/TableSection";
import Pagination from "@/components/dashboard/Pagination";
import EmptyNote from "@/components/dashboard/EmptyNote";

export const metadata: Metadata = {
  title: `Admin | ${BRAND_NAME}`,
};

const OPERATION_LABELS: Record<string, string> = {
  addition_subtraction: "Addition & Subtraction",
  multiplication: "Multiplication",
  division: "Division",
  mixed: "Mixed",
};

const PAGE_SIZE = 20;

// This page renders on the server, which defaults to UTC regardless of
// who's viewing it - pin every date/time shown here to IST explicitly
// so it always reflects the site owner's timezone.
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

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: "medium",
    timeZone: IST,
  });
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; viewsPage?: string }>;
}) {
  const [students, results, guestSessionCount, pageViews, centers, { page, viewsPage }] =
    await Promise.all([
      getStudents(),
      getResults(),
      getCounterValue("guest"),
      getPageViews(),
      getCenters(),
      searchParams,
    ]);
  const stats = computeAdminStats(students, results, guestSessionCount);

  const studentCountByCenter = new Map<string, number>();
  for (const s of students) {
    if (!s.centerId) continue;
    studentCountByCenter.set(s.centerId, (studentCountByCenter.get(s.centerId) ?? 0) + 1);
  }

  const totalPages = Math.max(1, Math.ceil(stats.allResults.length / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const pageResults = stats.allResults.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const viewsTotalPages = Math.max(1, Math.ceil(pageViews.length / PAGE_SIZE));
  const viewsCurrentPage = Math.min(viewsTotalPages, Math.max(1, Number(viewsPage) || 1));
  const pageViewItems = pageViews.slice(
    (viewsCurrentPage - 1) * PAGE_SIZE,
    viewsCurrentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <div className="overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
        <div className="flex items-center justify-center gap-2.5 bg-brand px-6 py-5 text-white">
          <LayoutDashboard size={20} />
          <h1 className="font-display text-xl font-semibold sm:text-2xl">
            Admin Dashboard
          </h1>
        </div>
        <p className="p-6 text-center text-sm text-ink-soft md:px-10">
          Site-wide usage across all students and guests.
        </p>
      </div>

      {/* Top KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Eye size={18} />} label="Homepage Views" value={String(pageViews.length)} />
        <StatCard icon={<Users size={18} />} label="Total Students" value={String(stats.totalStudents)} />
        <StatCard icon={<UserPlus size={18} />} label="Guest Sessions" value={String(stats.totalGuestSessions)} />
        <StatCard icon={<ListChecks size={18} />} label="Tests Taken" value={String(stats.totalTests)} />
        <StatCard icon={<TrendingUp size={18} />} label="Avg Score" value={`${stats.avgScorePercent}%`} />
        <StatCard icon={<Clock size={18} />} label="Avg Time Taken" value={formatClock(stats.avgTimeTakenSeconds)} />
      </section>
      <p className="-mt-2 text-xs text-ink-faint">
        Homepage Views is a raw page-load count (includes repeat visits and any bot/crawler traffic) - not a unique-visitor count.
      </p>

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
        description="Number of tests submitted each day, site-wide."
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

      {/* Leaderboard */}
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

      {/* Recent submissions */}
      <TableSection
        icon={<ListChecks size={18} />}
        title="All Submissions"
        description={`${stats.allResults.length} test${stats.allResults.length === 1 ? "" : "s"} submitted, site-wide - most recent first.`}
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
            basePath="/admin"
            paramName="page"
            currentPage={currentPage}
            totalPages={totalPages}
            preserve={{ viewsPage }}
          />
        )}
      </TableSection>

      {/* Homepage views log */}
      <TableSection
        icon={<Eye size={18} />}
        title="Homepage Views"
        description={`${pageViews.length} view${pageViews.length === 1 ? "" : "s"} logged, most recent first - a raw page-load count (includes repeat visits and any bot/crawler traffic), not unique visitors. Only views since this feature was added are logged.`}
      >
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-faint">
              <th className="pb-2">Date &amp; Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageViewItems.map((v) => (
              <tr key={v.id}>
                <td className="py-2.5 text-ink-soft">{formatDate(v.viewedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageViews.length === 0 && <EmptyNote text="No homepage views logged yet." />}
        {viewsTotalPages > 1 && (
          <Pagination
            basePath="/admin"
            paramName="viewsPage"
            currentPage={viewsCurrentPage}
            totalPages={viewsTotalPages}
            preserve={{ page }}
          />
        )}
      </TableSection>

      {/* Registered centers */}
      <TableSection
        icon={<Building2 size={18} />}
        title="Registered Centres"
        description="Schools/coaching centres that have self-registered, each with their own teacher-managed student roster."
      >
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-faint">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">User ID</th>
              <th className="pb-2 pr-4">Students</th>
              <th className="pb-2">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {centers.map((c) => (
              <tr key={c.id}>
                <td className="py-2.5 pr-4 font-medium text-ink">{c.name}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{c.userId}</td>
                <td className="py-2.5 pr-4 text-ink-soft">
                  {studentCountByCenter.get(c.id) ?? 0}
                </td>
                <td className="py-2.5 text-ink-soft">
                  {c.createdAt ? formatDateOnly(c.createdAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {centers.length === 0 && <EmptyNote text="No centres registered yet." />}
      </TableSection>

      {/* Registered students roster */}
      <TableSection
        icon={<Users size={18} />}
        title="Registered Students"
        description="Existing accounts show the date this column was added, not their true original signup date - only accounts registered from now on will have an accurate one."
      >
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-faint">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">User ID</th>
              <th className="pb-2 pr-4">Level</th>
              <th className="pb-2">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stats.students.map((s) => (
              <tr key={s.id}>
                <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{s.userId}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{s.level}</td>
                <td className="py-2.5 text-ink-soft">
                  {s.createdAt ? formatDateOnly(s.createdAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.students.length === 0 && <EmptyNote text="No students registered yet." />}
      </TableSection>
    </div>
  );
}

