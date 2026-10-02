"use client";

import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

export default function StudentFilter({
  students,
  selectedId,
}: {
  students: { id: string; name: string; userId: string }[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <label className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-line">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Filter size={16} className="text-brand" />
        Show results for
      </span>
      <select
        value={selectedId}
        onChange={(e) =>
          router.push(e.target.value ? `/center?student=${encodeURIComponent(e.target.value)}` : "/center")
        }
        className="min-w-[14rem] rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
      >
        <option value="">All students</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.userId})
          </option>
        ))}
      </select>
    </label>
  );
}
