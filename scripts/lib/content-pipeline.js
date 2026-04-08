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
const BUILDERS_DIR = join(HISTORY_DIR, 'builders');
const SITE_BUILDERS_DIR = join(SITE_DATA_DIR, 'builders');

const MAX_AGE_DAYS = 7;

function normalizeDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

// Extract publication date from URL patterns when publishedAt is missing.
// Covers patterns like: /news250821 (YYMMDD), /2025/08/21/, /blog/2025-08-21-slug
function extractDateFromUrl(url) {
  if (!url) return null;

  // Pattern: newsYYMMDD (e.g., DeepSeek's /news250821)
  const newsPattern = url.match(/\/news(\d{2})(\d{2})(\d{2})/);
  if (newsPattern) {
    const [, yy, mm, dd] = newsPattern;
    const year = 2000 + parseInt(yy, 10);
    const date = new Date(year, parseInt(mm, 10) - 1, parseInt(dd, 10));
    if (!isNaN(date.getTime())) return date.toISOString();
  }

  // Pattern: /YYYY/MM/DD/ or /YYYY-MM-DD
  const datePathPattern = url.match(/\/(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (datePathPattern) {
    const [, yyyy, mm, dd] = datePathPattern;
    const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    if (!isNaN(date.getTime())) return date.toISOString();
  }

  return null;
}

// Returns true if the item is too old to include in a digest for the given date.
function isStale(item, digestDate) {
  const pubDate = item.publishedAt || extractDateFromUrl(item.url);
  if (!pubDate) return false; // can't determine age — let it through
  const pub = new Date(pubDate);
  const digest = new Date(digestDate);
  const ageMs = digest.getTime() - pub.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > MAX_AGE_DAYS;
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

  if (item.sourceGroup === 'official') score += 0.18;
  if (item.sourceGroup === 'china') score += 0.15;
  if (item.sourceType === 'podcast') score += 0.12;
  // Builder tweets: base boost + engagement scaling (lower threshold than before)
  if (item.sourceType === 'x') score += 0.15 + Math.min(0.15, ((item.metrics?.likes || 0) / 300));
  if (item.topics.some((topic) => topic.slug === 'agents')) score += 0.14;
  if (item.topics.some((topic) => topic.slug === 'china-models')) score += 0.15;
  if (item.topics.some((topic) => topic.slug === 'enterprise')) score += 0.08;
  if (item.topics.some((topic) => topic.slug === 'evals')) score += 0.08;

  return Math.min(1, Number(score.toFixed(2)));
}

function whyThisMattersForItem() {
  return '';
}

async function loadHistoricalUrls() {
  if (!existsSync(ITEMS_DIR)) return { allUrls: new Set(), selectedUrls: new Set() };

  const files = (await readdir(ITEMS_DIR)).filter((file) => file.endsWith('.json'));
  const allUrls = new Set();
  const selectedUrls = new Set();

  for (const file of files) {
    const payload = JSON.parse(await readFile(join(ITEMS_DIR, file), 'utf-8'));
    for (const item of payload.items || []) {
      if (item.url) allUrls.add(item.url);
    }
    for (const item of payload.selectedItems || []) {
      if (item.url) selectedUrls.add(item.url);
    }
  }

  return { allUrls, selectedUrls };
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
  return ensureArray(externalFeed?.articles).filter((article) => article.sourceType !== 'meta').map((article) => {
    const content = truncateText(stripHtml(article.content || article.summary || ''), 2000);
    // Use publishedAt if available, otherwise try to extract date from URL
    const publishedAt = normalizeDate(article.publishedAt) || extractDateFromUrl(article.url);
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
      publishedAt,
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
  let builderSelected = 0;

  function trySelect(item) {
    if (item.previouslySelected) return false;

    const sourceKey = item.sourceKey || item.sourceName;
    const sourceCount = sourceCounts.get(sourceKey) || 0;
    if (sourceCount >= 1) return false;

    const dominantTopic = item.topics[0]?.slug;
    if (dominantTopic) {
      const topicCount = topicCounts.get(dominantTopic) || 0;
      if (topicCount >= 2 && dominantTopic !== 'china-models') return false;
    }

    if (item.section === 'Chinese Models' && chinaSelected >= 2) return false;

    selected.push(item);
    sourceCounts.set(sourceKey, sourceCount + 1);
    if (dominantTopic) topicCounts.set(dominantTopic, (topicCounts.get(dominantTopic) || 0) + 1);
    if (item.section === 'Chinese Models') chinaSelected += 1;
    if (item.sourceType === 'x') builderSelected += 1;
    return true;
  }

  // First pass: select top items by score
  for (const item of sorted) {
    if (selected.length >= 5) break;
    trySelect(item);
  }

  // Guarantee at least 1 builder voice: if none selected, swap the lowest-scored non-builder
  if (builderSelected === 0) {
    const topBuilder = sorted.find((item) =>
      item.sourceType === 'x' &&
      !item.previouslySelected &&
      !selected.some((s) => s.id === item.id)
    );

    if (topBuilder && selected.length > 0) {
      const lastNonBuilder = [...selected].reverse().findIndex((s) => s.sourceType !== 'x');
      if (lastNonBuilder !== -1) {
        selected.splice(selected.length - 1 - lastNonBuilder, 1);
        selected.push(topBuilder);
      }
    }
  }

  // Guarantee at least 1 Chinese AI item
  const hasChina = selected.some((s) => s.topics?.some((t) => t.slug === 'china-models'));
  if (!hasChina) {
    const topChina = sorted.find((item) =>
      item.topics?.some((t) => t.slug === 'china-models') &&
      !item.previouslySelected &&
      !selected.some((s) => s.id === item.id)
    );

    if (topChina && selected.length > 0) {
      const lastNonChina = [...selected].reverse().findIndex((s) =>
        !s.topics?.some((t) => t.slug === 'china-models') && s.sourceType !== 'x'
      );
      if (lastNonChina !== -1) {
        selected.splice(selected.length - 1 - lastNonChina, 1);
        selected.push(topChina);
      }
    }
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
  const { allUrls: historicalUrls, selectedUrls: previouslySelectedUrls } = await loadHistoricalUrls();
  const normalized = [
    ...(await normalizeXFeed(feedX, digestDate)),
    ...(await normalizePodcastFeed(feedPodcasts, digestDate)),
    ...(await normalizeBlogFeed(feedBlogs, digestDate)),
    ...(await normalizeExternalFeed(externalFeed, digestDate)),
  ];

  // Filter out stale items before scoring — prevents old content from being
  // presented as breaking news, which destroys credibility.
  const fresh = [];
  const staleCount = { total: 0, bySource: {} };
  for (const item of normalized) {
    if (isStale(item, digestDate)) {
      staleCount.total += 1;
      staleCount.bySource[item.sourceName] = (staleCount.bySource[item.sourceName] || 0) + 1;
      continue;
    }
    fresh.push(item);
  }
  if (staleCount.total > 0) {
    console.error(`  Freshness filter: dropped ${staleCount.total} stale items (>${MAX_AGE_DAYS}d old):`, JSON.stringify(staleCount.bySource));
  }

  const items = [];

  for (const item of fresh) {
    const topics = await tagContent({
      title: item.title,
      content: item.content,
      builderOrOrg: item.builderOrOrg,
      regionTags: item.regionTags,
    });

    const wasPreviouslySelected = previouslySelectedUrls.has(item.url);
    const noveltyScore = historicalUrls.has(item.url) ? 0.3 : 1;
    const enriched = {
      ...item,
      topics,
      section: 'Watchlist',
    };

    enriched.importanceScore = computeImportance(enriched);
    enriched.noveltyScore = noveltyScore;
    enriched.previouslySelected = wasPreviouslySelected;
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

  // Accumulate builder data from X/Twitter items
  const builderItems = dataset.items.filter((item) => item.sourceType === 'x' && item.sourceKey);
  const builderMap = new Map();

  for (const item of builderItems) {
    const handle = item.sourceKey.replace('x:', '');
    if (!handle) continue;

    if (!builderMap.has(handle)) {
      builderMap.set(handle, {
        handle,
        name: item.builderOrOrg || handle,
        items: [],
      });
    }
    builderMap.get(handle).items.push(item);
  }

  const builderSummaries = [];

  for (const [handle, builder] of builderMap) {
    const existingPayload = await readJson(join(BUILDERS_DIR, `${handle}.json`), {
      generatedAt: null,
      handle,
      name: builder.name,
      items: [],
    });

    const mergedItems = [...builder.items, ...(existingPayload.items || [])];
    const dedupedItems = [];
    const seen = new Set();

    for (const item of mergedItems) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      dedupedItems.push(item);
    }

    const sortedItems = dedupedItems
      .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
      .slice(0, 50);

    const payload = {
      generatedAt: dataset.generatedAt,
      handle,
      name: existingPayload.name || builder.name,
      itemCount: sortedItems.length,
      latestDate: dataset.date,
      items: sortedItems,
    };

    await writeJson(join(BUILDERS_DIR, `${handle}.json`), payload);
    await writeJson(join(SITE_BUILDERS_DIR, `${handle}.json`), payload);

    builderSummaries.push({
      handle,
      name: payload.name,
      itemCount: sortedItems.length,
      latestDate: dataset.date,
    });
  }

  // Merge with existing builder index and seed all tracked builders from config
  const existingBuilderIndex = await readJson(join(BUILDERS_DIR, 'index.json'), []);
  const indexMap = new Map(existingBuilderIndex.map((b) => [b.handle, b]));
  for (const summary of builderSummaries) {
    indexMap.set(summary.handle, summary);
  }

  // Seed builders from config that haven't appeared in feeds yet
  try {
    const configPath = join(ROOT_DIR, 'config', 'default-sources.json');
    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    for (const account of config.x_accounts || []) {
      if (!indexMap.has(account.handle)) {
        indexMap.set(account.handle, {
          handle: account.handle,
          name: account.name,
          itemCount: 0,
          latestDate: null,
        });
        // Create empty builder file so the page can render
        await writeJson(join(BUILDERS_DIR, `${account.handle}.json`), {
          generatedAt: dataset.generatedAt,
          handle: account.handle,
          name: account.name,
          itemCount: 0,
          latestDate: null,
          items: [],
        });
        await writeJson(join(SITE_BUILDERS_DIR, `${account.handle}.json`), {
          generatedAt: dataset.generatedAt,
          handle: account.handle,
          name: account.name,
          itemCount: 0,
          latestDate: null,
          items: [],
        });
      }
    }
  } catch {
    // Config not found, skip seeding
  }

  const sortedBuilderIndex = [...indexMap.values()].sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name));
  await writeJson(join(BUILDERS_DIR, 'index.json'), sortedBuilderIndex);
  await writeJson(join(SITE_BUILDERS_DIR, 'index.json'), sortedBuilderIndex);
}
