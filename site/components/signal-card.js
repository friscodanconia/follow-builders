import { TopicBadge } from './topic-badge';

export function SignalCard({ item, compact = false }) {
  const containerClass = compact
    ? 'signal-card p-4'
    : 'signal-card p-5 sm:p-6';

  return (
    <article className={containerClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{item.section}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            {item.sourceName}
          </p>
        </div>
        {item.publishedAt ? (
          <time className="rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </time>
        ) : null}
      </div>

      <h3 className={`${compact ? 'mt-3 text-base' : 'mt-4 text-lg'} text-balance font-medium leading-tight text-[var(--color-ink)]`}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--color-accent)]">
          {item.title}
        </a>
      </h3>

      <p className={`${compact ? 'mt-3 text-sm' : 'mt-4 text-[15px]'} text-[var(--color-ink-soft)]`}>
        {item.summary}
      </p>

      <p className="mt-4 border-l border-[rgba(248,185,73,0.25)] pl-4 text-sm leading-6 text-[var(--color-ink)]">
        <span className="font-medium text-[var(--color-accent)]">Why this matters:</span> {item.whyThisMatters}
      </p>

      {item.topics?.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.topics.map((topic) => (
            <TopicBadge key={`${item.id}-${topic.slug}`} topic={topic} compact />
          ))}
        </div>
      ) : null}
    </article>
  );
}
