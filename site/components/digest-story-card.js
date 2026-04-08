export function DigestStoryCard({ story, number }) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
          {String(number).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-[var(--color-ink)]">
            {story.title}
          </h3>

          <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink-secondary)]">
            {story.body.join(' ')}
          </p>

          {story.whyItMatters && (
            <p className="mt-3 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-6 text-[var(--color-ink-secondary)]">
              <span className="font-semibold text-[var(--color-ink)]">Why it matters: </span>
              {story.whyItMatters}
            </p>
          )}

          {story.url && (
            <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[var(--color-accent)]"
              >
                Source &rarr;
              </a>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
