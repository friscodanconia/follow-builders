import Link from 'next/link';
import { DigestContent } from '../components/digest-content';
import { getLatestDigest, getDigestIndex, parseDigestMarkdown } from '../lib/digests';
import { getLatestStructuredItems, getTopicIndex } from '../lib/content-data';
import { siteConfig } from '../lib/site-config';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function Home() {
  const latest = await getLatestDigest();
  const index = await getDigestIndex();
  const latestStructured = await getLatestStructuredItems();
  const topics = await getTopicIndex();

  if (!latest) {
    return (
      <div className="text-center py-16">
        <h1 className="text-lg font-medium mb-4 text-slate-100">{siteConfig.projectName}</h1>
        <p className="text-sm text-slate-300 mb-6">
          Daily digest tracking what top AI builders are thinking and shipping.
        </p>
        <p className="text-sm text-slate-400">
          First digest coming soon. <Link href="/subscribe" className="text-amber-300 underline">Follow updates</Link> from this fork.
        </p>
      </div>
    );
  }

  const digestBlocks = parseDigestMarkdown(latest.content);
  const recentArchive = index.slice(1, 6);

  return (
    <div>
      <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="mb-6 flex items-center gap-2">
          <time className="text-sm text-slate-400">{latest.date}</time>
          <span className="text-sm text-slate-600">·</span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs uppercase tracking-[0.2em] text-amber-300">Latest</span>
        </div>
        <DigestContent blocks={digestBlocks} />
      </article>

      <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="mb-2 text-sm font-medium text-slate-100">Follow this fork</h2>
        <p className="mb-4 text-sm text-slate-400">
          This fork mirrors feed data from the upstream project and publishes its own archive and digest workflow.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/subscribe"
            className="inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
          >
            {siteConfig.subscribeCtaLabel}
          </Link>
          <a
            href={siteConfig.repoUrl}
            className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source
          </a>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-medium text-slate-400">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 8).map((topic) => (
              <Link
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-amber-400/40 hover:text-white"
              >
                {topic.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {latestStructured?.selectedItems?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-medium text-slate-400">Today&apos;s structured picks</h2>
          <div className="space-y-3">
            {latestStructured.selectedItems.slice(0, 3).map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{item.section}</span>
                  <span>·</span>
                  <span>{item.sourceName}</span>
                </div>
                <h3 className="text-sm font-medium text-white">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300">
                    {item.title}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-slate-400">{item.whyThisMatters}</p>
                {item.topics?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <Link
                        key={`${item.id}-${topic.slug}`}
                        href={`/topic/${topic.slug}`}
                        className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                      >
                        {topic.label}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {recentArchive.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-medium text-slate-400">Previous digests</h2>
          <ul className="space-y-2">
            {recentArchive.map((entry) => (
              <li key={entry.date}>
                <Link
                  href={`/digest/${entry.date}`}
                  className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition hover:border-slate-800 hover:bg-slate-900/60"
                >
                  <span className="text-sm text-slate-300">{entry.title}</span>
                  <time className="ml-4 shrink-0 text-xs text-slate-500">{entry.date}</time>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/archive" className="mt-3 inline-block text-sm text-amber-300 hover:underline">
            View all &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
