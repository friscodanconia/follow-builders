import { siteConfig } from '../../lib/site-config';

export const metadata = {
  title: 'Subscribe — AI Builders Digest',
  description: 'Get the AI Builders Digest in your inbox every day.',
};

export default function SubscribePage() {
  const hasSubscriptionForm = Boolean(siteConfig.subscribeUrl);

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="mb-3 text-lg font-medium text-slate-100">{siteConfig.subscribeCtaLabel}</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-300">
        This fork mirrors upstream feed data from the original Follow Builders project, then publishes its own digest archive and delivery workflow.
      </p>

      {hasSubscriptionForm ? (
        <form
          action={siteConfig.subscribeUrl}
          method="post"
          target="popupwindow"
          className="space-y-4"
        >
          <div>
            <label htmlFor="bd-email" className="mb-1 block text-sm font-medium text-slate-100">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="bd-email"
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
          >
            {siteConfig.subscribeCtaLabel}
          </button>
        </form>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
          <p className="text-sm text-slate-300">
            Subscription is not configured on this fork yet. Set <code>FOLLOW_BUILDERS_SUBSCRIBE_URL</code> in the deployment environment to enable it.
          </p>
        </div>
      )}

      {hasSubscriptionForm ? (
        <p className="mt-6 text-xs text-slate-500">
          Powered by{' '}
          <span className="text-slate-400">{siteConfig.newsletterProvider}</span>.
          No tracking or ads are configured in this repo.
        </p>
      ) : null}

      <div className="mt-10 border-t border-slate-800 pt-6">
        <h2 className="mb-3 text-sm font-medium text-slate-400">What you get</h2>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="shrink-0 text-amber-400">&#9679;</span>
            <span>Key tweets from 25+ AI builders (Karpathy, Swyx, Amanda Askell, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-amber-400">&#9679;</span>
            <span>Podcast highlights from Latent Space, No Priors, Training Data, and more</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-amber-400">&#9679;</span>
            <span>Blog posts from Anthropic Engineering and Claude Blog</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-amber-400">&#9679;</span>
            <span>Published by this fork, with feed content mirrored from the upstream repo</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
