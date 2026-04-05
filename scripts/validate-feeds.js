#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { assertValidFeed } from './lib/feed-validation.js';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);

async function readJson(filename) {
  const filepath = join(SCRIPT_DIR, '..', filename);
  if (!existsSync(filepath)) {
    throw new Error(`Missing required file: ${filename}`);
  }

  return JSON.parse(await readFile(filepath, 'utf-8'));
}

async function main() {
  const feeds = [
    ['x', 'feed-x.json'],
    ['podcasts', 'feed-podcasts.json'],
    ['blogs', 'feed-blogs.json'],
    ['external', 'feed-external.json'],
  ];

  for (const [kind, filename] of feeds) {
    const data = await readJson(filename);
    assertValidFeed(kind, data);
  }

  console.log(JSON.stringify({
    status: 'ok',
    validated: feeds.map(([, filename]) => filename),
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: 'error',
    message: error.message,
  }));
  process.exit(1);
});
