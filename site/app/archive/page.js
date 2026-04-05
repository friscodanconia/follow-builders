import Link from 'next/link';
import { getDigestIndex } from '../../lib/digests';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Archive — AI Builders Digest',
  description: 'Browse all past AI Builders Digest issues.',
};

export default async function ArchivePage() {
  const index = await getDigestIndex();

  const grouped = {};
  for (const entry of index) {
    const month = entry.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(entry);
  }

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium text-slate-100">Archive</h1>
      <p className="mb-8 text-sm text-slate-400">
        All past digests, newest first.
      </p>

      {months.length === 0 ? (
        <p className="text-sm text-slate-500">
          No digests yet. Check back soon.
        </p>
      ) : (
        months.map((month) => {
          const label = new Date(month + '-01').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });
          return (
            <div key={month} className="mb-8">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </h2>
              <ul className="space-y-1">
                {grouped[month].map((entry) => (
                  <li key={entry.date}>
                    <Link
                      href={`/digest/${entry.date}`}
                      className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-slate-900/60"
                    >
                      <span className="text-sm text-slate-300">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
