import { getLatestDigest, getDigestIndex, markdownToHtml } from '../lib/digests';

export const dynamic = 'force-static';
export const revalidate = 3600; // Rebuild at most once per hour

export default async function Home() {
  const latest = await getLatestDigest();
  const index = await getDigestIndex();

  if (!latest) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">AI Builders Digest</h1>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Daily digest tracking what top AI builders are thinking and shipping.
        </p>
        <p className="text-stone-400 dark:text-stone-500">
          First digest coming soon. <a href="/subscribe" className="text-blue-600 dark:text-blue-400 underline">Subscribe</a> to get it in your inbox.
        </p>
      </div>
    );
  }

  const digestHtml = markdownToHtml(latest.content);
  const recentArchive = index.slice(1, 6); // Skip the latest, show 5 more

  return (
    <div>
      {/* Latest digest */}
      <article>
        <div className="mb-6">
          <time className="text-sm text-stone-400 dark:text-stone-500">{latest.date}</time>
          <span className="text-sm text-stone-300 dark:text-stone-600 mx-2">·</span>
          <span className="text-sm text-stone-400 dark:text-stone-500">Latest</span>
        </div>
        <div
          className="prose prose-stone dark:prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: digestHtml }}
        />
      </article>

      {/* Subscribe CTA */}
      <div className="mt-12 p-6 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
        <h2 className="font-semibold mb-2">Get this in your inbox</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
          Daily digest of what top AI builders are thinking and shipping. Free, no spam.
        </p>
        <a
          href="/subscribe"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Subscribe
        </a>
      </div>

      {/* Recent archive */}
      {recentArchive.length > 0 && (
        <div className="mt-12">
          <h2 className="font-semibold mb-4 text-stone-600 dark:text-stone-400">Previous digests</h2>
          <ul className="space-y-2">
            {recentArchive.map((entry) => (
              <li key={entry.date}>
                <a
                  href={`/digest/${entry.date}`}
                  className="flex items-center justify-between py-2 px-3 -mx-3 rounded hover:bg-stone-50 dark:hover:bg-stone-900"
                >
                  <span className="text-sm">{entry.title}</span>
                  <time className="text-xs text-stone-400 dark:text-stone-500 shrink-0 ml-4">{entry.date}</time>
                </a>
              </li>
            ))}
          </ul>
          <a href="/archive" className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
