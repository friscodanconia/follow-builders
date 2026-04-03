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
      <h1 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Archive</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        All past digests, newest first.
      </p>

      {months.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
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
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">
                {label}
              </h2>
              <ul className="space-y-1">
                {grouped[month].map((entry) => (
                  <li key={entry.date}>
                    <a
                      href={`/digest/${entry.date}`}
                      className="flex items-center justify-between py-2 px-3 -mx-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
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
