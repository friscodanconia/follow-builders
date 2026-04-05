import './globals.css';
import Link from 'next/link';
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
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)]" />
        <nav className="border-b border-slate-800/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-base font-semibold tracking-tight text-white transition hover:text-amber-300">
              {siteConfig.projectName}
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-slate-400 transition hover:text-white">
                Home
              </Link>
              <Link href="/archive" className="text-slate-400 transition hover:text-white">
                Archive
              </Link>
              <Link href="/subscribe" className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/15">
                {siteConfig.subscribeCtaLabel}
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-6 py-10">
          {children}
        </main>
        <footer className="mt-16 border-t border-slate-800">
          <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <span>{siteConfig.tagline}</span>
            <span>
              Mirroring feeds from{' '}
              <a href={siteConfig.upstreamRepoUrl} className="text-slate-400 underline decoration-slate-700 underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer">
                upstream
              </a>{' '}
              ·{' '}
              <a href={siteConfig.repoUrl} className="text-slate-400 underline decoration-slate-700 underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer">
                this fork
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
