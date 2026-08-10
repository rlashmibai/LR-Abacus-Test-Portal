"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import AuthShell from "./AuthShell";

export default function ChangePasswordForm({
  prefillUserId = "",
  quote,
}: {
  prefillUserId?: string;
  quote: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(prefillUserId);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell quote={quote}>
      {done ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-good-soft">
            <CheckCircle2 className="text-good" size={28} />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Password Updated</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Your password has been changed successfully.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold text-ink">Change Password</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Enter your User ID and current password to set a new one.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="User ID">
              <input
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. XGDEMOL3001"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
              />
            </Field>

            <Field label="Current Password">
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
              />
            </Field>

            <Field label="New Password">
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
              />
            </Field>

            <Field label="Confirm New Password">
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
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
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-soft">
            <Link href="/login" className="font-medium text-brand hover:underline">
              Back to Sign In
            </Link>
          </p>
        </>
      )}
    </AuthShell>
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
