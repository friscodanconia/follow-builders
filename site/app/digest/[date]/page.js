import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { DigestContent } from '../../../components/digest-content';
import { SignalCard } from '../../../components/signal-card';
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
  const structuredHighlights = structured?.selectedItems?.slice(0, 2) || [];

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[30px] p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Daily issue</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
              {formatIssueDate(date)}
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--color-ink-soft)]">
              Full narrative read for the day. The structured layer sits alongside it so you can skim the strongest signals before dropping into the complete brief.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AppLink href="/" className="nav-pill rounded-full px-3 py-2 text-sm">
                Back to home
              </AppLink>
              <AppLink href="/archive" className="nav-pill rounded-full px-3 py-2 text-sm">
                Browse archive
              </AppLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem]">
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Selected items</p>
              <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{structured?.stats?.selectedItems || 0}</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Topics</p>
              <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{relatedTopics.length}</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Source groups</p>
              <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{structured?.sections?.length || 0}</p>
            </div>
          </div>
        </div>
      </section>

      {(structuredHighlights.length > 0 || relatedTopics.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
          <div className="space-y-4">
            <div>
              <p className="eyebrow">Structured layer</p>
              <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
                Ranked context for this issue.
              </h2>
            </div>
            <div className="space-y-4">
              {structuredHighlights.map((item) => (
                <SignalCard key={item.id} item={item} compact />
              ))}
            </div>
          </div>

          <aside className="glass-panel rounded-[26px] p-5 sm:p-6">
            <p className="eyebrow">Dominant topics</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">What shaped the issue.</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedTopics.map((topic) => (
                <TopicBadge key={topic.slug} topic={topic} />
              ))}
            </div>
          </aside>
        </section>
      )}

      <article className="glass-panel rounded-[30px] p-5 sm:p-8 lg:p-10">
        <DigestContent blocks={digestBlocks} />
      </article>

      <nav className="grid gap-3 sm:grid-cols-2">
        {previous ? (
          <AppLink href={`/digest/${previous.date}`} className="signal-card block p-4 sm:p-5">
            <p className="eyebrow">Previous issue</p>
            <p className="mt-2 text-lg font-medium text-[var(--color-ink)]">{formatIssueDate(previous.date)}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{previous.date}</p>
          </AppLink>
        ) : (
          <div />
        )}

        {next ? (
          <AppLink href={`/digest/${next.date}`} className="signal-card block p-4 sm:p-5 text-left sm:text-right">
            <p className="eyebrow">Next issue</p>
            <p className="mt-2 text-lg font-medium text-[var(--color-ink)]">{formatIssueDate(next.date)}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{next.date}</p>
          </AppLink>
        ) : null}
      </nav>
    </div>
  );
}
