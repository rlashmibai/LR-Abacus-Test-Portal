export default function TableSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="rounded-xl bg-brand-soft p-2 text-brand">{icon}</div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
