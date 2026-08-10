import { requireSessionOrRedirect } from "@/lib/auth";
import TestSetupForm from "@/components/TestSetupForm";
import AbacusIllustration from "@/components/AbacusIllustration";

export default async function TestSetupPage() {
  await requireSessionOrRedirect();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <AbacusIllustration className="mx-auto mb-4 h-28 w-28" />
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Choose Your Test
        </h2>
        <p className="mt-2 text-ink-soft">
          Pick an operation and a digit size, then create your test.
        </p>
      </div>

      <TestSetupForm />
    </div>
  );
}
