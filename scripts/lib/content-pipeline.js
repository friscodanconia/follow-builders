import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { ensureArray, readJson, stableId, stripHtml, truncateText, writeJson } from './fs-utils.js';
import { tagContent } from './topic-taxonomy.js';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..', '..');
const HISTORY_DIR = join(ROOT_DIR, 'history');
const ITEMS_DIR = join(HISTORY_DIR, 'items');
const TOPICS_DIR = join(HISTORY_DIR, 'topics');
const SITE_DATA_DIR = join(ROOT_DIR, 'site', 'data');
const SITE_TOPICS_DIR = join(SITE_DATA_DIR, 'topics');
const SITE_ITEMS_DIR = join(SITE_DATA_DIR, 'items');

function normalizeDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

function sectionFromItem(item) {
  if (item.topics.some((topic) => topic.slug === 'china-models')) return 'Chinese Models';
  if (item.sourceGroup === 'official') return 'Official Sources';
  if (item.sourceType === 'podcast' || item.sourceGroup === 'editorial') return 'Podcasts & Newsletters';
  if (item.sourceType === 'x') return 'Builders';
  return 'Watchlist';
}

function computeImportance(item) {
  let score = 0.4;

  if (item.sourceGroup === 'official') score += 0.22;
  if (item.sourceGroup === 'china') score += 0.18;
  if (item.sourceType === 'podcast') score += 0.12;
  if (item.sourceType === 'x') score += Math.min(0.2, ((item.metrics?.likes || 0) / 1000));
  if (item.topics.some((topic) => topic.slug === 'agents')) score += 0.16;
  if (item.topics.some((topic) => topic.slug === 'china-models')) score += 0.18;
  if (item.topics.some((topic) => topic.slug === 'enterprise')) score += 0.08;
  if (item.topics.some((topic) => topic.slug === 'evals')) score += 0.08;

  return Math.min(1, Number(score.toFixed(2)));
}

function whyThisMattersForItem(item) {
  const topicSlugs = item.topics.map((topic) => topic.slug);

  if (topicSlugs.includes('china-models')) {
    return 'Chinese model labs are iterating quickly, and primary-source coverage here helps catch capability and product shifts before western summaries flatten the details.';
  }

  if (topicSlugs.includes('agents')) {
    return 'This matters because agent capability is increasingly becoming a product and workflow differentiator, not just a demo category.';
  }

  if (topicSlugs.includes('coding')) {
    return 'This matters because coding workflows are one of the fastest feedback loops for measuring whether model improvements change real developer productivity.';
  }

  if (topicSlugs.includes('enterprise')) {
    return 'This matters because enterprise adoption signals which capabilities are moving from experimentation into budgeted software spend.';
  }

  if (topicSlugs.includes('evals') || topicSlugs.includes('benchmarks')) {
    return 'This matters because better evaluation changes how teams choose models, trust outputs, and ship production features safely.';
  }

  if (item.sourceGroup === 'official') {
    return 'This matters because primary-source announcements usually reveal capability, product, or policy shifts before they are filtered through secondary coverage.';
  }

  return 'This matters because it adds direct signal from people and teams shaping how AI products are actually being built and deployed.';
}

async function loadHistoricalUrls() {
  if (!existsSync(ITEMS_DIR)) return new Set();

  const files = (await readdir(ITEMS_DIR)).filter((file) => file.endsWith('.json'));
  const seen = new Set();

  for (const file of files) {
    const payload = JSON.parse(await readFile(join(ITEMS_DIR, file), 'utf-8'));
    for (const item of payload.items || []) {
      if (item.url) seen.add(item.url);
    }
  }

  return seen;
}

async function normalizeXFeed(feedX, digestDate) {
  const items = [];

  for (const builder of ensureArray(feedX?.x)) {
    for (const tweet of ensureArray(builder.tweets)) {
      const content = truncateText(stripHtml(tweet.text || ''), 500);
      items.push({
        id: stableId(['x', tweet.id || tweet.url, builder.handle]),
        date: digestDate,
        sourceType: 'x',
        sourceGroup: 'mirrored',
        sourceName: 'X',
        sourceKey: `x:${builder.handle}`,
        builderOrOrg: builder.name,
        title: truncateText(content, 96),
        url: tweet.url,
        publishedAt: normalizeDate(tweet.createdAt),
        content,
        summary: truncateText(content, 220),
        regionTags: [],
        metrics: {
          likes: tweet.likes || 0,
          retweets: tweet.retweets || 0,
          replies: tweet.replies || 0,
        },
      });
    }
  }

  return items;
}

