import Link from "next/link";

export default function Pagination({
  basePath,
  paramName,
  currentPage,
  totalPages,
  preserve,
}: {
  basePath: string;
  paramName: string;
  currentPage: number;
  totalPages: number;
  preserve?: Record<string, string | undefined>;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(preserve ?? {})) {
      if (value) params.set(key, value);
    }
    params.set(paramName, String(n));
    return `${basePath}?${params.toString()}`;
  };
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
            n === currentPage
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-paper"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
