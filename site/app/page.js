import { AppLink } from '../components/app-link';
import { SignalCard } from '../components/signal-card';
import { TopicBadge } from '../components/topic-badge';
import { getDigestIndex, getLatestDigest } from '../lib/digests';
import { getStructuredItems, getTopicIndex } from '../lib/content-data';
import { formatIssueDate, summarizeSections, uniqueSourceCount } from '../lib/presentation';
import { siteConfig } from '../lib/site-config';

export const dynamic = 'force-static';
export const revalidate = 3600;

function coverageMetrics(items = [], chinaTopicCount = 0) {
  const mirroredBuilderItems = items.filter((item) => item.sourceType === 'x').length;
  const officialItems = items.filter((item) => item.sourceGroup === 'official').length;
  const editorialItems = items.filter((item) => item.sourceGroup === 'editorial').length;

  return [
    {
      label: 'Builders',
      value: mirroredBuilderItems,
      note: 'Mirrored X signal from the upstream builder set.',
    },
    {
      label: 'Official labs',
      value: officialItems,
      note: 'Primary-source releases from labs and product teams.',
    },
    {
      label: 'Editorial',
      value: editorialItems,
      note: 'High-signal newsletters and technical commentary.',
    },
    {
      label: 'China watch',
      value: chinaTopicCount,
      note: 'Dedicated tracking for Chinese model labs and launches.',
    },
  ];
}

export default async function Home() {
  const [latest, index, topics] = await Promise.all([
    getLatestDigest(),
    getDigestIndex(),
    getTopicIndex(),
  ]);

  if (!latest) {
    return (
      <section className="glass-panel rounded-[28px] p-6 sm:p-8">
        <p className="eyebrow">Booting up</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
          The first operator brief is not published yet.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-ink-soft)]">
          This fork already has the structured pipeline in place. As soon as the first run lands, this page will surface ranked picks, topic radar, and the long-form daily issue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AppLink
            href="/subscribe"
            className="rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[#1a1308] transition hover:bg-[#ffd48d]"
          >
            {siteConfig.subscribeCtaLabel}
          </AppLink>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-pill rounded-full px-4 py-2.5 text-sm"
          >
            View source
          </a>
        </div>
      </section>
    );
  }

  const latestStructured = await getStructuredItems(latest.date);
  const featuredItems = latestStructured?.selectedItems?.slice(0, 3) || [];
  const recentArchive = index.slice(1, 5);
  const sectionSummary = summarizeSections(latestStructured?.selectedItems || []);
  const totalSources = uniqueSourceCount(latestStructured?.items || []);
  const chinaTopic = topics.find((topic) => topic.slug === 'china-models');
  const metrics = coverageMetrics(latestStructured?.items || [], chinaTopic?.count || 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="glass-panel rounded-[30px] p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-7">
          <div className="max-w-3xl">
            <p className="eyebrow">Latest issue · {latest.date}</p>
            <h1 className="mt-3 font-display text-4xl leading-[0.92] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
              A tighter daily read on what AI builders, labs, and model teams actually shipped.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)] sm:text-base">
              Mobile first by default: ranked signal up top, full markdown brief below, and a dedicated watch for Chinese models that western summaries often flatten or miss.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Issue date</p>
              <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">{latest.date}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{formatIssueDate(latest.date)}</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Ranked picks</p>
              <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">{latestStructured?.stats?.selectedItems || 0}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Curated down from {latestStructured?.stats?.totalItems || 0} candidate items.</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Source count</p>
              <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">{totalSources}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Distinct sources represented in today&apos;s structured dataset.</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Top topic</p>
              <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">{topics[0]?.label || 'Signal'}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {topics[0] ? `${topics[0].count} tagged items in the current archive.` : 'Topic archive updates with each run.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AppLink
              href={`/digest/${latest.date}`}
              className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[#1a1308] transition hover:bg-[#ffd48d]"
            >
              Read today&apos;s full brief
            </AppLink>
            <AppLink href="/archive" className="nav-pill rounded-full px-4 py-3 text-sm">
              Browse archive
            </AppLink>
            <AppLink href="/subscribe" className="nav-pill rounded-full px-4 py-3 text-sm">
              Get the daily email
            </AppLink>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Signal board</p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
                What deserves attention first.
              </h2>
            </div>
            <AppLink href={`/digest/${latest.date}`} className="hidden text-sm text-[var(--color-accent)] hover:text-[#ffd48d] sm:inline">
              Open full issue
            </AppLink>
          </div>

          <div className="space-y-4">
            {featuredItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <aside className="glass-panel rounded-[26px] p-5 sm:p-6">
            <p className="eyebrow">Topic radar</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">Tagging is live in the product.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              Every structured item is tagged at build time. The homepage surfaces the strongest active themes, and the dedicated topic archives are linked from here.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {topics.slice(0, 8).map((topic) => (
                <TopicBadge key={topic.slug} topic={topic} />
              ))}
            </div>
          </aside>

          <aside className="glass-panel rounded-[26px] p-5 sm:p-6">
            <p className="eyebrow">Coverage map</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="rail-card px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{metric.label}</p>
                    <span className="rounded-full bg-[rgba(248,185,73,0.12)] px-2 py-1 text-xs text-[var(--color-accent)]">
                      {metric.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{metric.note}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="glass-panel rounded-[26px] p-5 sm:p-6">
          <p className="eyebrow">Full issue</p>
          <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
            The long-form brief is still here when you want the full narrative.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--color-ink-soft)]">
            The homepage now surfaces the ranked signal first. The full digest remains the complete chronological read with context and links across the day.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {sectionSummary.map((section) => (
              <span
                key={section.label}
                className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)]"
              >
                {section.label} · {section.count}
              </span>
            ))}
          </div>
          <AppLink
            href={`/digest/${latest.date}`}
            className="mt-6 inline-flex rounded-full border border-[rgba(248,185,73,0.28)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[rgba(248,185,73,0.5)] hover:bg-[rgba(248,185,73,0.24)]"
          >
            Open the full markdown issue
          </AppLink>
        </div>

        <div className="glass-panel rounded-[26px] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recent issues</p>
              <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
                Archive, now easier to scan on mobile.
              </h2>
            </div>
            <AppLink href="/archive" className="hidden text-sm text-[var(--color-accent)] hover:text-[#ffd48d] sm:inline">
              View archive
            </AppLink>
          </div>

          <div className="mt-5 space-y-3">
            {[latest, ...recentArchive].slice(0, 4).map((entry, indexNumber) => (
              <AppLink
                key={entry.date}
                href={`/digest/${entry.date}`}
                className="signal-card block p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">{indexNumber === 0 ? 'Current' : 'Archive'}</p>
                    <p className="mt-1 text-lg font-medium text-[var(--color-ink)]">{formatIssueDate(entry.date)}</p>
                  </div>
                  <span className="text-sm text-[var(--color-ink-muted)]">{entry.date}</span>
                </div>
              </AppLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
