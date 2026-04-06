import { AppLink } from './app-link';

export function TopicBadge({ topic, className = '', compact = false }) {
  const padding = compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <AppLink
      href={`/topic/${topic.slug}`}
      className={`inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] ${padding} font-medium text-[var(--color-ink-soft)] transition hover:border-[rgba(248,185,73,0.35)] hover:text-[var(--color-ink)] ${className}`.trim()}
    >
      <span>{topic.label}</span>
      {typeof topic.count === 'number' ? (
        <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink-muted)]">
          {topic.count}
        </span>
      ) : null}
    </AppLink>
  );
}
