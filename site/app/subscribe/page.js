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
          A short daily email with the most important AI developments, explained in plain language. No spam, no hype.
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
              Subscribe
            </button>
          </form>
        ) : (
          <div className="card-flat p-4">
            <p className="text-sm leading-6 text-[var(--color-ink-secondary)]">
              Email subscription is not configured yet. Check back soon.
            </p>
          </div>
        )}
      </section>

      <p className="text-center text-sm text-[var(--color-ink-muted)]">
        <AppLink href="/" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; Back to today&apos;s digest
        </AppLink>
      </p>
    </div>
  );
}
