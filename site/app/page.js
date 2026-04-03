import { getLatestDigest, getDigestIndex, markdownToHtml } from '../lib/digests';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function Home() {
  const latest = await getLatestDigest();
  const index = await getDigestIndex();

  if (!latest) {
    return (
      <div className="text-center py-16">
        <h1 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">AI Builders Digest</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Daily digest tracking what top AI builders are thinking and shipping.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          First digest coming soon. <a href="/subscribe" className="text-amber-600 dark:text-amber-400 underline">Subscribe</a> to get it in your inbox.
        </p>
      </div>
    );
  }

  const digestHtml = markdownToHtml(latest.content);
  const recentArchive = index.slice(1, 6);

  return (
    <div>
      <article>
        <div className="mb-6">
          <time className="text-sm text-gray-500 dark:text-gray-400">{latest.date}</time>
          <span className="text-sm text-gray-300 dark:text-gray-600 mx-2">·</span>
          <span className="text-sm text-amber-600 dark:text-amber-400">Latest</span>
        </div>
        <div
          className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: digestHtml }}
        />
      </article>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Get this in your inbox</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Daily digest of what top AI builders are thinking and shipping. Free, no spam.
        </p>
        <a
          href="/subscribe"
          className="inline-block bg-amber-600 dark:bg-amber-500 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-700 dark:hover:bg-amber-600"
        >
          Subscribe
        </a>
      </div>

      {recentArchive.length > 0 && (
        <div className="mt-12">
          <h2 className="font-medium text-sm mb-4 text-gray-500 dark:text-gray-400">Previous digests</h2>
          <ul className="space-y-2">
            {recentArchive.map((entry) => (
              <li key={entry.date}>
                <a
                  href={`/digest/${entry.date}`}
                  className="flex items-center justify-between py-2 px-3 -mx-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">{entry.title}</span>
                  <time className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-4">{entry.date}</time>
                </a>
              </li>
            ))}
          </ul>
          <a href="/archive" className="inline-block mt-3 text-sm text-amber-600 dark:text-amber-400 hover:underline">
            View all &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
