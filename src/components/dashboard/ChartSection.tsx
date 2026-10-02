import TrendChart from "@/components/TrendChart";
import EmptyNote from "./EmptyNote";

export default function ChartSection({
  title,
  description,
  data,
  color,
  valueFormat,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  color: string;
  valueFormat: (v: number) => string;
}) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line md:p-8">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
      {data.length > 0 ? (
        <TrendChart data={data} color={color} valueFormat={valueFormat} />
      ) : (
        <EmptyNote text="No data yet." />
      )}
    </section>
  );
}
