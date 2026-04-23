#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join } from 'path';
import { readJson, safeUrl, stableId, stripHtml, truncateText, writeJson } from './lib/fs-utils.js';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..');

function parseRssFeed(xml) {
  const items = [];

  // Try RSS 2.0 (<item> tags)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1];
    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    const descriptionMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/);
    const contentMatch = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    const summary = stripHtml(descriptionMatch ? descriptionMatch[1].trim() : '');
    const content = stripHtml(contentMatch ? contentMatch[1].trim() : '') || summary;
    items.push({
      title: stripHtml(titleMatch ? titleMatch[1].trim() : 'Untitled'),
      url: safeUrl(linkMatch ? linkMatch[1].trim() : ''),
      summary,
      content,
      publishedAt: pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : null,
    });
  }

  // Try Atom (<entry> tags) if no RSS items found
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    let entryMatch;

    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const block = entryMatch[1];
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const linkMatch = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/) || block.match(/<link[^>]*>([\s\S]*?)<\/link>/);
      const summaryMatch = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || block.match(/<content[^>]*>([\s\S]*?)<\/content>/);
      const updatedMatch = block.match(/<updated>([\s\S]*?)<\/updated>/) || block.match(/<published>([\s\S]*?)<\/published>/);

      items.push({
        title: stripHtml(titleMatch ? titleMatch[1].trim() : 'Untitled'),
        url: safeUrl(linkMatch ? linkMatch[1].trim() : ''),
        summary: stripHtml(summaryMatch ? summaryMatch[1].trim() : ''),
        publishedAt: updatedMatch ? new Date(updatedMatch[1].trim()).toISOString() : null,
      });
    }
  }

  return items.filter((item) => item.url);
}

function parseJsonFeed(payload) {
  const entries = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload) ? payload : [];

  return entries
    .map((entry) => ({
      title: stripHtml(entry.title || ''),
      url: safeUrl(entry.url || entry.external_url || entry.id || ''),
      summary: stripHtml(entry.summary || entry.content_text || entry.content_html || ''),
      publishedAt: entry.date_published || entry.published_at || null,
    }))
    .filter((entry) => entry.url);
}

async function fetchArticle(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function parseHtmlIndex(html, source) {
  const links = new Set();
  const hrefRegex = /href="([^"]+)"/g;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    if (!href.includes(source.articlePathPrefix)) continue;
    const url = safeUrl(href.startsWith('http') ? href : `${source.baseUrl}${href}`);
    if (url) links.add(url);
  }

  return [...links].slice(0, 5);
}

// Extract publication date from URL patterns when HTML metadata is missing.
// Covers: /newsYYMMDD (DeepSeek), /YYYY/MM/DD/, /YYYY-MM-DD-slug
function extractDateFromUrl(url) {
  if (!url) return null;
  const newsPattern = url.match(/\/news(\d{2})(\d{2})(\d{2})/);
  if (newsPattern) {
    const [, yy, mm, dd] = newsPattern;
    const date = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  const datePathPattern = url.match(/\/(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (datePathPattern) {
    const [, yyyy, mm, dd] = datePathPattern;
    const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

function extractArticleMetadata(html, url) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    || html.match(/property="og:title"\s+content="([^"]+)"/i)
    || html.match(/name="twitter:title"\s+content="([^"]+)"/i);
  const descriptionMatch = html.match(/property="og:description"\s+content="([^"]+)"/i)
    || html.match(/name="description"\s+content="([^"]+)"/i)
    || html.match(/name="twitter:description"\s+content="([^"]+)"/i);
  const timeMatch = html.match(/datetime="([^"]+)"/i)
    || html.match(/"datePublished":"([^"]+)"/i)
    || html.match(/"dateModified":"([^"]+)"/i);

  const title = stripHtml(titleMatch ? titleMatch[1] : url);
  const summary = truncateText(stripHtml(descriptionMatch ? descriptionMatch[1] : ''), 240);

  // Some sites (e.g., MiniMax) return the current server time as datePublished
  // on every request. Detect and discard dates within 10 minutes of now.
  let publishedAt = null;
  if (timeMatch) {
    const parsed = new Date(timeMatch[1]);
    const ageMs = Math.abs(Date.now() - parsed.getTime());
    if (ageMs > 10 * 60 * 1000) {
      publishedAt = parsed.toISOString();
    }
  }
  if (!publishedAt) {
    publishedAt = extractDateFromUrl(url);
  }

  return {
    title,
    summary,
    publishedAt,
    content: summary,
  };
}

