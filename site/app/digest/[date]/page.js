import { getDigest, getDigestIndex, markdownToHtml } from '../../../lib/digests';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const index = await getDigestIndex();
  return index.map((entry) => ({ date: entry.date }));
}

export async function generateMetadata({ params }) {
  const { date } = await params;
  return {
    title: `AI Builders Digest — ${date}`,
    description: `AI Builders Digest for ${date}`,
  };
}

export default async function DigestPage({ params }) {
  const { date } = await params;
  const digest = await getDigest(date);

  if (!digest) {
    notFound();
  }

  const digestHtml = markdownToHtml(digest.content);
  const index = await getDigestIndex();
  const currentIdx = index.findIndex((e) => e.date === date);
  const prev = currentIdx < index.length - 1 ? index[currentIdx + 1] : null;
  const next = currentIdx > 0 ? index[currentIdx - 1] : null;

  return (
    <div>
      <article>
        <div className="mb-6">
          <a href="/" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">&larr; Latest</a>
          <span className="text-sm text-gray-300 dark:text-gray-600 mx-2">·</span>
          <time className="text-sm text-gray-500 dark:text-gray-400">{date}</time>
        </div>
        <div
          className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: digestHtml }}
        />
      </article>

      <nav className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm">
        {prev ? (
          <a href={`/digest/${prev.date}`} className="text-amber-600 dark:text-amber-400 hover:underline">
            &larr; {prev.date}
          </a>
        ) : <span />}
        {next ? (
          <a href={`/digest/${next.date}`} className="text-amber-600 dark:text-amber-400 hover:underline">
            {next.date} &rarr;
          </a>
        ) : <span />}
      </nav>
    </div>
  );
}
