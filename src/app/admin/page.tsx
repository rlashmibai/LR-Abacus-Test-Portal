import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListChecks,
  TrendingUp,
  Clock,
  Trophy,
  Eye,
} from "lucide-react";
import { getStudents, getResults, getCounterValue, getPageViews } from "@/lib/store";
import { computeAdminStats } from "@/lib/adminStats";
import { BRAND_NAME } from "@/lib/brand";
import TrendChart from "@/components/TrendChart";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
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
  const [students, results, guestSessionCount, pageViews, { page, viewsPage }] =
    await Promise.all([
      getStudents(),
      getResults(),
      getCounterValue("guest"),
      getPageViews(),
      searchParams,
    ]);
  const stats = computeAdminStats(students, results, guestSessionCount);

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
            paramName="viewsPage"
            currentPage={viewsCurrentPage}
            totalPages={viewsTotalPages}
            preserve={{ page }}
          />
        )}
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
      <div className="rounded-xl bg-brand-soft p-2.5 text-brand">{icon}</div>
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-base font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

function BreakdownCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <dl className="mt-2 divide-y divide-line">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ChartSection({
  title,
  description,
  data,
  color,
  valueFormat,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  color: string;
  valueFormat: (v: number) => string;
}) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
      {data.length > 0 ? (
        <TrendChart data={data} color={color} valueFormat={valueFormat} />
      ) : (
        <EmptyNote text="No data yet." />
      )}
    </section>
  );
}

function TableSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="rounded-xl bg-brand-soft p-2 text-brand">{icon}</div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-ink-faint">{text}</p>;
}

function Pagination({
  paramName,
  currentPage,
  totalPages,
  preserve,
}: {
  paramName: string;
  currentPage: number;
  totalPages: number;
  preserve?: Record<string, string | undefined>;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(preserve ?? {})) {
      if (value) params.set(key, value);
    }
    params.set(paramName, String(n));
    return `/admin?${params.toString()}`;
  };
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
            n === currentPage
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-paper"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
