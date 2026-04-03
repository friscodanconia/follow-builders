import './globals.css';

export const metadata = {
  title: 'AI Builders Digest',
  description: 'Daily digest tracking what top AI builders are thinking and shipping. Follow builders, not influencers.',
  openGraph: {
    title: 'AI Builders Digest',
    description: 'Daily digest tracking what top AI builders are thinking and shipping.',
    url: 'https://aiupdates.soumyosinha.com',
    siteName: 'AI Builders Digest',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight hover:opacity-80">
              AI Builders Digest
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/archive" className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
                Archive
              </a>
              <a href="/subscribe" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                Subscribe
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-stone-200 dark:border-stone-800 mt-16">
          <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-stone-400 dark:text-stone-600 flex justify-between">
            <span>Follow builders, not influencers.</span>
            <a
              href="https://github.com/friscodanconia/follow-builders"
              className="hover:text-stone-600 dark:hover:text-stone-400"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