async function normalizePodcastFeed(feedPodcasts, digestDate) {
  return ensureArray(feedPodcasts?.podcasts).map((podcast) => {
    const content = truncateText(stripHtml(podcast.transcript || ''), 4000);
    return {
      id: stableId(['podcast', podcast.guid || podcast.url, podcast.name]),
      date: digestDate,
      sourceType: 'podcast',
      sourceGroup: 'mirrored',
      sourceName: podcast.name,
      sourceKey: `podcast:${podcast.name}`,
      builderOrOrg: podcast.name,
      title: stripHtml(podcast.title || podcast.name),
      url: podcast.url,
      publishedAt: normalizeDate(podcast.publishedAt),
      content,
      summary: truncateText(content, 240),
      regionTags: [],
      metrics: {},
    };
  });
}

async function normalizeBlogFeed(feedBlogs, digestDate) {
  return ensureArray(feedBlogs?.blogs).map((blog) => {
    const content = truncateText(stripHtml(blog.content || blog.summary || ''), 2000);
    return {
      id: stableId(['blog', blog.url, blog.name]),
      date: digestDate,
      sourceType: 'blog',
      sourceGroup: 'mirrored',
      sourceName: blog.name,
      sourceKey: `blog:${blog.name}`,
      builderOrOrg: blog.name,
      title: stripHtml(blog.title || blog.name),
      url: blog.url,
      publishedAt: normalizeDate(blog.publishedAt),
      content,
      summary: truncateText(content, 240),
      regionTags: ensureArray(blog.regionTags),
      metrics: {},
    };
  });
}

async function normalizeExternalFeed(externalFeed, digestDate) {
  return ensureArray(externalFeed?.articles).map((article) => {
    const content = truncateText(stripHtml(article.content || article.summary || ''), 2000);
    return {
      id: article.id || stableId(['external', article.url, article.name]),
      date: digestDate,
      sourceType: article.sourceType || 'article',
      sourceGroup: article.sourceGroup || 'official',
      sourceName: article.name,
      sourceKey: `${article.sourceGroup || 'external'}:${article.name}`,
      builderOrOrg: article.builderOrOrg || article.name,
      title: stripHtml(article.title || article.name),
      url: article.url,
      publishedAt: normalizeDate(article.publishedAt),
      content,
      summary: truncateText(stripHtml(article.summary || content), 240),
      regionTags: ensureArray(article.regionTags),
      metrics: {},
    };
  });
}

function selectDigestItems(items) {
  const sorted = [...items].sort((a, b) => b.digestScore - a.digestScore);
  const selected = [];
  const sourceCounts = new Map();
  const topicCounts = new Map();
  let chinaSelected = 0;

  for (const item of sorted) {
    if (selected.length >= 10) break;

    const sourceKey = item.sourceKey || item.sourceName;
    const sourceCount = sourceCounts.get(sourceKey) || 0;
    if (sourceCount >= 1) continue;

    const dominantTopic = item.topics[0]?.slug;
    if (dominantTopic) {
      const topicCount = topicCounts.get(dominantTopic) || 0;
      if (topicCount >= 2 && dominantTopic !== 'china-models') continue;
    }

    if (item.section === 'Chinese Models' && chinaSelected >= 2) continue;

    selected.push(item);
    sourceCounts.set(sourceKey, sourceCount + 1);
    if (dominantTopic) topicCounts.set(dominantTopic, (topicCounts.get(dominantTopic) || 0) + 1);
    if (item.section === 'Chinese Models') chinaSelected += 1;
  }

  return selected;
}

