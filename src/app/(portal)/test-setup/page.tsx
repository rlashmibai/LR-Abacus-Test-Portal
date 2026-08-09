import { requireSessionOrRedirect } from "@/lib/auth";
import TestSetupForm from "@/components/TestSetupForm";

export default async function TestSetupPage() {
  await requireSessionOrRedirect();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
          Choose Your Test
        </h2>
        <p className="mt-2 text-slate-500">
          Pick an operation and a digit size, then create your test.
        </p>
      </div>

      <TestSetupForm />
    </div>
  );
}
