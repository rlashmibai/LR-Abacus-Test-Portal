import Link from "next/link";
import { Award } from "lucide-react";
import { requireSessionOrRedirect } from "@/lib/auth";
import { getResults } from "@/lib/store";
import { computeAchievements, hasAnyMilestone } from "@/lib/achievements";
import { BRAND_NAME } from "@/lib/brand";
import AbacusIllustration from "@/components/AbacusIllustration";
import PrintButton from "@/components/PrintButton";

export default async function CertificatePage() {
  const student = await requireSessionOrRedirect();
  const allResults = await getResults();
  const results = allResults.filter((r) => r.studentId === student.id);
  const achievements = computeAchievements(results);

  if (!hasAnyMilestone(achievements)) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line">
        <h2 className="font-display text-xl font-semibold text-ink">
          No Certificate Yet
        </h2>
        <p className="text-sm text-ink-soft">
          Complete a test to earn your first achievement and unlock a
          certificate.
        </p>
        <Link
          href="/achievements"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          View Achievements
        </Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    dateStyle: "long",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center print:hidden">
        <h2 className="font-display text-2xl font-semibold text-ink">Your Certificate</h2>
        <p className="mt-1 text-ink-soft">Print it, save it as a PDF, or just show it off.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-4 border-double border-brand bg-surface p-10 shadow-sm print:border-2 print:shadow-none md:p-16">
        <AbacusIllustration className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 opacity-10" />
        <AbacusIllustration className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 opacity-10" />

        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {BRAND_NAME}
          </p>

          <div className="mx-auto my-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
            <Award size={30} className="text-gold" />
          </div>

          <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            Certificate of Achievement
          </h1>

          <p className="mt-8 text-sm uppercase tracking-wide text-ink-faint">
            This certifies that
          </p>
          <p className="mt-2 font-display text-4xl font-semibold italic text-brand md:text-5xl">
            {student.name}
          </p>

          <p className="mx-auto mt-8 max-w-md text-ink-soft">
            has shown outstanding dedication, focus, and skill in abacus
            mental math practice, earning this recognition through
            consistent effort and steady improvement.
          </p>

          <div className="mx-auto mt-10 flex max-w-sm items-center justify-between border-t border-line pt-4 text-xs text-ink-faint">
            <span>{today}</span>
            <span className="font-display italic text-brand">{BRAND_NAME}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 pb-4 print:hidden">
        <PrintButton />
        <Link
          href="/achievements"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink-soft hover:bg-paper"
        >
          Back to Achievements
        </Link>
      </div>
    </div>
  );
}
