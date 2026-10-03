"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LEVELS, levelTitle } from "@/lib/levels";

/** A roster row's level picker - saves as soon as a level is chosen. */
export default function LevelSelect({
  studentId,
  level,
}: {
  studentId: string;
  level: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(level);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = Number(e.target.value);
    const previous = value;
    setValue(next);
    setSaving(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/center/students/${studentId}/level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setValue(previous);
      setFailed(true);
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        aria-label="Level"
        className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft disabled:opacity-60"
      >
        {LEVELS.map((l) => (
          <option key={l.level} value={l.level}>
            {levelTitle(l.level)}
          </option>
        ))}
      </select>
      {saving && <Loader2 size={14} className="animate-spin text-ink-faint" />}
      {failed && <span className="text-xs font-medium text-bad">Couldn&apos;t save</span>}
    </div>
  );
}
