import { AppLink } from '../../components/app-link';
import { getDigest, getDigestIndex, extractEditorialIntro } from '../../lib/digests';
import { formatIssueDate, formatMonthLabel } from '../../lib/presentation';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Archive — AI Builders Digest',
  description: 'Browse all past AI Builders Digest issues.',
};

export default async function ArchivePage() {
  const index = await getDigestIndex();

  // Load previews for each digest
  const previews = new Map();
  for (const entry of index) {
    const digest = await getDigest(entry.date);
    if (digest) {
      previews.set(entry.date, extractEditorialIntro(digest.content));
    }
  }

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
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
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
                  <span className="text-base font-medium text-[var(--color-ink)]">
                    {formatIssueDate(entry.date)}
                  </span>
                  {previews.get(entry.date) && (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-ink-secondary)]">
                      {previews.get(entry.date)}
                    </p>
                  )}
                </AppLink>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
