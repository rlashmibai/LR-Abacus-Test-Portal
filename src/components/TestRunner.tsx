"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { AnswerMap, PublicTestSession } from "@/lib/types";

const STORAGE_PREFIX = "abacus-test-";

// Raw text per question, so a partial entry like "-" while typing a
// negative number doesn't get rejected mid-keystroke.
type DraftAnswers = Record<number, string>;

interface StoredProgress {
  startedAt: number;
  answers: DraftAnswers;
}

function loadProgress(testId: string): StoredProgress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + testId);
    return raw ? (JSON.parse(raw) as StoredProgress) : null;
  } catch {
    return null;
  }
}

function saveProgress(testId: string, progress: StoredProgress) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + testId, JSON.stringify(progress));
  } catch {
    /* storage unavailable — ignore, in-memory state still works */
  }
}

function clearProgress(testId: string) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + testId);
  } catch {
    /* ignore */
  }
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

/** A fully-typed integer, or null while the box is empty/mid-edit (e.g. just "-"). */
function parseAnswer(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}

/** How to render one operand row, depending on the test's operation. */
function formatRow(operation: string, value: number, index: number, sign: number): string {
  if (index === 0) return String(value);
  if (operation === "multiplication") return `x ${value}`;
  if (operation === "division") return `/ ${value}`;
  return sign < 0 ? `- ${value}` : String(value);
}

export default function TestRunner({ testId }: { testId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<PublicTestSession | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<DraftAnswers>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ resultId: string } | null>(null);
  const submitLock = useRef(false);

  // Load the test session + restore any in-progress answers.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (!res.ok) throw new Error("not found");
        const data: PublicTestSession = await res.json();
        if (cancelled) return;
        setSession(data);

        const stored = loadProgress(testId);
        if (stored) {
          setAnswers(stored.answers);
          setStartedAt(stored.startedAt);
        } else {
          const now = Date.now();
          setAnswers({});
          setStartedAt(now);
          saveProgress(testId, { startedAt: now, answers: {} });
        }
      } catch {
        if (!cancelled) setLoadError("We couldn't load this test. It may have expired.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const durationSeconds = (session?.durationMinutes ?? 10) * 60;

  const submitTest = useCallback(
    async (autoSubmitted: boolean) => {
      if (submitLock.current || !session) return;
      submitLock.current = true;
      setSubmitting(true);
      const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;

      const payload: AnswerMap = {};
      session.questions.forEach((q) => {
        payload[q.qNo] = parseAnswer(answers[q.qNo]);
      });

      try {
        const res = await fetch(`/api/tests/${testId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: payload,
            timeTakenSeconds: Math.min(elapsed, durationSeconds),
            autoSubmitted,
          }),
        });
        const data = await res.json();
        clearProgress(testId);
        setSubmitted({ resultId: data.resultId });
      } catch {
        submitLock.current = false;
        setSubmitting(false);
      }
    },
    [answers, durationSeconds, session, startedAt, testId]
  );

  // Countdown timer.
  useEffect(() => {
    if (!startedAt || submitted) return;
    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = durationSeconds - elapsed;
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        submitTest(true);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationSeconds, submitted, submitTest]);

  function handleAnswerChange(qNo: number, raw: string) {
    // Only allow an optional leading "-" followed by digits, so stray
    // characters never sneak into the box.
    if (raw !== "" && !/^-?\d*$/.test(raw)) return;
    setAnswers((prev) => {
      const next = { ...prev, [qNo]: raw };
      if (startedAt) saveProgress(testId, { startedAt, answers: next });
      return next;
    });
  }

  function handleCancelTest() {
    clearProgress(testId);
    router.push("/dashboard");
  }

  function focusNext(qNo: number) {
    const el = document.getElementById(`ans-${qNo + 1}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  }

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((qNo) => parseAnswer(answers[Number(qNo)]) !== null).length,
    [answers]
  );
  const totalQuestions = session?.totalQuestions ?? 100;

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0fb] p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
          <p className="font-semibold text-slate-800">{loadError}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SubmittedScreen resultId={submitted.resultId} />;
  }

  if (!session || remainingSeconds === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0fb]">
        <p className="text-sm text-slate-500">Loading your test…</p>
      </div>
    );
  }

  const isUrgent = remainingSeconds <= 60;

  return (
    <div className="min-h-screen bg-[#eef0fb]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg bg-slate-100 p-2 text-slate-600"
            aria-label="Menu"
            disabled
          >
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold text-indigo-600">Online Test</h1>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm ${
            isUrgent ? "bg-red-500 animate-pulse" : "bg-emerald-500"
          }`}
        >
          🕐 {formatClock(remainingSeconds)}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              1
            </span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            {session.studentName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Questions</h2>
            <p className="text-sm text-slate-500">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
              <AlertTriangle size={14} />
              Do not refresh this page
            </span>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Cancel Test
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {session.questions.map((q) => {
            const isAnswered = parseAnswer(answers[q.qNo]) !== null;
            return (
              <div
                key={q.qNo}
                className="flex flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Q.No {q.qNo}
                </p>
                <div className="mb-2 space-y-1 text-right font-mono text-sm text-slate-700">
                  {q.values.map((v, i) => (
                    <div key={i} className="rounded-md bg-slate-50 px-2 py-1">
                      {formatRow(session.operation, v, i, q.signs[i])}
                    </div>
                  ))}
                </div>
                <input
                  id={`ans-${q.qNo}`}
                  value={answers[q.qNo] ?? ""}
                  onChange={(e) => handleAnswerChange(q.qNo, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      focusNext(q.qNo);
                    }
                  }}
                  inputMode="numeric"
                  placeholder="Ans"
                  aria-label={`Answer for question ${q.qNo}`}
                  className={`mt-auto rounded-lg border px-2 py-1.5 text-center text-sm font-bold outline-none transition ${
                    isAnswered
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </main>

      {showConfirm && (
        <SubmitConfirmModal
          answered={answeredCount}
          total={totalQuestions}
          submitting={submitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => submitTest(false)}
        />
      )}

      {showCancelConfirm && (
        <CancelConfirmModal
          onBack={() => setShowCancelConfirm(false)}
          onConfirm={handleCancelTest}
        />
      )}
    </div>
  );
}

function SubmitConfirmModal({
  answered,
  total,
  submitting,
  onCancel,
  onConfirm,
}: {
  answered: number;
  total: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="text-amber-500" size={22} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Ready to Submit?</h3>
        <p className="mt-1 text-sm text-slate-500">
          You have answered <span className="font-semibold text-indigo-600">{answered}</span> out
          of {total} questions.
        </p>
        {unanswered > 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            ⚠ {unanswered} questions left unanswered
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back To Exam
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {submitting ? "Submitting…" : "Yes, Submit ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelConfirmModal({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <XCircle className="text-red-500" size={22} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Cancel This Test?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Your answers won&apos;t be saved and no result will be recorded. This
          can&apos;t be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Keep Testing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Yes, Cancel Test
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfettiPiece {
  left: number;
  delay: number;
  duration: number;
  color: string;
}

function SubmittedScreen({ resultId }: { resultId: string }) {
  // Lazy initializer: React invokes this once on mount rather than on
  // every render, so the randomness never leaks into the render body.
  const [confettiPieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.6,
      color: ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899"][i % 5],
    }))
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef0fb] p-6">
      {confettiPieces.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="text-emerald-500" size={36} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Test Submitted!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your answers have been submitted successfully.
        </p>
        <a
          href={`/results/${resultId}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          View My Result
        </a>
      </div>
    </div>
  );
}