async function loadSourceManifest(filename) {
  const filepath = join(ROOT_DIR, 'config', filename);
  return JSON.parse(await readFile(filepath, 'utf-8')).sources || [];
}

async function fetchSource(source) {
  try {
    if (source.sourceType === 'rss') {
      const xml = await fetchArticle(source.feedUrl);
      return parseRssFeed(xml).slice(0, 5).map((entry) => ({
        id: stableId([source.id, entry.url]),
        name: source.name,
        sourceGroup: source.sourceGroup,
        sourceType: 'newsletter',
        builderOrOrg: source.builderOrOrg,
        regionTags: source.regionTags || [],
        ...entry,
      }));
    }

    if (source.sourceType === 'json-feed') {
      const response = await fetch(source.feedUrl, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      return parseJsonFeed(payload).slice(0, 5).map((entry) => ({
        id: stableId([source.id, entry.url]),
        name: source.name,
        sourceGroup: source.sourceGroup,
        sourceType: 'blog',
        builderOrOrg: source.builderOrOrg,
        regionTags: source.regionTags || [],
        ...entry,
      }));
    }

    if (source.sourceType === 'html-index') {
      const html = await fetchArticle(source.indexUrl);
      const urls = parseHtmlIndex(html, source);
      const articles = [];

      for (const url of urls) {
        try {
          const articleHtml = await fetchArticle(url);
          const metadata = extractArticleMetadata(articleHtml, url);
          articles.push({
            id: stableId([source.id, url]),
            name: source.name,
            sourceGroup: source.sourceGroup,
            sourceType: 'blog',
            builderOrOrg: source.builderOrOrg,
            regionTags: source.regionTags || [],
            url,
            ...metadata,
          });
        } catch {
          // Skip individual article failures; keep the rest of the source usable.
        }
      }

      return articles;
    }
  } catch (error) {
    return [{
      id: stableId([source.id, 'error']),
      name: source.name,
      sourceGroup: source.sourceGroup,
      sourceType: 'meta',
      builderOrOrg: source.builderOrOrg,
      regionTags: source.regionTags || [],
      url: source.homepageUrl,
      title: `${source.name} fetch failed`,
      summary: `Source fetch failed during this run: ${error.message}`,
      content: `Source fetch failed during this run: ${error.message}`,
      publishedAt: null,
    }];
  }

  return [];
}

async function main() {
  const manifests = await Promise.all([
    loadSourceManifest('sources-official.json'),
    loadSourceManifest('sources-editorial.json'),
    loadSourceManifest('sources-china.json'),
  ]);

  const sources = manifests.flat();
  const articleGroups = await Promise.all(sources.map((source) => fetchSource(source)));

  for (let i = 0; i < sources.length; i++) {
    const count = articleGroups[i].filter((a) => a.sourceType !== 'meta').length;
    const errors = articleGroups[i].filter((a) => a.sourceType === 'meta').length;
    if (errors > 0) {
      console.error(`  [WARN] ${sources[i].name}: fetch failed`);
    } else {
      console.error(`  [OK]   ${sources[i].name}: ${count} articles`);
    }
  }

  const articles = articleGroups.flat()
    .filter((article) => article.url && article.sourceType !== 'meta')
    .slice(0, 80);

  const payload = {
    generatedAt: new Date().toISOString(),
    articles,
    stats: {
      articles: articles.length,
      chinaArticles: articles.filter((article) => (article.regionTags || []).includes('china-models')).length,
    }
  };

  await writeJson(join(ROOT_DIR, 'feed-external.json'), payload);

  console.log(JSON.stringify({
    status: 'ok',
    articles: payload.stats.articles,
    chinaArticles: payload.stats.chinaArticles,
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: 'error',
    message: error.message,
  }));
  process.exit(1);
});
