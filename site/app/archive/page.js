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
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          Archive
        </h1>
        <p className="mt-2 text-base text-[var(--color-ink-secondary)]">
          All past digests. {index.length} issues and counting.
        </p>
      </section>

      {months.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">No digests yet. Check back soon.</p>
      ) : (
        months.map((month) => (
          <section key={month} className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
              {formatMonthLabel(month)}
            </h2>

            <div className="space-y-2">
              {grouped[month].map((entry) => (
                <AppLink
                  key={entry.date}
                  href={`/digest/${entry.date}`}
                  className="card block px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-[var(--color-ink)]">
                      {formatIssueDate(entry.date)}
                    </span>
                    <span className="text-sm text-[var(--color-ink-muted)]">
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
