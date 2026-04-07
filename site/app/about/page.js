import { AppLink } from '../../components/app-link';

export const metadata = {
  title: 'About — AI Builders Digest',
  description: 'How the AI Builders Digest is curated and why it exists.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          About this digest
        </h1>
      </section>

      <div className="space-y-6 text-base leading-7 text-[var(--color-ink-secondary)]">
        <p>
          AI Builders Digest is a daily briefing for people who build with AI, not just read about it.
          Every morning, we scan 14 sources across official blogs, research labs, open-source projects,
          podcasts, and builder communities to find the 3-5 stories that actually matter.
        </p>

        <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
          How we curate
        </h2>
        <p>
          Our pipeline pulls from RSS feeds, blog scrapers, and social posts from builders at
          companies like OpenAI, Anthropic, Google DeepMind, Mistral, DeepSeek, Qwen, and others.
          An automated scoring system ranks items by significance, novelty, and source credibility.
          Then an AI editor writes the digest in plain language with a "Why it matters" take on each story.
        </p>

        <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
          What we filter out
        </h2>
        <ul className="ml-5 list-disc space-y-2 marker:text-[var(--color-accent)]">
          <li>Benchmark improvements with no real-world impact</li>
          <li>Press releases dressed up as news</li>
          <li>Hot takes with no substance</li>
          <li>Hype cycles and engagement bait</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
          Who this is for
        </h2>
        <p>
          Product managers, founders, investors, and engineers who need to stay current on AI
          without spending an hour on Twitter every morning. If you want signal without noise,
          this is your daily briefing.
        </p>
      </div>

      <p className="text-center text-sm text-[var(--color-ink-muted)]">
        <AppLink href="/" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-warm)]">
          &larr; Back to today&apos;s digest
        </AppLink>
      </p>
    </div>
  );
}
