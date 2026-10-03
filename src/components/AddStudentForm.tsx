"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { LEVELS, DEFAULT_LEVEL, levelTitle } from "@/lib/levels";

export default function AddStudentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    name: "",
    password: "",
    level: String(DEFAULT_LEVEL),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/center/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setForm({ userId: "", name: "", password: "", level: String(DEFAULT_LEVEL) });
      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        <UserPlus size={16} />
        Add Student
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line"
    >
      <h3 className="font-display text-base font-semibold text-ink">
        Add a Student
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Student Name">
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Student's name"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>
        <Field label="User ID">
          <input
            required
            value={form.userId}
            onChange={(e) => update("userId", e.target.value)}
            placeholder="Unique site-wide, e.g. a roll number"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>
        <Field label="Password">
          <input
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 4 characters"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>
        <Field label="Level">
          <select
            value={form.level}
            onChange={(e) => update("level", e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          >
            {LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {levelTitle(l.level)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="text-xs text-ink-faint">
        Share this User ID and password with the student - they sign in at
        the normal sign-in page and see only their own results. The level is
        for your records only - students never see it.
      </p>

      {error && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Adding...
            </>
          ) : (
            "Add Student"
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}
