import { AppLink } from '../../components/app-link';
import { siteConfig } from '../../lib/site-config';

export const metadata = {
  title: 'Subscribe — AI Builders Digest',
  description: 'Get the AI Builders Digest in your inbox every day.',
};

const valueProps = [
  'Daily ranked brief before the long-form markdown issue',
  'Official labs, mirrored builders, and China-focused source coverage',
  'Topic-aware signal with “why this matters” framing',
  'Published by this fork, with upstream feed mirroring where needed',
];

export default function SubscribePage() {
  const hasSubscriptionForm = Boolean(siteConfig.subscribeUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
      <section className="glass-panel rounded-[30px] p-5 sm:p-8">
        <p className="eyebrow">Inbox delivery</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
          Get the operator brief where it belongs: your inbox.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
          This fork mirrors upstream builder coverage, adds structured ranking, and publishes its own digest archive and newsletter delivery workflow.
        </p>

        <div className="mt-6 space-y-3">
          {valueProps.map((item) => (
            <div key={item} className="rail-card flex items-start gap-3 px-4 py-4">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
              <p className="text-sm leading-6 text-[var(--color-ink-soft)]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="glass-panel rounded-[30px] p-5 sm:p-6">
        <p className="eyebrow">Subscription</p>
        <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
          {siteConfig.subscribeCtaLabel}
        </h2>

        {hasSubscriptionForm ? (
          <form
            action={siteConfig.subscribeUrl}
            method="post"
            target="popupwindow"
            className="mt-5 space-y-4"
          >
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
                className="w-full rounded-[22px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[rgba(248,185,73,0.38)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[#1a1308] transition hover:bg-[#ffd48d]"
            >
              {siteConfig.subscribeCtaLabel}
            </button>
          </form>
        ) : (
          <div className="mt-5 rail-card p-4">
            <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
              Subscription is not configured on this fork yet. Set <code>FOLLOW_BUILDERS_SUBSCRIBE_URL</code> in the deployment environment to enable it.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-5 text-sm leading-6 text-[var(--color-ink-soft)]">
          <p>
            Powered by <span className="text-[var(--color-ink)]">{siteConfig.newsletterProvider}</span>. No tracking or ad tooling is configured in this repo.
          </p>
          <AppLink href="/" className="mt-4 inline-flex text-[var(--color-accent)] hover:text-[#ffd48d]">
            Back to briefing home
          </AppLink>
        </div>
      </aside>
    </div>
  );
}
