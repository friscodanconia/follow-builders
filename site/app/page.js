import { AppLink } from '../components/app-link';
import { SignalCard } from '../components/signal-card';
import { TopicBadge } from '../components/topic-badge';
import { getDigestIndex, getLatestDigest } from '../lib/digests';
import { getStructuredItems, getTopicIndex } from '../lib/content-data';
import { formatIssueDate } from '../lib/presentation';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function Home() {
  const [latest, index, topics] = await Promise.all([
    getLatestDigest(),
    getDigestIndex(),
    getTopicIndex(),
  ]);

  if (!latest) {
    return (
      <section className="card p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
          First issue coming soon
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--color-ink-secondary)]">
          The daily digest pipeline is set up. As soon as the first issue publishes, it will appear here.
        </p>
        <AppLink
          href="/subscribe"
          className="mt-5 inline-block rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-warm)]"
        >
          Get notified when we launch
        </AppLink>
      </section>
    );
  }

  const latestStructured = await getStructuredItems(latest.date);
  const featuredItems = latestStructured?.selectedItems?.slice(0, 3) || [];
  const recentArchive = index.slice(1, 5);

  return (
    <div className="space-y-10">
      {/* Today's issue header */}
      <section>
        <p className="label">Latest — {formatIssueDate(latest.date)}</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-[var(--color-ink)] sm:text-4xl">
          Today in AI
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-ink-secondary)]">
          The most important things AI builders shipped today, explained simply.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <AppLink
            href={`/digest/${latest.date}`}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-warm)]"
          >
            Read full digest
          </AppLink>
          <AppLink
            href="/archive"
            className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink-secondary)] transition hover:border-[#d0c8bc] hover:text-[var(--color-ink)]"
          >
            Past issues
          </AppLink>
        </div>
      </section>

      {/* Top stories */}
      {featuredItems.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Top stories
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            The most significant developments today
          </p>
          <div className="mt-5 space-y-4">
            {featuredItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Topics
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Browse by what interests you
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.slice(0, 10).map((topic) => (
              <TopicBadge key={topic.slug} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {/* Recent issues */}
      {recentArchive.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
              Recent issues
            </h2>
            <AppLink href="/archive" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
              View all
            </AppLink>
          </div>
          <div className="mt-4 space-y-3">
            {[latest, ...recentArchive].slice(0, 4).map((entry) => (
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
      )}
    </div>
  );
}
