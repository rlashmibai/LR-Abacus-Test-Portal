export default function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
      <div className="rounded-xl bg-brand-soft p-2.5 text-brand">{icon}</div>
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-base font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
