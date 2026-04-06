import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { DigestContent } from '../../../components/digest-content';
import { TopicBadge } from '../../../components/topic-badge';
import { getStructuredItems } from '../../../lib/content-data';
import { getDigest, getDigestIndex, parseDigestMarkdown } from '../../../lib/digests';
import { formatIssueDate, summarizeTopics } from '../../../lib/presentation';

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

  const digestBlocks = parseDigestMarkdown(digest.content);
  const currentIdx = index.findIndex((entry) => entry.date === date);
  const previous = currentIdx < index.length - 1 ? index[currentIdx + 1] : null;
  const next = currentIdx > 0 ? index[currentIdx - 1] : null;
  const relatedTopics = summarizeTopics(structured?.selectedItems || structured?.items || [], 6);

  return (
    <div className="space-y-8">
      <section>
        <AppLink href="/" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; Back to today
        </AppLink>
        <h1 className="mt-4 font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {formatIssueDate(date)}
        </h1>
      </section>

      {relatedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {relatedTopics.map((topic) => (
            <TopicBadge key={topic.slug} topic={topic} />
          ))}
        </div>
      )}

      <article className="card p-5 sm:p-8">
        <DigestContent blocks={digestBlocks} />
      </article>

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
