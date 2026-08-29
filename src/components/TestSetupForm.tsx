"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Timer, BookOpen, Eye } from "lucide-react";
import {
  OPERATIONS,
  getOperation,
  QUESTION_COUNTS,
  ROW_COUNTS,
  DEFAULT_ROW_COUNT,
  durationForQuestionCount,
} from "@/lib/testTypes";
import type { TestMode } from "@/lib/testTypes";
import { generateQuestions } from "@/lib/questions";
import { formatRow } from "@/lib/formatRow";

const MODES: { value: TestMode; label: string; text: string; icon: typeof Timer }[] = [
  {
    value: "exam",
    label: "Exam Mode",
    text: "Timed - the clock counts down and auto-submits at zero.",
    icon: Timer,
  },
  {
    value: "practice",
    label: "Practice Mode",
    text: "Untimed - take as long as you need, submit whenever you're ready.",
    icon: BookOpen,
  },
];

export default function TestSetupForm() {
  const router = useRouter();
  const [operation, setOperation] = useState(OPERATIONS[0].value);
  const [variant, setVariant] = useState(OPERATIONS[0].variants[0].value);
  const [rows, setRows] = useState<number>(DEFAULT_ROW_COUNT);
  const [questionCount, setQuestionCount] = useState<number>(100);
  const [mode, setMode] = useState<TestMode>("exam");

  const activeOperation = getOperation(operation);
  const showRows = operation === "addition_subtraction";
  const questionsStep = showRows ? 4 : 3;
  const modeStep = showRows ? 5 : 4;

  // A single live sample question, regenerated whenever the current
  // choices change - lets a student see exactly what they're about to
  // get instead of just reading a static text example.
  const sampleQuestion = useMemo(() => {
    const [q] = generateQuestions({
      testId: `preview-${operation}-${variant}-${rows}`,
      operation,
      variant,
      totalQuestions: 1,
      rows,
    });
    return q;
  }, [operation, variant, rows]);

  function selectOperation(op: string) {
    setOperation(op as typeof operation);
    const def = getOperation(op);
    setVariant(def.variants[0].value);
  }

  function handleCreateTest() {
    const params = new URLSearchParams({
      operation,
      variant,
      questionCount: String(questionCount),
      mode,
      ...(showRows ? { rows: String(rows) } : {}),
    });
    router.push(`/instructions?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          1. Operation
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPERATIONS.map((op) => {
            const active = op.value === operation;
            return (
              <button
                key={op.value}
                onClick={() => selectOperation(op.value)}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-line hover:border-brand/40 hover:bg-paper"
                }`}
              >
                <div className="text-2xl">{op.icon}</div>
                <p className="mt-2 text-sm font-bold text-ink">{op.label}</p>
                <p className="mt-1 text-xs text-ink-soft">{op.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          2. Digit Size
        </h3>
        {activeOperation.variants.length === 1 ? (
          <div className="rounded-2xl border-2 border-brand bg-brand-soft p-4">
            <p className="text-sm font-bold text-ink">
              {activeOperation.variants[0].label}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Example: {activeOperation.variants[0].example}
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              This is the only digit size available for {activeOperation.label.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {activeOperation.variants.map((v) => {
              const active = v.value === variant;
              return (
                <button
                  key={v.value}
                  onClick={() => setVariant(v.value)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-brand/40 hover:bg-paper"
                  }`}
                >
                  <p className="text-sm font-bold text-ink">{v.label}</p>
                  <p className="mt-1 text-xs text-ink-soft">Example: {v.example}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {showRows && (
        <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            3. Rows per Question
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ROW_COUNTS.map((count) => {
              const active = count === rows;
              return (
                <button
                  key={count}
                  onClick={() => setRows(count)}
                  className={`rounded-2xl border-2 p-4 text-center transition ${
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:border-brand/40 hover:bg-paper"
                  }`}
                >
                  <p className="text-lg font-bold text-ink">{count}</p>
                  <p className="mt-1 text-xs text-ink-soft">rows</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-brand-soft p-6 md:p-8">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-brand">
          <Eye size={14} />
          Sample Question Preview
        </h3>
        <div className="mx-auto flex w-40 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint">
            Q.No 1
          </p>
          <div className="mb-2 space-y-1 text-right font-mono text-base font-semibold text-ink">
            {sampleQuestion.values.map((v, i) => (
              <div key={i}>
                {formatRow(sampleQuestion.opKind ?? operation, v, i, sampleQuestion.signs[i])}
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-lg border border-line px-2 py-1.5 text-center text-base font-bold text-ink-faint">
            Ans
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">
          This is exactly what a question will look like with your current choices.
        </p>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          {questionsStep}. Number of Questions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {QUESTION_COUNTS.map((count) => {
            const active = count === questionCount;
            return (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`rounded-2xl border-2 p-4 text-center transition ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-line hover:border-brand/40 hover:bg-paper"
                }`}
              >
                <p className="text-lg font-bold text-ink">{count}</p>
                <p className="mt-1 text-xs text-ink-soft">questions</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          {modeStep}. Practice or Exam
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map(({ value, label, text, icon: Icon }) => {
            const active = value === mode;
            return (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-line hover:border-brand/40 hover:bg-paper"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{label}</p>
                  <p className="mt-1 text-xs text-ink-soft">{text}</p>
                  {value === "exam" && (
                    <p className="mt-1 text-xs font-semibold text-brand">
                      {durationForQuestionCount(questionCount)} Mins for {questionCount} questions
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center pb-4">
        <button
          onClick={handleCreateTest}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Create Test
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
