import { siteConfig } from '../lib/site-config';

export function InlineSubscribe() {
  if (!siteConfig.subscribeUrl) return null;

  return (
    <section className="card-flat p-6 sm:p-8">
      <h3 className="font-display text-xl font-bold text-[var(--color-ink)]">
        Get this in your inbox
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-secondary)]">
        5 stories. 3 minutes. Every weekday morning.
      </p>
      <form
        action={siteConfig.subscribeUrl}
        method="post"
        target="popupwindow"
        className="mt-4 flex gap-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-bg)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-warm)]"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
