export function formatIssueDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonthLabel(month) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export function formatPublishedDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function summarizeTopics(items = [], limit = 6) {
  const counts = new Map();

  for (const item of items) {
    for (const topic of item.topics || []) {
      const current = counts.get(topic.slug) || { slug: topic.slug, label: topic.label, count: 0 };
      current.count += 1;
      counts.set(topic.slug, current);
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function summarizeSections(items = []) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item.section, (counts.get(item.section) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function uniqueSourceCount(items = []) {
  return new Set(items.map((item) => item.sourceName).filter(Boolean)).size;
}
