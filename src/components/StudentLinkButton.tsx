"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2, RefreshCw, Timer, BookOpen } from "lucide-react";
import { DEFAULT_LINK_MODE, DEFAULT_LINK_QUESTIONS } from "@/lib/levels";
import { QUESTION_COUNTS } from "@/lib/testTypes";
import type { TestMode } from "@/lib/testTypes";
import { useOrigin } from "@/lib/useOrigin";

const MODES: { value: TestMode; label: string; icon: typeof Timer }[] = [
  { value: "exam", label: "Exam", icon: Timer },
  { value: "practice", label: "Practice", icon: BookOpen },
];

/** A roster row's "Test link" option: shows the test link for the student's
 * level (created automatically the first time), lets the centre pick the
 * style, copy it, or generate a brand-new link. */
export default function StudentLinkButton({ level }: { level: number }) {
  const origin = useOrigin();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TestMode>(DEFAULT_LINK_MODE);
  const [questionCount, setQuestionCount] = useState<number>(DEFAULT_LINK_QUESTIONS);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  async function load(nextMode: TestMode, nextCount: number, regenerate = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/center/test-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, mode: nextMode, questionCount: nextCount, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setCode(data.code);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
    setConfirmNew(false);
  }

  function openPanel() {
    setOpen(true);
    void load(mode, questionCount);
  }

  function chooseMode(next: TestMode) {
    setMode(next);
    void load(next, questionCount);
  }

  function chooseCount(next: number) {
    setQuestionCount(next);
    void load(mode, next);
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(`${origin}/t/${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked - the address is selectable in the box anyway.
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPanel}
        className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand hover:underline"
      >
        <Link2 size={14} />
        Test link
      </button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-xl bg-surface p-3 text-left ring-1 ring-line sm:w-72">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Test link</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-ink-soft hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseMode(value)}
            disabled={busy}
            aria-pressed={mode === value}
            className={`flex items-center justify-center gap-1 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              mode === value
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-ink-soft hover:border-brand/40"
            }`}
          >
            <Icon size={12} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {QUESTION_COUNTS.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => chooseCount(count)}
            disabled={busy}
            aria-pressed={questionCount === count}
            className={`rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              questionCount === count
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-ink-soft hover:border-brand/40"
            }`}
          >
            {count} Qs
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={code ? `${origin}/t/${code}` : busy ? "Getting the link..." : ""}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Test link address"
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs text-ink-soft outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!code || busy}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : copied ? (
            <Check size={13} />
          ) : (
            <Copy size={13} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {error && <p className="text-xs font-medium text-bad">{error}</p>}

      {confirmNew ? (
        <div className="space-y-2 rounded-lg bg-gold-soft px-3 py-2 text-xs text-ink">
          <p>
            The current link for this level and style will stop working. Generate a new one?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => load(mode, questionCount, true)}
              disabled={busy}
              className="font-semibold text-brand hover:underline disabled:opacity-60"
            >
              Yes, generate new
            </button>
            <button
              type="button"
              onClick={() => setConfirmNew(false)}
              className="font-semibold text-ink-soft hover:text-ink"
            >
              Keep current
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmNew(true)}
          disabled={busy || !code}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-brand disabled:opacity-60"
        >
          <RefreshCw size={12} />
          Generate new test link
        </button>
      )}
    </div>
  );
}
