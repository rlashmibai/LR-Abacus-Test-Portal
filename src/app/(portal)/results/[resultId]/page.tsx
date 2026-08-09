import Link from "next/link";
import { notFound } from "next/navigation";
import { User, FileText } from "lucide-react";
import { getResult } from "@/lib/store";
import { requireSessionOrRedirect } from "@/lib/auth";

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

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const student = await requireSessionOrRedirect();
  const { resultId } = await params;
  const result = await getResult(resultId);
  if (!result || result.studentId !== student.id) notFound();

  const ringColor =
    result.scorePercent >= 70
      ? "#10b981"
      : result.scorePercent >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-100 p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-block rounded-full bg-indigo-200/70 px-3 py-1 text-xs font-bold tracking-wide text-indigo-700">
              RESULT DETAILS
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Result #{result.id}
            </h2>
            <p className="mt-1 text-slate-600">
              {result.studentName} · {result.level}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${ringColor} ${result.scorePercent * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-extrabold text-slate-900">
                  {result.score}
                </span>
                <span className="text-[11px] text-slate-400">
                  /{result.totalMarks}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold" style={{ color: ringColor }}>
              {result.scorePercent}% Score
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Total Questions" value={result.totalQuestions} tone="indigo" />
        <Stat label="Answered" value={result.answered} tone="emerald" />
        <Stat label="Unanswered" value={result.unanswered} tone="amber" />
        <Stat label="Correct" value={result.correct} tone="violet" />
        <Stat label="Time Taken" value={formatClock(result.timeTakenSeconds)} tone="sky" />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InfoCard icon={<User size={18} />} title="Student Information">
          <Row label="Student Name" value={result.studentName} />
          <Row label="User ID" value={result.userId} />
          <Row label="Centre" value={result.centerName} />
          <Row label="Student ID" value={result.studentIdNumber} />
        </InfoCard>

        <InfoCard icon={<FileText size={18} />} title="Test Information">
          <Row label="Test ID" value={result.testId} />
          <Row label="Level" value={result.level} />
          <Row label="Status" value={result.status} />
          <Row label="Total Marks" value={String(result.totalMarks)} />
          <Row label="Marks Taken" value={result.answered > 0 ? String(result.score) : "—"} />
          <Row label="Submitted" value={formatDate(result.submittedAt)} />
        </InfoCard>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Answer Review</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
          {result.breakdown.map((b) => {
            const tone = b.isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : b.givenAnswer === null
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-red-200 bg-red-50 text-red-700";
            return (
              <div key={b.qNo} className={`rounded-xl border p-2.5 text-center text-xs ${tone}`}>
                <p className="font-semibold">Q{b.qNo}</p>
                <p className="mt-1 font-bold">
                  {b.givenAnswer === null ? "—" : b.givenAnswer}
                </p>
                {!b.isCorrect && (
                  <p className="mt-0.5 text-[10px] opacity-70">✓ {b.correctAnswer}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center pb-6">
        <Link
          href="/results"
          className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Back to Results
        </Link>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  sky: "bg-sky-50 text-sky-700",
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={`rounded-2xl p-4 text-center shadow-sm ring-1 ring-slate-100 ${TONES[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">{icon}</div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
