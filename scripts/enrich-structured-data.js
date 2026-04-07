#!/usr/bin/env node

// Enriches structured item data with editorial "Why it matters" lines
// from the digest markdown. Can be run in two modes:
//   --file /tmp/digest.md       (pipeline mode: enrich today's data from a specific file)
//   --all                       (build mode: enrich all dates from their digest files)

import { readFile, writeFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..');

function extractWhyItMatters(markdown) {
  const results = [];
  const lines = markdown.split(/\r?\n/);
  let currentWhy = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const whyMatch = trimmed.match(/^>?\s*\**Why it matters:?\**:?\s*(.+)/i);
    if (whyMatch) {
      currentWhy = whyMatch[1].trim();
      continue;
    }
    const urlMatch = trimmed.match(/^(https?:\/\/[^\s]+)$/);
    if (urlMatch && currentWhy) {
      results.push({ url: urlMatch[1], whyItMatters: currentWhy });
      currentWhy = null;
    }
  }

  return results;
}

function enrichItems(data, whyByUrl) {
  let enriched = 0;
  for (const item of data.selectedItems || []) {
    const editorial = whyByUrl.get(item.url);
    if (editorial) {
      item.whyThisMatters = editorial;
      enriched++;
    }
  }
  return enriched;
}

async function enrichDate(date) {
  // Find digest markdown
  const digestPaths = [
    join(ROOT_DIR, 'site', 'data', 'digests', `${date}.md`),
    join(ROOT_DIR, 'history', `${date}.md`),
  ];

  let markdown = null;
  for (const p of digestPaths) {
    if (existsSync(p)) {
      markdown = await readFile(p, 'utf-8');
      break;
    }
  }

  if (!markdown) return 0;

  const whyBlocks = extractWhyItMatters(markdown);
  if (whyBlocks.length === 0) return 0;

  const whyByUrl = new Map(whyBlocks.map((b) => [b.url, b.whyItMatters]));

  let totalEnriched = 0;
  const itemPaths = [
    join(ROOT_DIR, 'history', 'items', `${date}.json`),
    join(ROOT_DIR, 'site', 'data', 'items', `${date}.json`),
  ];

  for (const filepath of itemPaths) {
    if (!existsSync(filepath)) continue;
    const data = JSON.parse(await readFile(filepath, 'utf-8'));
    const count = enrichItems(data, whyByUrl);
    if (count > 0) {
      await writeFile(filepath, JSON.stringify(data, null, 2));
      totalEnriched += count;
    }
  }

  return totalEnriched;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    // Build mode: enrich all dates
    const digestDir = join(ROOT_DIR, 'site', 'data', 'digests');
    if (!existsSync(digestDir)) {
      console.log(JSON.stringify({ status: 'skipped', reason: 'No digests directory' }));
      return;
    }

    const files = (await readdir(digestDir)).filter((f) => f.endsWith('.md'));
    let totalEnriched = 0;

    for (const file of files) {
      const date = file.replace('.md', '');
      totalEnriched += await enrichDate(date);
    }

    console.log(JSON.stringify({ status: 'ok', enriched: totalEnriched, dates: files.length }));
    return;
  }

  // Pipeline mode: enrich from a specific file
  const fileIdx = args.indexOf('--file');
  const digestFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

  if (!digestFile || !existsSync(digestFile)) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'No digest file' }));
    return;
  }

  const markdown = await readFile(digestFile, 'utf-8');
  const whyBlocks = extractWhyItMatters(markdown);

  if (whyBlocks.length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'No Why-it-matters found' }));
    return;
  }

  const whyByUrl = new Map(whyBlocks.map((b) => [b.url, b.whyItMatters]));
  const today = new Date().toISOString().split('T')[0];
  const paths = [
    join(ROOT_DIR, 'history', 'items', `${today}.json`),
    join(ROOT_DIR, 'site', 'data', 'items', `${today}.json`),
  ];

  let enriched = 0;
  for (const filepath of paths) {
    if (!existsSync(filepath)) continue;
    const data = JSON.parse(await readFile(filepath, 'utf-8'));
    enriched += enrichItems(data, whyByUrl);
    await writeFile(filepath, JSON.stringify(data, null, 2));
  }

  console.log(JSON.stringify({ status: 'ok', enriched, whyBlocks: whyBlocks.length }));
}

main().catch((err) => {
  console.error('Enrich failed:', err.message);
  process.exit(1);
});
