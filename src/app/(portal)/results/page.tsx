import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getResults } from "@/lib/store";
import { requireSessionOrRedirect } from "@/lib/auth";
import AbacusIllustration from "@/components/AbacusIllustration";
import { stackedLg } from "@/components/dashboard/stackedTable";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ResultsPage() {
  const student = await requireSessionOrRedirect();
  const all = await getResults();
  const results = all.filter((r) => r.studentId === student?.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Your Results</h2>
        <p className="mt-1 text-ink-soft">
          Every test you&apos;ve submitted, most recent first.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center shadow-sm ring-1 ring-line">
          <AbacusIllustration className="mx-auto mb-3 h-24 w-24" />
          <p className="font-semibold text-ink">No results yet</p>
          <p className="mt-1 text-sm text-ink-soft">
            Take a practice test from the dashboard to see your results here.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line">
          {/* Below 1024px (phones, and tablets beside the sidebar) each row
              becomes a labelled card, so Status and View are never cut off. */}
          <table className={`w-full text-left text-sm ${stackedLg.table}`}>
            <thead className={`bg-paper text-xs uppercase tracking-wide text-ink-faint ${stackedLg.head}`}>
              <tr>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className={`divide-y divide-line max-lg:p-3 ${stackedLg.body}`}>
              {results.map((r) => (
                <tr key={r.id} className={`hover:bg-paper ${stackedLg.row}`}>
                  <td
                    data-label="Submitted"
                    className={`px-5 py-4 font-semibold text-ink max-lg:px-0 max-lg:py-1 ${stackedLg.cell}`}
                  >
                    {formatDate(r.submittedAt)}
                  </td>
                  <td
                    data-label="Type"
                    className={`px-5 py-4 text-ink-soft max-lg:px-0 max-lg:py-1 ${stackedLg.cell}`}
                  >
                    {r.operationLabel ?? r.level}
                  </td>
                  <td
                    data-label="Score"
                    className={`px-5 py-4 max-lg:px-0 max-lg:py-1 ${stackedLg.cell}`}
                  >
                    <span>
                      <span className="font-bold text-brand">
                        {r.score}/{r.totalMarks}
                      </span>
                      <span className="ml-1 text-xs text-ink-faint">
                        ({r.scorePercent}%)
                      </span>
                    </span>
                  </td>
                  <td
                    data-label="Status"
                    className={`px-5 py-4 max-lg:px-0 max-lg:py-1 ${stackedLg.cell}`}
                  >
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.status === "Completed"
                          ? "bg-good-soft text-good"
                          : "bg-gold-soft text-ink"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-4 text-right max-lg:px-0 max-lg:pb-0 max-lg:pt-2 ${stackedLg.cell} max-lg:justify-end max-lg:before:hidden`}
                  >
                    <Link
                      href={`/results/${r.id}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-brand hover:underline max-lg:rounded-lg max-lg:bg-brand max-lg:px-4 max-lg:py-2 max-lg:text-white max-lg:no-underline"
                    >
                      View
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
