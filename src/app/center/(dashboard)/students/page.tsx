import { requireCenterSessionOrRedirect } from "@/lib/auth";
import { getStudentsByCenterId } from "@/lib/store";
import { levelFromStored } from "@/lib/levels";
import { stackedMd } from "@/components/dashboard/stackedTable";
import AddStudentForm from "@/components/AddStudentForm";
import BulkUploadStudents from "@/components/BulkUploadStudents";
import ResetPasswordButton from "@/components/ResetPasswordButton";
import LevelSelect from "@/components/LevelSelect";
import StudentLinkButton from "@/components/StudentLinkButton";
import CredentialsDownload from "@/components/CredentialsDownload";

export default async function CenterStudentsPage() {
  const center = await requireCenterSessionOrRedirect();
  const roster = await getStudentsByCenterId(center.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
        <p className="mt-1 text-ink-soft">
          {roster.length} student{roster.length === 1 ? "" : "s"} registered
          under {center.name}. Levels are for you only - students never see them.
        </p>
      </div>

      <CredentialsDownload studentCount={roster.length} />

      <div className="space-y-3">
        <AddStudentForm />
        <BulkUploadStudents />
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line sm:p-6">
        <div className="overflow-x-auto">
          <table className={`w-full min-w-[560px] text-left text-sm ${stackedMd.table}`}>
            <thead className={stackedMd.head}>
              <tr className="text-xs uppercase tracking-wide text-ink-faint">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">User ID</th>
                <th className="pb-2 pr-4">Level</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className={`divide-y divide-line ${stackedMd.body}`}>
              {roster.map((s) => {
                const level = levelFromStored(s.level);
                return (
                  <tr key={s.id} className={stackedMd.row}>
                    <td
                      data-label="Name"
                      className={`py-2.5 pr-4 font-medium text-ink ${stackedMd.cell}`}
                    >
                      {s.name}
                    </td>
                    <td
                      data-label="User ID"
                      className={`py-2.5 pr-4 text-ink-soft ${stackedMd.cell}`}
                    >
                      {s.userId}
                    </td>
                    <td data-label="Level" className={`py-2.5 pr-4 ${stackedMd.cell}`}>
                      <LevelSelect studentId={s.id} level={level} />
                    </td>
                    <td
                      className={`py-2.5 text-right ${stackedMd.cell} max-md:justify-end max-md:before:hidden`}
                    >
                      <div className="flex flex-wrap items-start justify-end gap-x-5 gap-y-3">
                        <StudentLinkButton key={level} level={level} />
                        <ResetPasswordButton studentId={s.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
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
