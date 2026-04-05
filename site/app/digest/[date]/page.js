import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DigestContent } from '../../../components/digest-content';
import { getDigest, getDigestIndex, parseDigestMarkdown } from '../../../lib/digests';

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

  const digestBlocks = parseDigestMarkdown(digest.content);
  const index = await getDigestIndex();
  const currentIdx = index.findIndex((e) => e.date === date);
  const prev = currentIdx < index.length - 1 ? index[currentIdx + 1] : null;
  const next = currentIdx > 0 ? index[currentIdx - 1] : null;

  return (
    <div>
      <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-amber-300 hover:underline">&larr; Latest</Link>
          <span className="mx-2 text-sm text-slate-600">·</span>
          <time className="text-sm text-slate-400">{date}</time>
        </div>
        <DigestContent blocks={digestBlocks} />
      </article>

      <nav className="mt-12 flex justify-between border-t border-slate-800 pt-6 text-sm">
        {prev ? (
          <Link href={`/digest/${prev.date}`} className="text-amber-300 hover:underline">
            &larr; {prev.date}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/digest/${next.date}`} className="text-amber-300 hover:underline">
            {next.date} &rarr;
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
