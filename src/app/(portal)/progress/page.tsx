import { TrendingUp, Gauge, BarChart3 } from "lucide-react";
import { requireSessionOrRedirect } from "@/lib/auth";
import { getResults } from "@/lib/store";
import TrendChart from "@/components/TrendChart";
import AbacusIllustration from "@/components/AbacusIllustration";

export default async function ProgressPage() {
  const student = await requireSessionOrRedirect();
  const allResults = await getResults();
  const results = [...allResults]
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line">
        <AbacusIllustration className="mx-auto h-24 w-24" />
        <h2 className="font-display text-xl font-semibold text-ink">No Progress Yet</h2>
        <p className="text-sm text-ink-soft">
          Take your first practice test to start building your progress chart.
        </p>
      </div>
    );
  }

  const scoreData = results.map((r, i) => ({
    label: `#${i + 1}`,
    value: r.scorePercent,
  }));

  const speedData = results.map((r, i) => ({
    label: `#${i + 1}`,
    value: r.timeTakenSeconds > 0 ? Math.round((r.answered / r.timeTakenSeconds) * 60 * 10) / 10 : 0,
  }));

  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.scorePercent, 0) / results.length
  );
  const bestScore = Math.max(...results.map((r) => r.scorePercent));
  const totalTests = results.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Your Progress</h2>
        <p className="mt-1 text-ink-soft">
          Score trend and speed across your last {totalTests} test{totalTests === 1 ? "" : "s"}.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<BarChart3 size={18} />} label="Tests Completed" value={String(totalTests)} />
        <StatCard icon={<TrendingUp size={18} />} label="Average Score" value={`${avgScore}%`} />
        <StatCard icon={<Gauge size={18} />} label="Best Score" value={`${bestScore}%`} />
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="font-display text-lg font-semibold text-ink">Score Trend</h3>
        <p className="mb-4 text-sm text-ink-soft">Percent correct on each test, in order.</p>
        <TrendChart data={scoreData} color="var(--brand)" valueFormat={(v) => `${v}%`} />
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="font-display text-lg font-semibold text-ink">Speed Trend</h3>
        <p className="mb-4 text-sm text-ink-soft">
          Questions answered per minute - higher means faster.
        </p>
        <TrendChart data={speedData} color="var(--good)" valueFormat={(v) => `${v}/min`} />
      </section>
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
