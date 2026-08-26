import { requireSessionOrRedirect } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const student = await requireSessionOrRedirect();

  if (student.isGuest) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line">
        <h2 className="font-display text-xl font-semibold text-ink">
          No Profile to Edit
        </h2>
        <p className="text-sm text-ink-soft">
          Guest sessions aren&apos;t saved, so there&apos;s no profile to update.
          Register for a free account to save your name and details.
        </p>
      </div>
    );
  }

  return (
    <ProfileForm
      userId={student.userId}
      studentId={student.id}
      initialName={student.name}
    />
  );
}
