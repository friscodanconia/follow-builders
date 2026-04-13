import { notFound } from 'next/navigation';
import { AppLink } from '../../../components/app-link';
import { SignalCard } from '../../../components/signal-card';
import { getBuilderIndex, getBuilderItems } from '../../../lib/content-data';
import { siteConfig } from '../../../lib/site-config';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const builders = await getBuilderIndex();
  return builders.map((b) => ({ handle: b.handle }));
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const data = await getBuilderItems(handle);
  const name = data?.name || handle;
  const count = data?.itemCount || 0;
  return {
    title: `${name} — AI Builders Digest`,
    description: `${count} tracked posts from ${name} (@${handle}). What they're building and shipping in AI.`,
    openGraph: {
      title: `${name} — AI Builders Digest`,
      description: `Follow what ${name} is building in AI. ${count} posts tracked.`,
    },
  };
}

export default async function BuilderPage({ params }) {
  const { handle } = await params;
  const data = await getBuilderItems(handle);

  if (!data) {
    notFound();
  }

  const featured = data.items.slice(0, 5);
  const older = data.items.slice(5);

  const topicLabels = [];
  const seenTopics = new Set();
  for (const item of data.items) {
    for (const topic of item.topics || []) {
      if (!seenTopics.has(topic.slug)) {
        seenTopics.add(topic.slug);
        topicLabels.push(topic.label);
      }
    }
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    alternateName: `@${data.handle}`,
    url: `https://x.com/${data.handle}`,
    knowsAbout: topicLabels,
    sameAs: [
      `https://x.com/${data.handle}`,
      `${siteConfig.siteUrl}/builder/${data.handle}`,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <div className="space-y-8">
        <section>
          <AppLink href="/builders" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
            &larr; All builders
          </AppLink>

          <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {data.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            @{data.handle} &middot; {data.itemCount} posts tracked
          </p>
        </section>

        {featured.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Recent</h2>
            {featured.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </section>
        )}

        {older.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Older</h2>
            {older.map((item) => (
              <SignalCard key={item.id} item={item} compact />
            ))}
          </section>
        )}
      </div>
    </>
  );
}
