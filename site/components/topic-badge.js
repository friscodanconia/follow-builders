import { AppLink } from './app-link';

export function TopicBadge({ topic, className = '', compact = false }) {
  const size = compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <AppLink
      href={`/topic/${topic.slug}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--color-tag-bg)] ${size} font-medium text-[var(--color-tag-text)] transition hover:bg-[#e6dfd5] hover:text-[var(--color-ink)] ${className}`.trim()}
    >
      <span>{topic.label}</span>
      {typeof topic.count === 'number' && (
        <span className="text-[var(--color-ink-muted)]">{topic.count}</span>
      )}
    </AppLink>
  );
}
