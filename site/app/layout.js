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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-medium text-white text-base hover:text-amber-400">
              AI Builders Digest
            </a>
            <div className="flex gap-4 items-center text-sm">
              <a href="/" className="text-gray-400 hover:text-amber-400">
                Home
              </a>
              <a href="/archive" className="text-gray-400 hover:text-amber-400">
                Archive
              </a>
              <a href="/subscribe" className="bg-amber-600 dark:bg-amber-500 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 dark:hover:bg-amber-600">
                Subscribe
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
          <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-gray-400 dark:text-gray-500">
            <span>Follow builders, not influencers.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
