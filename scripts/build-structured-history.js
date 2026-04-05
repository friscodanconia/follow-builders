#!/usr/bin/env node

import { join } from 'path';
import { readJson } from './lib/fs-utils.js';
import { buildStructuredDataset, saveStructuredDataset } from './lib/content-pipeline.js';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..');

async function main() {
  const args = process.argv.slice(2);
  const dateIdx = args.indexOf('--date');
  const digestDate = (dateIdx !== -1 && args[dateIdx + 1])
    ? args[dateIdx + 1]
    : new Date().toISOString().split('T')[0];

  const [feedX, feedPodcasts, feedBlogs, externalFeed] = await Promise.all([
    readJson(join(ROOT_DIR, 'feed-x.json'), { x: [] }),
    readJson(join(ROOT_DIR, 'feed-podcasts.json'), { podcasts: [] }),
    readJson(join(ROOT_DIR, 'feed-blogs.json'), { blogs: [] }),
    readJson(join(ROOT_DIR, 'feed-external.json'), { articles: [] }),
  ]);

  const dataset = await buildStructuredDataset({
    digestDate,
    feedX,
    feedPodcasts,
    feedBlogs,
    externalFeed,
  });

  await saveStructuredDataset(dataset);

  console.log(JSON.stringify({
    status: 'ok',
    date: digestDate,
    totalItems: dataset.stats.totalItems,
    selectedItems: dataset.stats.selectedItems,
    chinaItems: dataset.stats.chinaItems,
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: 'error',
    message: error.message,
  }));
  process.exit(1);
});
