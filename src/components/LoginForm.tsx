"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, User, Lock, Eye, EyeOff, Loader2, Star, Target } from "lucide-react";

export default function LoginForm() {
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
    <div className="flex min-h-screen items-center justify-center bg-[#eef0fb] p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-bold text-indigo-600">Student Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">Welcome Back! 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hi Dears!! Uncover your speed &amp; accuracy !!! 🎉
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                User ID
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <User size={16} className="text-slate-400" />
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  autoComplete="username"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <Lock size={16} className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Minimum 4 characters</p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <Link href="/change-password" className="font-semibold text-indigo-600 hover:underline">
                Forgot password?
              </Link>
              <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
                Don&apos;t have an account? Register →
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || guestLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            onClick={handleGuest}
            disabled={loading || guestLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {guestLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting up demo...
              </>
            ) : (
              "⚡ Instant Access - Try as Guest"
            )}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            No sign-up needed - jump straight into a practice test.
          </p>

          <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-400">
            Demo login - User ID <span className="font-semibold text-slate-600">XGDEMOL3001</span>{" "}
            · Password <span className="font-semibold text-slate-600">demo1234</span>
          </p>
        </div>

        {/* Illustration */}
        <div className="relative hidden items-center justify-center bg-gradient-to-br from-indigo-400 to-violet-600 p-10 md:flex">
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <Star size={16} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Top Score!</p>
              <p className="text-[10px] text-slate-500">95th percentile</p>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
              <Target size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Daily Goal</p>
              <p className="text-[10px] text-slate-500">Keep it up!</p>
            </div>
          </div>

          <div className="text-[9rem] leading-none drop-shadow-xl">🧮</div>
        </div>
      </div>
    </div>
  );
}
