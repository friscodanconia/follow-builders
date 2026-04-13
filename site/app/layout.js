import './globals.css';
import { AppLink } from '../components/app-link';
import { siteConfig } from '../lib/site-config';

const metadata = {
  title: siteConfig.projectName,
  description: 'A daily summary of what top AI builders are shipping. Simple, readable, no hype.',
  openGraph: {
    title: siteConfig.projectName,
    description: 'A daily summary of what top AI builders are shipping.',
    siteName: siteConfig.projectName,
    type: 'website',
  },
  alternates: siteConfig.siteUrl
    ? { canonical: siteConfig.siteUrl }
    : {},
};

if (siteConfig.siteUrl) {
  metadata.metadataBase = new URL(siteConfig.siteUrl);
  metadata.openGraph.url = siteConfig.siteUrl;
}

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title={siteConfig.projectName} href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteConfig.projectName,
              url: siteConfig.siteUrl,
              description: 'A daily summary of what top AI builders are shipping. Simple, readable, no hype.',
              publisher: {
                '@type': 'Organization',
                name: siteConfig.projectName,
                url: siteConfig.siteUrl,
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteConfig.siteUrl}/archive?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(250,248,245,0.92)] backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-5 py-4">
            <div className="flex items-center justify-between">
              <AppLink href="/" className="block">
                <span className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                  {siteConfig.projectName}
                </span>
              </AppLink>

              <nav className="flex items-center gap-5 text-sm">
                <AppLink href="/archive" className="font-medium text-[var(--color-ink-secondary)] transition hover:text-[var(--color-ink)]">
                  Archive
                </AppLink>
                <AppLink href="/about" className="font-medium text-[var(--color-ink-secondary)] transition hover:text-[var(--color-ink)]">
                  About
                </AppLink>
                {siteConfig.subscribeUrl && (
                  <AppLink href="/subscribe" className="rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition hover:bg-[var(--color-accent-warm)]">
                    Subscribe
                  </AppLink>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
          <div className="page-reveal">{children}</div>
        </main>

        <footer className="border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-3xl px-5 py-8">
            <p className="text-sm text-[var(--color-ink-muted)]">
              {siteConfig.tagline} A daily digest of what matters in AI, written for humans.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