function buildTopicIndex(items) {
  const map = new Map();

  for (const item of items) {
    for (const topic of item.topics) {
      const current = map.get(topic.slug) || {
        slug: topic.slug,
        label: topic.label,
        count: 0,
        latestDate: item.date,
      };

      current.count += 1;
      current.latestDate = current.latestDate > item.date ? current.latestDate : item.date;
      map.set(topic.slug, current);
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function buildStructuredDataset({ digestDate, feedX, feedPodcasts, feedBlogs, externalFeed }) {
  const historicalUrls = await loadHistoricalUrls();
  const normalized = [
    ...(await normalizeXFeed(feedX, digestDate)),
    ...(await normalizePodcastFeed(feedPodcasts, digestDate)),
    ...(await normalizeBlogFeed(feedBlogs, digestDate)),
    ...(await normalizeExternalFeed(externalFeed, digestDate)),
  ];

  const items = [];

  for (const item of normalized) {
    const topics = await tagContent({
      title: item.title,
      content: item.content,
      builderOrOrg: item.builderOrOrg,
      regionTags: item.regionTags,
    });

    const noveltyScore = historicalUrls.has(item.url) ? 0.3 : 1;
    const enriched = {
      ...item,
      topics,
      section: 'Watchlist',
    };

    enriched.importanceScore = computeImportance(enriched);
    enriched.noveltyScore = noveltyScore;
    enriched.digestScore = Number((enriched.importanceScore * 0.65 + noveltyScore * 0.35).toFixed(2));
    enriched.whyThisMatters = whyThisMattersForItem(enriched);
    enriched.section = sectionFromItem(enriched);
    items.push(enriched);
  }

  const selectedItems = selectDigestItems(items);
  const topicIndex = buildTopicIndex(items);

  return {
    generatedAt: new Date().toISOString(),
    date: digestDate,
    items,
    selectedItems,
    topicIndex,
    sections: [...new Set(selectedItems.map((item) => item.section))],
    stats: {
      totalItems: items.length,
      selectedItems: selectedItems.length,
      chinaItems: items.filter((item) => item.topics.some((topic) => topic.slug === 'china-models')).length,
    },
  };
}

export async function saveStructuredDataset(dataset) {
  await writeJson(join(ITEMS_DIR, `${dataset.date}.json`), dataset);
  await writeJson(join(SITE_ITEMS_DIR, `${dataset.date}.json`), dataset);
  const existingItemIndex = await readJson(join(HISTORY_DIR, 'item-index.json'), {
    generatedAt: null,
    dates: [],
    latestDate: null,
  });
  const dates = [...new Set([dataset.date, ...(existingItemIndex.dates || [])])].sort((a, b) => b.localeCompare(a));
  await writeJson(join(HISTORY_DIR, 'item-index.json'), {
    generatedAt: dataset.generatedAt,
    dates,
    latestDate: dates[0] || dataset.date,
  });
  await writeJson(join(SITE_DATA_DIR, 'item-index.json'), {
    generatedAt: dataset.generatedAt,
    dates,
    latestDate: dates[0] || dataset.date,
  });

  const topicSummaries = [];
  for (const topic of dataset.topicIndex) {
    const existingPayload = await readJson(join(TOPICS_DIR, `${topic.slug}.json`), {
      generatedAt: null,
      slug: topic.slug,
      label: topic.label,
      items: [],
    });
    const incoming = dataset.items.filter((item) => item.topics.some((entry) => entry.slug === topic.slug));
    const mergedItems = [...incoming, ...(existingPayload.items || [])];
    const dedupedItems = [];
    const seen = new Set();

    for (const item of mergedItems) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      dedupedItems.push(item);
    }

    await writeJson(join(TOPICS_DIR, `${topic.slug}.json`), {
      generatedAt: dataset.generatedAt,
      slug: topic.slug,
      label: topic.label,
      items: dedupedItems.slice(0, 50),
    });
    await writeJson(join(SITE_TOPICS_DIR, `${topic.slug}.json`), {
      generatedAt: dataset.generatedAt,
      slug: topic.slug,
      label: topic.label,
      items: dedupedItems.slice(0, 50),
    });

    topicSummaries.push({
      slug: topic.slug,
      label: topic.label,
      count: dedupedItems.slice(0, 50).length,
      latestDate: dataset.date,
    });
  }

  const sortedTopicSummaries = topicSummaries.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  await writeJson(join(TOPICS_DIR, 'index.json'), sortedTopicSummaries);
  await writeJson(join(SITE_TOPICS_DIR, 'index.json'), sortedTopicSummaries);
}
