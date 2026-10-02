import { requireCenterSessionOrRedirect } from "@/lib/auth";

// Minimal placeholder for Phase 1 verification - Phase 2/3 replace this
// with the real roster + dashboard pages and a proper layout/nav.
export default async function CenterPage() {
  const center = await requireCenterSessionOrRedirect();

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line">
      <h1 className="font-display text-xl font-semibold text-ink">
        Logged in as {center.name}
      </h1>
      <p className="text-sm text-ink-soft">
        Student roster management and the results dashboard are coming
        next.
      </p>
    </div>
  );
}
