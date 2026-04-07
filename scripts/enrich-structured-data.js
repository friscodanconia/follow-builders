#!/usr/bin/env node

// Enriches structured item data with editorial "Why it matters" lines
// from the digest markdown. Run after generate-digest and save-history.

import { readFile, writeFile } from 'fs/promises';
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

async function main() {
  const args = process.argv.slice(2);
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

  // Find today's structured data
  const today = new Date().toISOString().split('T')[0];
  const paths = [
    join(ROOT_DIR, 'history', 'items', `${today}.json`),
    join(ROOT_DIR, 'site', 'data', 'items', `${today}.json`),
  ];

  let enriched = 0;

  for (const filepath of paths) {
    if (!existsSync(filepath)) continue;

    const data = JSON.parse(await readFile(filepath, 'utf-8'));

    for (const item of data.selectedItems || []) {
      const editorial = whyByUrl.get(item.url);
      if (editorial) {
        item.whyThisMatters = editorial;
        enriched++;
      }
    }

    await writeFile(filepath, JSON.stringify(data, null, 2));
  }

  console.log(JSON.stringify({ status: 'ok', enriched, whyBlocks: whyBlocks.length }));
}

main().catch((err) => {
  console.error('Enrich failed:', err.message);
  process.exit(1);
});
