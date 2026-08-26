"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ProfileForm({
  userId,
  studentId,
  initialName,
}: {
  userId: string;
  studentId: string;
  initialName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSaved(true);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Edit Profile</h2>
        <p className="mt-1 text-ink-soft">Update how your name appears across the portal.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8"
      >
        <Field label="User ID">
          <input
            disabled
            value={userId}
            className="w-full cursor-not-allowed rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink-faint"
          />
        </Field>

        <Field label="Student ID">
          <input
            disabled
            value={studentId}
            className="w-full cursor-not-allowed rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink-faint"
          />
        </Field>

        <Field label="Full Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-good-soft px-3 py-2 text-sm font-medium text-good">
            <CheckCircle2 size={15} />
            Profile updated.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
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
