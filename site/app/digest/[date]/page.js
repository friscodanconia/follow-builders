import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { DigestContent } from '../../../components/digest-content';
import { DigestStoryCard } from '../../../components/digest-story-card';
import { getDigest, getDigestIndex, parseDigestMarkdown, parseDigestStories, extractEditorialIntro, estimateReadingTime } from '../../../lib/digests';
import { formatIssueDate } from '../../../lib/presentation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const index = await getDigestIndex();
  return index.map((entry) => ({ date: entry.date }));
}

export async function generateMetadata({ params }) {
  const { date } = await params;
  const digest = await getDigest(date);
  const intro = digest ? extractEditorialIntro(digest.content) : '';
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return {
    title: `${formattedDate} — AI Builders Digest`,
    description: intro || `AI Builders Digest for ${formattedDate}`,
    openGraph: {
      title: `AI Builders Digest — ${formattedDate}`,
      description: intro || `Daily AI digest for ${formattedDate}`,
    },
  };
}

export default async function DigestPage({ params }) {
  const { date } = await params;

  const [digest, index] = await Promise.all([
    getDigest(date),
    getDigestIndex(),
  ]);

  if (!digest) {
    notFound();
  }

  const stories = parseDigestStories(digest.content);
  const useCards = stories.length > 0;
  const digestBlocks = useCards ? null : parseDigestMarkdown(digest.content);
  const editorialIntro = extractEditorialIntro(digest.content);
  const readingTime = estimateReadingTime(digest.content);

  const currentIdx = index.findIndex((entry) => entry.date === date);
  const previous = currentIdx < index.length - 1 ? index[currentIdx + 1] : null;
  const next = currentIdx > 0 ? index[currentIdx - 1] : null;

  return (
    <div className="space-y-8">
      <section>
        <AppLink href="/" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; Back to today
        </AppLink>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          {formatIssueDate(date)}
        </h1>
        {useCards && (
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {stories.length} stories &middot; {readingTime} min read
          </p>
        )}
      </section>

      {editorialIntro && (
        <p className="text-lg leading-8 text-[var(--color-ink-secondary)]">
          {editorialIntro}
        </p>
      )}

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

      <nav className="grid gap-3 sm:grid-cols-2">
        {previous ? (
          <AppLink href={`/digest/${previous.date}`} className="card block px-5 py-4">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Previous</p>
            <p className="mt-1 text-base font-medium text-[var(--color-ink)]">{formatIssueDate(previous.date)}</p>
          </AppLink>
        ) : (
          <div />
        )}
        {next ? (
          <AppLink href={`/digest/${next.date}`} className="card block px-5 py-4 text-left sm:text-right">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Next</p>
            <p className="mt-1 text-base font-medium text-[var(--color-ink)]">{formatIssueDate(next.date)}</p>
          </AppLink>
        ) : null}
      </nav>
    </div>
  );
}
