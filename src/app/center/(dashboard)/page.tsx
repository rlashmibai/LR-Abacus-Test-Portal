import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { requireCenterSessionOrRedirect } from "@/lib/auth";
import { getStudentsByCenterId } from "@/lib/store";

// The real results dashboard (Phase 3) replaces this with the same
// design as /admin, scoped to this center's own students.
export default async function CenterPage() {
  const center = await requireCenterSessionOrRedirect();
  const roster = await getStudentsByCenterId(center.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome, {center.name}
        </h1>
        <p className="mt-1 text-ink-soft">
          {roster.length} student{roster.length === 1 ? "" : "s"} registered.
          A full results dashboard is coming next.
        </p>
      </div>

      <Link
        href="/center/students"
        className="flex items-center justify-between rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line transition hover:ring-brand"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft p-2.5 text-brand">
            <Users size={18} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink">
              Manage Students
            </p>
            <p className="text-sm text-ink-soft">
              Add new student logins and reset passwords.
            </p>
          </div>
        </div>
        <ArrowRight size={18} className="text-ink-faint" />
      </Link>
    </div>
  );
}
