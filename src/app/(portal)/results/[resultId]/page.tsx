import Link from "next/link";
import { notFound } from "next/navigation";
import { User, FileText } from "lucide-react";
import { getResult } from "@/lib/store";
import { requireSessionOrRedirect } from "@/lib/auth";
import AbacusIllustration from "@/components/AbacusIllustration";

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
      ? "var(--good)"
      : result.scorePercent >= 40
      ? "var(--gold)"
      : "var(--bad)";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-brand-soft p-8">
        <AbacusIllustration className="pointer-events-none absolute -bottom-6 -left-6 hidden h-32 w-32 opacity-40 lg:block" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-brand">
              RESULT DETAILS
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
              Test Result
            </h2>
            <p className="mt-1 text-ink-soft">
              {result.studentName} · {result.operationLabel ?? result.level}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${ringColor} ${result.scorePercent * 3.6}deg, var(--line) 0deg)`,
              }}
            >
              <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-surface">
                <span className="text-2xl font-extrabold text-ink">
                  {result.score}
                </span>
                <span className="text-[11px] text-ink-faint">
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
        <Stat label="Total Questions" value={result.totalQuestions} tone="brand" />
        <Stat label="Answered" value={result.answered} tone="good" />
        <Stat label="Unanswered" value={result.unanswered} tone="gold" />
        <Stat label="Correct" value={result.correct} tone="brand" />
        <Stat label="Time Taken" value={formatClock(result.timeTakenSeconds)} tone="good" />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InfoCard icon={<User size={18} />} title="Student Information">
          <Row label="Student Name" value={result.studentName} />
          <Row label="User ID" value={result.userId} />
          <Row label="Student ID" value={result.studentIdNumber} />
        </InfoCard>

        <InfoCard icon={<FileText size={18} />} title="Test Information">
          <Row label="Test Type" value={result.operationLabel ?? result.level} />
          <Row label="Mode" value={result.mode === "practice" ? "Practice (Untimed)" : "Exam (Timed)"} />
          <Row label="Status" value={result.status} />
          <Row label="Total Marks" value={String(result.totalMarks)} />
          <Row label="Marks Taken" value={result.answered > 0 ? String(result.score) : "-"} />
          <Row label="Submitted" value={formatDate(result.submittedAt)} />
        </InfoCard>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 font-display text-lg font-semibold text-ink">Answer Review</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
          {result.breakdown.map((b) => {
            const tone = b.isCorrect
              ? "border-good/30 bg-good-soft text-good"
              : b.givenAnswer === null
              ? "border-line bg-paper text-ink-soft"
              : "border-bad/30 bg-bad-soft text-bad";
            return (
              <div key={b.qNo} className={`rounded-xl border p-2.5 text-center text-xs ${tone}`}>
                <p className="font-semibold">Q{b.qNo}</p>
                <p className="mt-1 font-bold">
                  {b.givenAnswer === null ? "-" : b.givenAnswer}
                </p>
                {!b.isCorrect && (
                  <p className="mt-0.5 text-[10px] opacity-70">✗ {b.correctAnswer}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center pb-6">
        <Link
          href="/results"
          className="rounded-xl bg-paper px-6 py-2.5 text-sm font-semibold text-ink-soft hover:bg-brand-soft hover:text-brand"
        >
          Back to Results
        </Link>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  brand: "bg-brand-soft text-brand",
  good: "bg-good-soft text-good",
  gold: "bg-gold-soft text-ink",
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
    <div className={`rounded-2xl p-4 text-center shadow-sm ring-1 ring-line ${TONES[tone]}`}>
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
    <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-brand-soft p-2 text-brand">{icon}</div>
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      </div>
      <dl className="divide-y divide-line">{children}</dl>
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
