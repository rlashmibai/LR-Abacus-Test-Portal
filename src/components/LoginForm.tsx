"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "./AuthShell";

export default function LoginForm({ quote }: { quote: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
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

  async function handleGuest() {
    setError(null);
    setGuestLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't start a guest session. Please try again.");
      setGuestLoading(false);
    }
  }

  return (
    <AuthShell quote={quote}>
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Sign in to continue sharpening your speed and accuracy.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            User ID
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
            <User size={16} className="text-ink-faint" />
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              autoComplete="username"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
            <Lock size={16} className="text-ink-faint" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-ink-faint hover:text-ink-soft"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">Minimum 4 characters</p>
        </div>

        {error && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <Link href="/change-password" className="font-medium text-brand hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="font-medium text-brand hover:underline">
            Register instead
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || guestLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <button
        onClick={handleGuest}
        disabled={loading || guestLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand-soft px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft/70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {guestLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Setting up demo...
          </>
        ) : (
          "Try instant access as a guest"
        )}
      </button>
      <p className="mt-2 text-center text-xs text-ink-faint">
        No sign-up needed - jump straight into a practice test.
      </p>
    </AuthShell>
  );
}
