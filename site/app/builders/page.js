import { AppLink } from '../../components/app-link';
import { getBuilderIndex } from '../../lib/content-data';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Builders — AI Builders Digest',
  description: 'AI builders we track: engineers, founders, and researchers shipping real products.',
};

export default async function BuildersPage() {
  const builders = await getBuilderIndex();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Builders
        </h1>
        {(() => {
          const active = builders.filter((b) => b.itemCount > 0);
          const tracked = builders.length;
          return (
            <p className="mt-2 text-base text-[var(--color-ink-secondary)]">
              {active.length} active builders{tracked > active.length ? ` of ${tracked} tracked` : ''}. Profiles grow as they post.
            </p>
          );
        })()}
      </section>

      {builders.filter((b) => b.itemCount > 0).length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Builder profiles are being accumulated. Check back after the next daily digest run.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {builders.filter((b) => b.itemCount > 0).map((builder) => (
            <AppLink
              key={builder.handle}
              href={`/builder/${builder.handle}`}
              className="card block px-5 py-4 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-semibold text-[var(--color-ink)]">
                    {builder.name}
                  </span>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">
                    @{builder.handle}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--color-tag-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-tag-text)]">
                  {builder.itemCount} posts
                </span>
              </div>
            </AppLink>
          ))}
        </div>
      )}
    </div>
  );
}
