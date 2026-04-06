import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { SignalCard } from '../../../components/signal-card';
import { TopicBadge } from '../../../components/topic-badge';
import { getTopicItems } from '../../../lib/content-data';
import { formatPublishedDate } from '../../../lib/presentation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug} — AI Builders Digest`,
    description: `All items tagged with ${slug}.`,
  };
}

export default async function TopicPage({ params }) {
  const { slug } = await params;
  const payload = await getTopicItems(slug);

  if (!payload) {
    notFound();
  }

  const featuredItems = payload.items.slice(0, 3);
  const archiveItems = payload.items.slice(3);

  return (
    <div className="space-y-8">
      <section>
        <AppLink href="/" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; Back to home
        </AppLink>
        <h1 className="mt-4 font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
          {payload.label}
        </h1>
        <p className="mt-2 text-base text-[var(--color-ink-secondary)]">
          {payload.items.length} items tagged with this topic
        </p>
        <div className="mt-3">
          <TopicBadge topic={{ slug: payload.slug, label: payload.label, count: payload.items.length }} />
        </div>
      </section>

      {featuredItems.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
            Recent
          </h2>
          <div className="mt-4 space-y-4">
            {featuredItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {archiveItems.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
            Older
          </h2>
          <div className="mt-4 space-y-3">
            {archiveItems.map((item) => (
              <article key={item.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <span className="font-medium text-[var(--color-accent)]">{item.section}</span>
                  <span>from {item.sourceName}</span>
                  {item.publishedAt && (
                    <time className="ml-auto text-xs">{formatPublishedDate(item.publishedAt)}</time>
                  )}
                </div>
                <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--color-accent)]">
                    {item.title}
                  </a>
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-secondary)]">{item.summary}</p>
                {item.whyThisMatters && (
                  <p className="mt-2 border-l-2 border-[var(--color-accent)] pl-3 text-sm leading-6 text-[var(--color-ink-secondary)]">
                    <span className="font-semibold text-[var(--color-ink)]">Why it matters: </span>
                    {item.whyThisMatters}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
