import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { SignalCard } from '../../../components/signal-card';
import { TopicBadge } from '../../../components/topic-badge';
import { getTopicItems } from '../../../lib/content-data';
import { formatPublishedDate, summarizeSections, uniqueSourceCount } from '../../../lib/presentation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug} — AI Builders Digest`,
    description: `Structured topic archive for ${slug}.`,
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
  const sectionSummary = summarizeSections(payload.items);
  const sourceCount = uniqueSourceCount(payload.items);
  const latestPublished = payload.items.find((item) => item.publishedAt)?.publishedAt;

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[30px] p-5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Topic archive</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
              {payload.label}
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--color-ink-soft)]">
              Structured items tagged with this theme across the current archive. This is where the taxonomy becomes visible as a product feature instead of staying hidden in JSON.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AppLink href="/" className="nav-pill rounded-full px-3 py-2 text-sm">
                Back to home
              </AppLink>
              <AppLink href="/archive" className="nav-pill rounded-full px-3 py-2 text-sm">
                Browse issues
              </AppLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem]">
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Tagged items</p>
              <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{payload.items.length}</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Sources</p>
              <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{sourceCount}</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Latest seen</p>
              <p className="mt-2 font-display text-xl text-[var(--color-ink)]">
                {latestPublished ? formatPublishedDate(latestPublished) : 'Undated'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <TopicBadge topic={{ slug: payload.slug, label: payload.label, count: payload.items.length }} />
          {sectionSummary.map((section) => (
            <span
              key={section.label}
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)]"
            >
              {section.label} · {section.count}
            </span>
          ))}
        </div>
      </section>

      {featuredItems.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
              The strongest recent items in this lane.
            </h2>
          </div>
          <div className="space-y-4">
            {featuredItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {archiveItems.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="eyebrow">More from this topic</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
              Remaining tagged items.
            </h2>
          </div>
          <div className="grid gap-4">
            {archiveItems.map((item) => (
              <article key={item.id} className="signal-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                  <span>{item.section}</span>
                  <span>·</span>
                  <span>{item.sourceName}</span>
                  {item.publishedAt ? (
                    <>
                      <span>·</span>
                      <time>{formatPublishedDate(item.publishedAt)}</time>
                    </>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-medium text-[var(--color-ink)]">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--color-accent)]">
                    {item.title}
                  </a>
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{item.summary}</p>
                <p className="mt-4 border-l border-[rgba(248,185,73,0.25)] pl-4 text-sm leading-6 text-[var(--color-ink)]">
                  <span className="font-medium text-[var(--color-accent)]">Why this matters:</span> {item.whyThisMatters}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
