import { AppLink } from '../components/app-link';
import { DigestContent } from '../components/digest-content';
import { TopicBadge } from '../components/topic-badge';
import { getDigestIndex, getLatestDigest, parseDigestMarkdown } from '../lib/digests';
import { getTopicIndex } from '../lib/content-data';
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

  const digestBlocks = parseDigestMarkdown(latest.content);
  const recentArchive = index.slice(1, 5);

  return (
    <div className="space-y-10">
      {/* Today's digest */}
      <section>
        <p className="label">{formatIssueDate(latest.date)}</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-[var(--color-ink)] sm:text-4xl">
          Today in AI
        </h1>
      </section>

      <article className="card p-5 sm:p-8">
        <DigestContent blocks={digestBlocks} />
      </article>

      {/* Topics */}
      {topics.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Browse by topic
          </h2>
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
              Past issues
            </h2>
            <AppLink href="/archive" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
              View all
            </AppLink>
          </div>
          <div className="mt-4 space-y-3">
            {recentArchive.map((entry) => (
              <AppLink
                key={entry.date}
                href={`/digest/${entry.date}`}
                className="card block px-5 py-4"
              >
                <span className="text-base font-medium text-[var(--color-ink)]">
                  {formatIssueDate(entry.date)}
                </span>
              </AppLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
