"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    name: "",
    centerName: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
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
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md rounded-[28px] bg-surface p-8 shadow-xl ring-1 ring-line md:p-10">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <GraduationCap size={18} />
          </div>
          <span className="font-display text-lg font-semibold text-brand">Student Portal</span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Register to save your progress and results across tests.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="User ID">
            <input
              required
              value={form.userId}
              onChange={(e) => update("userId", e.target.value)}
              placeholder="Choose a User ID"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>

          <Field label="Full Name">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>

          <Field label="Center Name">
            <input
              value={form.centerName}
              onChange={(e) => update("centerName", e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>

          <Field label="Password">
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 4 characters"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
            <p className="mt-1.5 text-xs text-ink-faint">Minimum 4 characters</p>
          </Field>

          <Field label="Confirm Password">
            <input
              required
              type="password"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
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
