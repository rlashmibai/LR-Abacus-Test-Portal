import Link from "next/link";
import { Lock, FileBadge, ArrowRight } from "lucide-react";
import { requireSessionOrRedirect } from "@/lib/auth";
import { getResults } from "@/lib/store";
import { computeAchievements, hasAnyMilestone } from "@/lib/achievements";

export default async function AchievementsPage() {
  const student = await requireSessionOrRedirect();
  const allResults = await getResults();
  const results = allResults.filter((r) => r.studentId === student.id);
  const achievements = computeAchievements(results);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Achievements</h2>
        <p className="mt-1 text-ink-soft">
          {earnedCount} of {achievements.length} badges earned. Keep practicing to unlock the rest!
        </p>
      </div>

      {hasAnyMilestone(achievements) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-soft p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <FileBadge size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink">You&apos;ve unlocked a certificate!</p>
              <p className="text-sm text-ink-soft">
                Download or print a certificate to celebrate your progress.
              </p>
            </div>
          </div>
          <Link
            href="/certificate"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            View Certificate
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl p-5 text-center shadow-sm ring-1 ${
              a.earned
                ? "bg-surface ring-line [animation:badge-pop_0.5s_ease-out]"
                : "bg-surface ring-line opacity-70"
            }`}
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                a.earned ? "bg-gold-soft" : "bg-line"
              }`}
            >
              {a.earned ? a.icon : <Lock size={22} className="text-ink-faint" />}
            </div>
            <p className="mt-3 font-display text-base font-semibold text-ink">{a.label}</p>
            <p className="mt-1 text-xs text-ink-soft">{a.description}</p>
            {a.earned && a.earnedAt && (
              <p className="mt-2 text-[11px] font-semibold text-good">
                Earned {new Date(a.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
