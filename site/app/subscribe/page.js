export const metadata = {
  title: 'Subscribe — AI Builders Digest',
  description: 'Get the AI Builders Digest in your inbox every day.',
};

export default function SubscribePage() {
  const BUTTONDOWN_URL = process.env.NEXT_PUBLIC_BUTTONDOWN_URL || 'https://buttondown.com/ai-builders-digest';

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-3">Subscribe</h1>
      <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
        Get a daily digest of what top AI builders are thinking and shipping —
        tweets, podcast highlights, and blog posts from the people actually building the future.
        Free, no spam, unsubscribe anytime.
      </p>

      {/* Buttondown embedded form */}
      <form
        action={BUTTONDOWN_URL + '/api/emails/embed-subscribe/ai-builders-digest'}
        method="post"
        target="popupwindow"
        className="space-y-4"
      >
        <div>
          <label htmlFor="bd-email" className="block text-sm font-medium mb-1">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="bd-email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Subscribe
        </button>
      </form>

      <p className="mt-6 text-xs text-stone-400 dark:text-stone-500">
        Powered by <a href="https://buttondown.com" className="underline hover:no-underline" target="_blank" rel="noopener">Buttondown</a>.
        No tracking, no ads.
      </p>

      <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800">
        <h2 className="font-semibold mb-3 text-sm text-stone-500 dark:text-stone-400">What you get</h2>
        <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
          <li className="flex gap-2">
            <span className="text-blue-500 shrink-0">&#9679;</span>
            <span>Key tweets from 25+ AI builders (Karpathy, Swyx, Amanda Askell, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 shrink-0">&#9679;</span>
            <span>Podcast highlights from Latent Space, No Priors, Training Data, and more</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 shrink-0">&#9679;</span>
            <span>Blog posts from Anthropic Engineering and Claude Blog</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 shrink-0">&#9679;</span>
            <span>Delivered daily, summarized by AI so you can scan in 5 minutes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
