"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Home, AlertTriangle, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import type { AnswerMap, PublicTestSession } from "@/lib/types";
import { pickQuote } from "@/lib/quotes";
import { playTimeWarning, playSuccessDing } from "@/lib/sound";

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
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ resultId: string } | null>(null);
  const [pulseTimer, setPulseTimer] = useState(false);
  const submitLock = useRef(false);
  const warnedFiveMinRef = useRef(false);
  const warnedOneMinRef = useRef(false);

  const isPractice = session?.mode === "practice";

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
            timeTakenSeconds: isPractice ? elapsed : Math.min(elapsed, durationSeconds),
            autoSubmitted,
          }),
        });
        const data = await res.json();
        clearProgress(testId);
        playSuccessDing();
        setSubmitted({ resultId: data.resultId });
      } catch {
        submitLock.current = false;
        setSubmitting(false);
      }
    },
    [answers, durationSeconds, isPractice, session, startedAt, testId]
  );

  // Elapsed-time clock, shared by both modes; exam mode also auto-submits
  // and plays a warning chime once when crossing 5 minutes and 1 minute
  // remaining (not a tick every second - just those two moments).
  useEffect(() => {
    if (!startedAt || submitted || !session) return;
    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setElapsedSeconds(elapsed);

      if (!isPractice) {
        const remaining = durationSeconds - elapsed;
        if (remaining <= 300 && !warnedFiveMinRef.current) {
          warnedFiveMinRef.current = true;
          playTimeWarning();
          setPulseTimer(true);
          setTimeout(() => setPulseTimer(false), 1500);
        }
        if (remaining <= 60 && !warnedOneMinRef.current) {
          warnedOneMinRef.current = true;
          playTimeWarning();
          setPulseTimer(true);
          setTimeout(() => setPulseTimer(false), 1500);
        }
        if (remaining <= 0) {
          submitTest(true);
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationSeconds, submitted, submitTest, isPractice, session]);

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
      <div className="flex min-h-screen items-center justify-center bg-paper p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto mb-3 text-gold" size={32} />
          <p className="font-semibold text-ink">{loadError}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
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

  if (!session || elapsedSeconds === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">Loading your test…</p>
      </div>
    );
  }

  const remainingSeconds = durationSeconds - elapsedSeconds;
  const isUrgent = !isPractice && remainingSeconds <= 60;
  const timerDisplay = isPractice ? elapsedSeconds : remainingSeconds;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-paper p-2 text-ink-soft hover:bg-brand-soft"
            aria-label="Back to dashboard"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-2 text-ink-soft hover:bg-paper hover:text-brand"
            aria-label="Go to homepage"
            title="Go to homepage"
          >
            <Home size={18} />
          </button>
          <h1 className="font-display text-lg font-semibold text-brand">
            {isPractice ? "Practice Test" : "Online Test"}
          </h1>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white transition-transform ${
            isPractice ? "bg-brand" : isUrgent ? "bg-bad animate-pulse" : "bg-good"
          } ${pulseTimer ? "scale-110" : "scale-100"}`}
        >
          {isPractice ? <BookOpen size={14} /> : "🕐"} {formatClock(timerDisplay)}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {session.studentName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <main className="w-full px-2 py-3 md:px-3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Questions</h2>
            <p className="text-sm text-ink-soft">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isPractice ? (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                <BookOpen size={14} />
                Practice mode - no time limit
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-bad-soft px-3 py-1.5 text-xs font-semibold text-bad">
                <AlertTriangle size={14} />
                Do not refresh this page
              </span>
            )}
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper"
            >
              Cancel Test
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-10">
          {session.questions.map((q) => {
            const isAnswered = parseAnswer(answers[q.qNo]) !== null;
            return (
              <div
                key={q.qNo}
                className="flex flex-col rounded-xl bg-white p-2 shadow-sm ring-1 ring-line"
              >
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                  Q.No {q.qNo}
                </p>
                <div className="mb-2 space-y-1 text-right font-mono text-base font-semibold text-ink">
                  {q.values.map((v, i) => (
                    <div key={i} className="rounded-md bg-white px-2 py-1">
                      {formatRow(q.opKind ?? session.operation, v, i, q.signs[i])}
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
                  className={`mt-auto rounded-lg border px-2 py-1.5 text-center text-base font-bold outline-none transition ${
                    isAnswered
                      ? "border-good bg-good-soft text-good"
                      : "border-line text-ink placeholder:font-normal placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand-soft"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft">
          <AlertTriangle className="text-gold" size={22} />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">Ready to Submit?</h3>
        <p className="mt-1 text-sm text-ink-soft">
          You have answered <span className="font-semibold text-brand">{answered}</span> out
          of {total} questions.
        </p>
        {unanswered > 0 && (
          <p className="mt-3 rounded-xl bg-gold-soft px-4 py-2 text-sm font-semibold text-ink">
            ⚠ {unanswered} questions left unanswered
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper"
          >
            Back To Exam
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bad-soft">
          <XCircle className="text-bad" size={22} />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">Cancel This Test?</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Your answers won&apos;t be saved and no result will be recorded. This
          can&apos;t be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper"
          >
            Keep Testing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-bad px-4 py-2.5 text-sm font-semibold text-white hover:bg-bad/90"
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
  // Lazy initializers: React invokes these once on mount rather than on
  // every render, so the randomness never leaks into the render body.
  const [confettiPieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.6,
      color: ["#3d3a7a", "#b5842c", "#2f7a5c", "#6b5fb8", "#d9a13f"][i % 5],
    }))
  );
  const [quote] = useState(() => pickQuote());

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper p-6">
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
      <div className="relative z-10 w-full max-w-sm animate-[pop-in_0.4s_ease-out] rounded-2xl bg-surface p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-good-soft">
          <CheckCircle2 className="text-good" size={36} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink">Test Submitted!</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Your answers have been submitted successfully.
        </p>
        <p className="mt-4 font-display text-sm italic text-brand">&ldquo;{quote}&rdquo;</p>
        <a
          href={`/results/${resultId}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
        >
          View My Result
        </a>
      </div>
    </div>
  );
}
