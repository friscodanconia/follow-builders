import { AppLink } from '../../components/app-link';
import { getDigestIndex } from '../../lib/digests';
import { formatIssueDate, formatMonthLabel } from '../../lib/presentation';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Archive — AI Builders Digest',
  description: 'Browse all past AI Builders Digest issues.',
};

export default async function ArchivePage() {
  const index = await getDigestIndex();

  const grouped = {};
  for (const entry of index) {
    const month = entry.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(entry);
  }

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[30px] p-5 sm:p-8">
        <p className="eyebrow">Archive</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
          Every issue, arranged for quick thumb-scrolling.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
          The archive now behaves like a briefing ledger instead of a plain list. Mobile comes first: big tap targets, short labels, and one clear action per card.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="stat-tile min-w-[11rem]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Issues stored</p>
            <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{index.length}</p>
          </div>
          <div className="stat-tile min-w-[11rem]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Latest issue</p>
            <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{index[0]?.date || '—'}</p>
          </div>
        </div>
      </section>

      {months.length === 0 ? (
        <section className="glass-panel rounded-[26px] p-6">
          <p className="text-sm text-[var(--color-ink-soft)]">No digests yet. Check back after the next scheduled run.</p>
        </section>
      ) : (
        months.map((month) => (
          <section key={month} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">{formatMonthLabel(month)}</h2>
              <span className="eyebrow">{grouped[month].length} issues</span>
            </div>

            <div className="grid gap-3">
              {grouped[month].map((entry, indexInMonth) => (
                <AppLink
                  key={entry.date}
                  href={`/digest/${entry.date}`}
                  className="signal-card block p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="eyebrow">{indexInMonth === 0 ? 'Newest in month' : 'Issue'}</p>
                      <h3 className="mt-2 text-lg font-medium text-[var(--color-ink)] sm:text-xl">
                        {formatIssueDate(entry.date)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                        Open the full markdown brief for this issue.
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                      {entry.date}
                    </span>
                  </div>
                </AppLink>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
