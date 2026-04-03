export const metadata = {
  title: 'Subscribe — AI Builders Digest',
  description: 'Get the AI Builders Digest in your inbox every day.',
};

export default function SubscribePage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Subscribe</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        Get a daily digest of what top AI builders are thinking and shipping —
        tweets, podcast highlights, and blog posts from the people actually building the future.
        Free, no spam, unsubscribe anytime.
      </p>

      <form
        action="https://buttondown.com/api/emails/embed-subscribe/soumyo"
        method="post"
        target="popupwindow"
        className="space-y-4"
      >
        <div>
          <label htmlFor="bd-email" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="bd-email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-600 dark:bg-amber-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
        >
          Subscribe
        </button>
      </form>

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Powered by <a href="https://buttondown.com" className="underline hover:no-underline" target="_blank" rel="noopener">Buttondown</a>.
        No tracking, no ads.
      </p>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h2 className="font-medium text-sm mb-3 text-gray-500 dark:text-gray-400">What you get</h2>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-amber-500 shrink-0">&#9679;</span>
            <span>Key tweets from 25+ AI builders (Karpathy, Swyx, Amanda Askell, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 shrink-0">&#9679;</span>
            <span>Podcast highlights from Latent Space, No Priors, Training Data, and more</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 shrink-0">&#9679;</span>
            <span>Blog posts from Anthropic Engineering and Claude Blog</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 shrink-0">&#9679;</span>
            <span>Delivered daily, summarized by AI so you can scan in 5 minutes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
