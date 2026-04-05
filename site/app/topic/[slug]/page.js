import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopicItems } from '../../../lib/content-data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug} — AI Builders Digest`,
    description: `Structured topic archive for ${slug}.`,
  };
}

export default async function TopicPage({ params }) {
  const { slug } = await params;
  const payload = await getTopicItems(slug);

  if (!payload) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-amber-300 hover:underline">&larr; Home</Link>
      </div>

      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-100">{payload.label}</h1>
        <p className="text-sm text-slate-400">
          Structured archive of recent items tagged with this topic.
        </p>
      </header>

      <div className="space-y-4">
        {payload.items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{item.section}</span>
              <span>·</span>
              <span>{item.sourceName}</span>
              {item.publishedAt ? (
                <>
                  <span>·</span>
                  <time>{new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                </>
              ) : null}
            </div>

            <h2 className="mb-2 text-lg font-medium text-white">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300">
                {item.title}
              </a>
            </h2>

            <p className="mb-3 text-sm text-slate-300">{item.summary}</p>

            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-200">Why this matters:</span> {item.whyThisMatters}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
