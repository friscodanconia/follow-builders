import { AppLink } from '../components/app-link';
import { DigestContent } from '../components/digest-content';
import { DigestStoryCard } from '../components/digest-story-card';
import { InlineSubscribe } from '../components/inline-subscribe';
import { getDigestIndex, getLatestDigest, parseDigestMarkdown, parseDigestStories, extractEditorialIntro, estimateReadingTime } from '../lib/digests';
import { formatIssueDate } from '../lib/presentation';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function Home() {
  const [latest, index] = await Promise.all([
    getLatestDigest(),
    getDigestIndex(),
  ]);

  if (!latest) {
    return (
      <section className="card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
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

  const stories = parseDigestStories(latest.content);
  const editorialIntro = extractEditorialIntro(latest.content);
  const readingTime = estimateReadingTime(latest.content);
  const recentArchive = index.slice(1, 5);

  const useCards = stories.length > 0;
  const digestBlocks = useCards ? null : parseDigestMarkdown(latest.content);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="label">{formatIssueDate(latest.date)}</p>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-[var(--color-ink)] sm:text-3xl">
          Follow builders, not influencers
        </h1>
        {useCards && (
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {stories.length} stories &middot; {readingTime} min read
          </p>
        )}
      </section>

      {/* Editorial intro */}
      {editorialIntro && (
        <p className="text-base leading-7 text-[var(--color-ink-secondary)]">
          {editorialIntro}
        </p>
      )}

      {/* Stories */}
      {useCards ? (
        <div className="space-y-4">
          {stories.map((story, i) => (
            <DigestStoryCard key={story.url || i} story={story} number={i + 1} />
          ))}
        </div>
      ) : (
        <article className="card p-5 sm:p-8">
          <DigestContent blocks={digestBlocks} />
        </article>
      )}

      {/* Inline subscribe */}
      <InlineSubscribe />

      {/* Recent issues */}
      {recentArchive.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
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
