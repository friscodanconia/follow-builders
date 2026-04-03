import { getDigestIndex } from '../../lib/digests';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Archive — AI Builders Digest',
  description: 'Browse all past AI Builders Digest issues.',
};

export default async function ArchivePage() {
  const index = await getDigestIndex();

  // Group by month
  const grouped = {};
  for (const entry of index) {
    const month = entry.date.slice(0, 7); // YYYY-MM
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(entry);
  }

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Archive</h1>
      <p className="text-stone-500 dark:text-stone-400 mb-8 text-sm">
        All past digests, newest first.
      </p>

      {months.length === 0 ? (
        <p className="text-stone-400 dark:text-stone-500">
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
              <h2 className="text-sm font-semibold text-stone-400 dark:text-stone-500 mb-3 uppercase tracking-wide">
                {label}
              </h2>
              <ul className="space-y-1">
                {grouped[month].map((entry) => (
                  <li key={entry.date}>
                    <a
                      href={`/digest/${entry.date}`}
                      className="flex items-center justify-between py-2 px-3 -mx-3 rounded hover:bg-stone-50 dark:hover:bg-stone-900"
                    >
                      <span className="text-sm">{entry.title}</span>
                      <time className="text-xs text-stone-400 dark:text-stone-500 shrink-0 ml-4">
                        {entry.date}
                      </time>
                    </a>
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
