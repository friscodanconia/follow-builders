import './globals.css';
import { AppLink } from '../components/app-link';
import { siteConfig } from '../lib/site-config';

const metadata = {
  title: siteConfig.projectName,
  description: 'Daily digest tracking what top AI builders are thinking and shipping. Follow builders, not influencers.',
  openGraph: {
    title: siteConfig.projectName,
    description: 'Daily digest tracking what top AI builders are thinking and shipping.',
    siteName: siteConfig.projectName,
    type: 'website',
  },
};

if (siteConfig.siteUrl) {
  metadata.metadataBase = new URL(siteConfig.siteUrl);
  metadata.openGraph.url = siteConfig.siteUrl;
}

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen text-[var(--color-ink)] antialiased">
        <div className="site-shell">
          <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(7,17,31,0.72)] backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <AppLink href="/" className="block">
                  <span className="eyebrow">Operator Brief</span>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="font-display text-2xl leading-none text-[var(--color-ink)] sm:text-3xl">
                      {siteConfig.projectName}
                    </span>
                    <span className="max-w-xl text-sm text-[var(--color-ink-muted)]">
                      A mobile-first daily briefing on builders, labs, and high-signal releases.
                    </span>
                  </div>
                </AppLink>

                <nav className="flex flex-wrap gap-2 text-sm">
                  <AppLink href="/" className="nav-pill rounded-full px-3 py-2">
                    Home
                  </AppLink>
                  <AppLink href="/archive" className="nav-pill rounded-full px-3 py-2">
                    Archive
                  </AppLink>
                  <AppLink href="/subscribe" className="rounded-full border border-[rgba(248,185,73,0.28)] bg-[var(--color-accent-soft)] px-3 py-2 font-medium text-[var(--color-ink)] transition hover:border-[rgba(248,185,73,0.5)] hover:bg-[rgba(248,185,73,0.24)]">
                    {siteConfig.subscribeCtaLabel}
                  </AppLink>
                </nav>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 pb-18 pt-6 sm:px-6 sm:pt-8 lg:pt-10">
            <div className="page-reveal">{children}</div>
          </main>

          <footer className="mt-12 border-t border-[rgba(255,255,255,0.08)]">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
              <div className="glass-panel rounded-[28px] px-5 py-6 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="eyebrow">What this fork is doing</p>
                    <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
                      Structured signal on top of the upstream builder feed.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                      {siteConfig.tagline} This fork mirrors upstream X coverage, adds official and China-focused sources, and publishes its own ranked daily brief.
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-[var(--color-ink-soft)] sm:grid-cols-3 lg:min-w-[28rem]">
                    <a
                      href={siteConfig.upstreamRepoUrl}
                      className="rail-card px-4 py-3 transition hover:border-[rgba(248,185,73,0.28)] hover:text-[var(--color-ink)]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Upstream feed
                    </a>
                    <a
                      href={siteConfig.repoUrl}
                      className="rail-card px-4 py-3 transition hover:border-[rgba(248,185,73,0.28)] hover:text-[var(--color-ink)]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source code
                    </a>
                    <AppLink href="/subscribe" className="rail-card px-4 py-3 transition hover:border-[rgba(248,185,73,0.28)] hover:text-[var(--color-ink)]">
                      Inbox delivery
                    </AppLink>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
