import type { Metadata } from "next";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListChecks,
  TrendingUp,
  Clock,
  Trophy,
} from "lucide-react";
import { getStudents, getResults, getCounterValue } from "@/lib/store";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default async function AdminPage() {
  const [students, results, guestSessionCount] = await Promise.all([
    getStudents(),
    getResults(),
    getCounterValue("guest"),
  ]);
  const stats = computeAdminStats(students, results, guestSessionCount);

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
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Users size={18} />} label="Total Students" value={String(stats.totalStudents)} />
        <StatCard icon={<UserPlus size={18} />} label="Guest Sessions" value={String(stats.totalGuestSessions)} />
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
        title="Recent Submissions"
        description="The 20 most recently submitted tests, site-wide."
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
            {stats.recentResults.map((r) => (
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
        {stats.recentResults.length === 0 && <EmptyNote text="No tests submitted yet." />}
      </TableSection>

      {/* Registered students roster */}
      <TableSection
        icon={<Users size={18} />}
        title="Registered Students"
        description="Signup order/date isn't tracked in the current schema, so this list isn't sortable by when someone joined."
      >
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-faint">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">User ID</th>
              <th className="pb-2">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {stats.students.map((s) => (
              <tr key={s.id}>
                <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                <td className="py-2.5 pr-4 text-ink-soft">{s.userId}</td>
                <td className="py-2.5 text-ink-soft">{s.level}</td>
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
