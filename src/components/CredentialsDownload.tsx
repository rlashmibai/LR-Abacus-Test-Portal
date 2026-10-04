"use client";

import { useState } from "react";
import { Download, Loader2, Timer, BookOpen } from "lucide-react";
import { LEVELS, DEFAULT_LINK_MODE, DEFAULT_LINK_QUESTIONS, levelTitle } from "@/lib/levels";
import { QUESTION_COUNTS } from "@/lib/testTypes";
import type { TestMode } from "@/lib/testTypes";
import { downloadCredentialsSheet } from "@/lib/credentialsSheet";
import type { SheetRow } from "@/lib/credentialsSheet";
import { useOrigin } from "@/lib/useOrigin";

const MODES: { value: TestMode; label: string; icon: typeof Timer }[] = [
  { value: "exam", label: "Exam (timed)", icon: Timer },
  { value: "practice", label: "Practice (untimed)", icon: BookOpen },
];

/** Downloads one Excel sheet with every student's name, User ID, password,
 * level and test link - for a whole centre or just one level. Passwords that
 * are already saved never change; only students with none saved are given one
 * (after the centre says yes). */
export default function CredentialsDownload({ studentCount }: { studentCount: number }) {
  const origin = useOrigin();
  const [level, setLevel] = useState("all");
  const [mode, setMode] = useState<TestMode>(DEFAULT_LINK_MODE);
  const [questionCount, setQuestionCount] = useState<number>(DEFAULT_LINK_QUESTIONS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ missing: number; total: number } | null>(null);

  async function run(assignMissing?: boolean) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/center/students/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, mode, questionCount, assignMissing }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else if (data.needsConfirm) {
        setConfirm({ missing: data.missing, total: data.total });
      } else {
        setConfirm(null);
        const rows = data.rows as SheetRow[];
        await downloadCredentialsSheet(rows, origin, "student-logins-and-test-links.xlsx");
        const withoutPassword = rows.filter((r) => !r.password).length;
        setMessage(
          `Downloaded ${rows.length} student${rows.length === 1 ? "" : "s"}.` +
            (withoutPassword > 0
              ? ` ${withoutPassword} ${withoutPassword === 1 ? "has" : "have"} no password in the sheet.`
              : "")
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  if (studentCount === 0) return null;

  return (
    <section className="space-y-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line sm:p-6">
      <div>
        <h2 className="font-display text-base font-semibold text-ink">Share logins &amp; test links</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Download an Excel sheet with each student&apos;s name, User ID, password, level and
          test link, ready to share. Passwords stay the same every time you download.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Students</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          >
            <option value="all">All students</option>
            {LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {levelTitle(l.level)} only
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Test link style</span>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${
                  mode === value
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line text-ink-soft hover:border-brand/40"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Questions</span>
          <div className="grid grid-cols-3 gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                aria-pressed={questionCount === count}
                className={`rounded-xl border-2 px-2 py-2 text-sm font-semibold transition ${
                  questionCount === count
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line text-ink-soft hover:border-brand/40"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {confirm && (
        <div className="space-y-3 rounded-xl bg-gold-soft px-4 py-3 text-sm text-ink">
          <p>
            <span className="font-semibold">
              {confirm.missing} of {confirm.total} student{confirm.total === 1 ? "" : "s"}
            </span>{" "}
            {confirm.missing === 1 ? "has" : "have"} no saved password (an older account, or the
            student chose their own). Shall I set one for{" "}
            {confirm.missing === 1 ? "them" : "each of them"}? It replaces their current password
            and then stays the same.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run(true)}
              disabled={busy}
              className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              Set passwords &amp; download
            </button>
            <button
              type="button"
              onClick={() => run(false)}
              disabled={busy}
              className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:text-brand disabled:opacity-60"
            >
              Download without them
            </button>
            <button
              type="button"
              onClick={() => setConfirm(null)}
              disabled={busy}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-good-soft px-3 py-2 text-sm font-medium text-good">{message}</p>
      )}

      <button
        type="button"
        onClick={() => run()}
        disabled={busy || confirm !== null}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download size={16} />
            Download Excel
          </>
        )}
      </button>
    </section>
  );
}
