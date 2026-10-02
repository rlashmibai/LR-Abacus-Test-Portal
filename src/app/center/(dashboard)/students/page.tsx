import { requireCenterSessionOrRedirect } from "@/lib/auth";
import { getStudentsByCenterId } from "@/lib/store";
import AddStudentForm from "@/components/AddStudentForm";
import BulkUploadStudents from "@/components/BulkUploadStudents";
import ResetPasswordButton from "@/components/ResetPasswordButton";

export default async function CenterStudentsPage() {
  const center = await requireCenterSessionOrRedirect();
  const roster = await getStudentsByCenterId(center.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
        <p className="mt-1 text-ink-soft">
          {roster.length} student{roster.length === 1 ? "" : "s"} registered
          under {center.name}.
        </p>
      </div>

      <div className="space-y-3">
        <AddStudentForm />
        <BulkUploadStudents />
      </div>

      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-faint">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">User ID</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roster.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                  <td className="py-2.5 pr-4 text-ink-soft">{s.userId}</td>
                  <td className="py-2.5 text-right">
                    <ResetPasswordButton studentId={s.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roster.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-faint">
            No students yet - add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
