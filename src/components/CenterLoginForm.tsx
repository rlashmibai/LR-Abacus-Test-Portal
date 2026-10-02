"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "./AuthShell";

export default function CenterLoginForm({ quote }: { quote: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/center/login", {
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
      router.push("/center");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell quote={quote}>
      <h1 className="font-display text-3xl font-semibold text-ink">Center Login</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Sign in to manage your students and view their scores.
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
              placeholder="Enter your Center's User ID"
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
        </div>

        {error && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end text-sm">
          <Link href="/center/register" className="font-medium text-brand hover:underline">
            Register your Center instead
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
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

      <p className="mt-5 text-center text-xs text-ink-faint">
        Note: signing in here will sign you out of any student account
        logged in on this same browser.
      </p>
    </AuthShell>
  );
}
