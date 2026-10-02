export default function BreakdownCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <dl className="mt-2 divide-y divide-line">{children}</dl>
    </div>
  );
}
