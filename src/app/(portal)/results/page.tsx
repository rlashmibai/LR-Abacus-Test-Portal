import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { getStudent, getResults } from "@/lib/store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ResultsPage() {
  const student = await getStudent("5506");
  const all = await getResults();
  const results = all.filter((r) => r.studentId === student?.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Results</h2>
        <p className="mt-1 text-slate-500">
          Every test you&apos;ve submitted, most recent first.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <FileText className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="font-semibold text-slate-700">No results yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Take a practice test from the dashboard to see your results here.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Result</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    #{r.id}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(r.submittedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-indigo-600">
                      {r.score}/{r.totalMarks}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">
                      ({r.scorePercent}%)
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/results/${r.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
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
