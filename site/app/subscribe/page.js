import { AppLink } from '../../components/app-link';
import { siteConfig } from '../../lib/site-config';

export const metadata = {
  title: 'Subscribe — AI Builders Digest',
  description: 'Get the AI Builders Digest in your inbox every morning.',
};

export default function SubscribePage() {
  const hasSubscriptionForm = Boolean(siteConfig.subscribeUrl);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Get the digest in your inbox
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--color-ink-secondary)]">
          3-5 curated AI stories. 3 minutes to read. Every weekday morning.
          No hype, no fluff, no engagement bait.
        </p>
      </section>

      <section className="card p-6">
        {hasSubscriptionForm ? (
          <form action={siteConfig.subscribeUrl} method="post" target="popupwindow" className="space-y-4">
            <div>
              <label htmlFor="bd-email" className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="bd-email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-bg)]"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-warm)]"
            >
              Subscribe for free
            </button>
            <p className="text-center text-xs text-[var(--color-ink-muted)]">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <div className="card-flat p-4">
            <p className="text-sm leading-6 text-[var(--color-ink-secondary)]">
              Email subscription is not configured yet. Check back soon.
            </p>
          </div>
        )}
      </section>

      <section className="card-flat p-6">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">What you get</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-ink-secondary)]">
          <li className="flex gap-2">
            <span className="shrink-0 text-[var(--color-accent)]">&#10003;</span>
            The 3-5 most important AI developments, explained in plain English
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-[var(--color-accent)]">&#10003;</span>
            "Why it matters" context you can use in conversations at work
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-[var(--color-accent)]">&#10003;</span>
            Sources from 14 curated blogs, research labs, and builder communities
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-[var(--color-accent)]">&#10003;</span>
            Chinese AI lab coverage (DeepSeek, Qwen, MiniMax) most Western digests skip
          </li>
        </ul>
      </section>

      <div className="flex justify-center gap-4 text-sm text-[var(--color-ink-muted)]">
        <AppLink href="/" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; See today&apos;s digest
        </AppLink>
        <AppLink href="/about" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          How we curate
        </AppLink>
      </div>
    </div>
  );
}
