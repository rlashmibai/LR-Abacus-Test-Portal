"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User, Building2 } from "lucide-react";
import AuthShell from "./AuthShell";

type AccountType = "student" | "centre";

export default function RegisterForm({
  quote,
  initialType = "student",
}: {
  quote: string;
  initialType?: AccountType;
}) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [form, setForm] = useState({
    userId: "",
    name: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCentre = accountType === "centre";

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
      const res = await fetch(isCentre ? "/api/center/register" : "/api/auth/register", {
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
      router.push(isCentre ? "/center" : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell quote={quote}>
      <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {isCentre
          ? "Register your school or coaching centre, then add each student's own login underneath it and track their scores."
          : "Register to save your progress and results across tests."}
      </p>

      <div
        role="tablist"
        aria-label="Account type"
        className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-paper p-1"
      >
        <TypeTab
          active={!isCentre}
          onClick={() => setAccountType("student")}
          icon={<User size={15} />}
          label="Student"
        />
        <TypeTab
          active={isCentre}
          onClick={() => setAccountType("centre")}
          icon={<Building2 size={15} />}
          label="Centre"
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isCentre ? (
          <Field label="Centre Name">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Sunrise Abacus Academy"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>
        ) : null}

        <Field label="User ID">
          <input
            required
            value={form.userId}
            onChange={(e) => update("userId", e.target.value)}
            placeholder="Choose a User ID"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>

        {!isCentre ? (
          <Field label="Full Name">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </Field>
        ) : null}

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
          ) : isCentre ? (
            "Register Centre"
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
    </AuthShell>
  );
}

function TypeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-surface text-brand shadow-sm ring-1 ring-line"
          : "text-ink-soft hover:text-brand"
      }`}
    >
      {icon}
      {label}
    </button>
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
