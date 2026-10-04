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
  // The student just added - kept so a generated password can be shown once.
  const [added, setAdded] = useState<{ name: string; password?: string } | null>(null);

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
      setAdded({ name: form.name.trim(), password: data.password });
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
      <div className="space-y-3">
        {added && (
          <p className="rounded-xl bg-good-soft px-4 py-3 text-sm font-medium text-good">
            {added.name} was added.
            {added.password && (
              <>
                {" "}
                Their password is{" "}
                <span className="rounded bg-surface px-1.5 py-0.5 font-mono font-bold text-ink">
                  {added.password}
                </span>{" "}
                - it&apos;s saved, and you can download it any time in the Excel sheet.
              </>
            )}
          </p>
        )}
        <button
          onClick={() => {
            setAdded(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <UserPlus size={16} />
          Add Student
        </button>
      </div>
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
        <Field label="Password (optional)">
          <input
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Leave blank to set one for you"
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
        Share the User ID and password with the student - they sign in at
        the normal sign-in page and see only their own results. The password
        stays the same and is saved, so you can download it later in the
        Excel sheet. The level is for your records only - students never see it.
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
