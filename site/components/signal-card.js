import { TopicBadge } from './topic-badge';

export function SignalCard({ item, compact = false }) {
  return (
    <article className={`card ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
        <span className="font-medium text-[var(--color-accent)]">{item.section}</span>
        {item.sourceName && (
          <>
            <span>from</span>
            <span>{item.sourceName}</span>
          </>
        )}
        {item.publishedAt && (
          <time className="ml-auto text-xs">
            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </time>
        )}
      </div>

      <h3 className={`${compact ? 'mt-2 text-base' : 'mt-3 text-lg'} font-semibold leading-snug text-[var(--color-ink)]`}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--color-accent)]">
          {item.title}
        </a>
      </h3>

      <p className={`${compact ? 'mt-2' : 'mt-3'} text-[15px] leading-7 text-[var(--color-ink-secondary)]`}>
        {item.summary}
      </p>

      {item.whyThisMatters && (
        <p className="mt-3 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-6 text-[var(--color-ink-secondary)]">
          <span className="font-semibold text-[var(--color-ink)]">Why it matters: </span>
          {item.whyThisMatters}
        </p>
      )}

      {item.topics?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.topics.map((topic) => (
            <TopicBadge key={`${item.id}-${topic.slug}`} topic={topic} compact />
          ))}
        </div>
      )}
    </article>
  );
}
