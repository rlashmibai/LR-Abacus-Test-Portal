import { Clock, ListChecks, Award, Calculator, Timer } from "lucide-react";
import { requireSessionOrRedirect } from "@/lib/auth";
import { isValidOperation, isValidVariant, DEFAULT_OPERATION, DEFAULT_VARIANT, operationLabel } from "@/lib/testTypes";
import { pickQuote, todaySeed } from "@/lib/quotes";
import ProceedButton from "@/components/ProceedButton";

const RULES = [
  "Update your browser to the latest version before starting.",
  "Total duration of the examination is 10 Minutes.",
  "Works best in Google Chrome or Mozilla Firefox.",
  "No webcam is needed for this examination.",
  "100 questions · 1 mark each · No negative marking.",
  "You can answer questions in any order.",
  "If you finish early, click the Submit button to end the test.",
];

export default async function InstructionsPage({
  searchParams,
}: {
  searchParams: Promise<{ operation?: string; variant?: string }>;
}) {
  await requireSessionOrRedirect();
  const params = await searchParams;
  const operation = isValidOperation(params.operation) ? params.operation : DEFAULT_OPERATION;
  const variant = isValidVariant(operation, params.variant) ? params.variant! : DEFAULT_VARIANT;
  const typeLabel = operationLabel(operation, variant);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Instructions
        </h2>
        <p className="mt-2 text-ink-soft">
          Read Before You Begin - take a moment to review the rules and get
          ready for your test!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard icon={<Calculator size={18} />} label="Test Type" value={typeLabel} />
        <InfoCard icon={<Timer size={18} />} label="Duration" value="10 Mins" />
        <InfoCard icon={<ListChecks size={18} />} label="Questions" value="100" />
        <InfoCard icon={<Award size={18} />} label="Total Marks" value="100" />
      </div>

      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft p-2 text-brand">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Test Rules</h3>
            <p className="text-sm text-ink-soft">Please read carefully</p>
          </div>
        </div>

        <div className="mb-5 flex items-start gap-3 rounded-xl bg-gold-soft p-4 text-sm text-ink">
          <span aria-hidden>⏱</span>
          <p>
            The countdown timer in the top-right corner shows remaining
            time. When it reaches zero, the exam ends automatically - no
            manual submit needed.
          </p>
        </div>

        <ol className="space-y-3">
          {RULES.map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span className="pt-0.5">{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center font-display text-base italic text-ink-soft">
        &ldquo;{pickQuote(todaySeed())}&rdquo;
      </p>

      <div className="flex justify-center pb-4">
        <ProceedButton operation={operation} variant={variant} />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 text-center shadow-sm ring-1 ring-line">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
