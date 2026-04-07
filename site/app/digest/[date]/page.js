import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { DigestContent } from '../../../components/digest-content';
import { SignalCard } from '../../../components/signal-card';
import { getStructuredItems } from '../../../lib/content-data';
import { getDigest, getDigestIndex, parseDigestMarkdown, extractEditorialIntro, estimateReadingTime, enrichItemsWithDigest } from '../../../lib/digests';
import { formatIssueDate } from '../../../lib/presentation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const index = await getDigestIndex();
  return index.map((entry) => ({ date: entry.date }));
}

export async function generateMetadata({ params }) {
  const { date } = await params;
  return {
    title: `AI Builders Digest — ${date}`,
    description: `AI Builders Digest for ${date}`,
  };
}

export default async function DigestPage({ params }) {
  const { date } = await params;

  const [digest, index, structured] = await Promise.all([
    getDigest(date),
    getDigestIndex(),
    getStructuredItems(date),
  ]);

  if (!digest) {
    notFound();
  }

  const rawItems = structured?.selectedItems || [];
  const selectedItems = digest?.content ? enrichItemsWithDigest(rawItems, digest.content) : rawItems;
  const useCards = selectedItems.length > 0;
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
            {selectedItems.length} stories &middot; {readingTime} min read
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
          {selectedItems.map((item, i) => (
            <SignalCard key={item.id} item={item} storyNumber={i + 1} />
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
