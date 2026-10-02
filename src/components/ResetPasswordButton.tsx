"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

export default function ResetPasswordButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setLoading(true);
    try {
      const res = await fetch(`/api/center/students/${studentId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setStatus("error");
        setLoading(false);
        return;
      }
      setStatus("success");
      setPassword("");
      setLoading(false);
    } catch {
      setStatus("error");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <KeyRound size={14} />
        Reset Password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <input
          required
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-36 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setStatus("idle");
          }}
          className="text-xs font-semibold text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {status === "success" && (
        <p className="text-xs font-medium text-good">Password updated.</p>
      )}
      {status === "error" && (
        <p className="text-xs font-medium text-bad">Couldn&apos;t update it - try again.</p>
      )}
    </form>
  );
}
