"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function ProceedButton({
  operation,
  variant,
  mode,
  questionCount,
}: {
  operation: string;
  variant: string;
  mode: string;
  questionCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, variant, mode, questionCount }),
      });
      if (!res.ok) throw new Error("Could not start the test");
      const session = await res.json();
      router.push(`/test/${session.id}`);
    } catch {
      setError("Something went wrong starting the test. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Preparing your test...
          </>
        ) : (
          <>
            Proceed to Test
            <ArrowRight size={16} />
          </>
        )}
      </button>
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
}
