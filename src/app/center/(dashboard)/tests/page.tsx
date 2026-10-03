import { requireCenterSessionOrRedirect } from "@/lib/auth";
import { getTestLinksByCenterId, getResults } from "@/lib/store";
import { LEVELS, describeSection } from "@/lib/levels";
import TestLinkManager from "@/components/TestLinkManager";

export default async function CenterTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const center = await requireCenterSessionOrRedirect();
  const { notice } = await searchParams;

  const [links, results] = await Promise.all([
    getTestLinksByCenterId(center.id),
    getResults(),
  ]);

  // How many tests students have submitted through each link.
  const attempts = new Map<string, number>();
  for (const r of results) {
    if (r.linkId) attempts.set(r.linkId, (attempts.get(r.linkId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Tests</h1>
        <p className="mt-1 text-ink-soft">
          Pick a level, create a link, and share it with your students.
        </p>
      </div>

      {notice === "student-link" && (
        <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-ink">
          That link is for students. To try it yourself, sign out and sign in with a student
          account.
        </p>
      )}

      <TestLinkManager
        links={links.map((l) => ({
          code: l.code,
          level: l.level,
          mode: l.mode,
          questionCount: l.questionCount,
          attempts: attempts.get(l.code) ?? 0,
        }))}
      />

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">The six levels</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Each level adds one new skill. Only you see these - students just get a test.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((l) => (
            <div key={l.level} className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                  {l.level}
                </span>
                <h3 className="font-display text-base font-semibold text-ink">{l.name}</h3>
              </div>
              <p className="mt-2.5 text-sm text-ink-soft">{l.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-ink-soft">
                {l.sections.map((s, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{describeSection(s)}</span>
                    <span className="shrink-0 font-semibold text-ink">{s.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
