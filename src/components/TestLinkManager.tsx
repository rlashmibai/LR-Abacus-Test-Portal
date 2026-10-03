"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, Trash2, Loader2, Timer, BookOpen } from "lucide-react";
import { LEVELS, DEFAULT_LEVEL, levelTitle } from "@/lib/levels";
import { QUESTION_COUNTS, durationForQuestionCount } from "@/lib/testTypes";
import type { TestMode } from "@/lib/testTypes";

export interface TestLinkItem {
  code: string;
  level: number;
  mode: TestMode;
  questionCount: number;
  attempts: number; // how many times students have submitted a test from this link
}

const MODES: { value: TestMode; label: string; icon: typeof Timer }[] = [
  { value: "exam", label: "Exam (timed)", icon: Timer },
  { value: "practice", label: "Practice (untimed)", icon: BookOpen },
];

export default function TestLinkManager({ links }: { links: TestLinkItem[] }) {
  const router = useRouter();
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [mode, setMode] = useState<TestMode>("exam");
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // The site's address is only known in the browser (empty while rendering
  // on the server), so the full link appears right after the page loads.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setCreating(true);
    try {
      const res = await fetch("/api/center/test-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, mode, questionCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setNotice(
          data.existing
            ? "You already had a link for that - it's in the list below."
            : "Link created - copy it from the list below."
        );
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-5 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line"
      >
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Link2 size={18} className="text-brand" />
            Create a test link
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Share the link with your students. They sign in with the User ID you gave them,
            take the test, and their result appears on your dashboard.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            >
              {LEVELS.map((l) => (
                <option key={l.level} value={l.level}>
                  {levelTitle(l.level)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Mode</span>
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
                  <Icon size={14} />
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
            {mode === "exam" && (
              <p className="mt-1.5 text-xs text-ink-faint">
                {durationForQuestionCount(questionCount)} minutes for {questionCount} questions
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">{error}</p>
        )}
        {notice && (
          <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm font-medium text-brand">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {creating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating...
            </>
          ) : (
            "Create link"
          )}
        </button>
      </form>

      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
        <h2 className="font-display text-lg font-semibold text-ink">Your test links</h2>
        {links.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">
            No links yet - create your first one above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {links.map((link) => (
              <LinkRow key={link.code} link={link} origin={origin} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LinkRow({ link, origin }: { link: TestLinkItem; origin: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const url = `${origin}/t/${link.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked - the address is selectable in the box anyway.
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/center/test-links/${link.code}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <li className="space-y-2.5 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-semibold text-ink">{levelTitle(link.level)}</p>
        <p className="text-xs text-ink-soft">
          {link.mode === "exam"
            ? `Exam · ${durationForQuestionCount(link.questionCount)} min`
            : "Practice · untimed"}{" "}
          · {link.questionCount} questions · {link.attempts} attempt
          {link.attempts === 1 ? "" : "s"} so far
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Test link address"
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink-soft outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="font-semibold text-bad hover:underline disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="font-semibold text-ink-soft hover:text-ink"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Delete this link"
            className="rounded-lg p-2 text-ink-faint transition hover:bg-bad-soft hover:text-bad"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </li>
  );
}
