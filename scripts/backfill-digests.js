#!/usr/bin/env node

// Backfill old digests with the current prompt template.
// Usage: node scripts/backfill-digests.js
// Requires: ANTHROPIC_API_KEY

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..');
const HISTORY_DIR = join(ROOT_DIR, 'history');
const ITEMS_DIR = join(HISTORY_DIR, 'items');

async function main() {
  const indexPath = join(HISTORY_DIR, 'item-index.json');
  if (!existsSync(indexPath)) {
    console.error('No item-index.json found');
    process.exit(1);
  }

  const index = JSON.parse(await readFile(indexPath, 'utf-8'));
  const dates = index.dates || [];

  console.error(`Found ${dates.length} dates to backfill: ${dates.join(', ')}`);

  for (const date of dates) {
    const itemsPath = join(ITEMS_DIR, `${date}.json`);
    if (!existsSync(itemsPath)) {
      console.error(`Skipping ${date} — no structured items`);
      continue;
    }

    console.error(`\n--- Regenerating ${date} ---`);

    try {
      // Generate digest
      const digest = execFileSync('node', [join(SCRIPT_DIR, 'generate-digest.js'), `--date=${date}`], {
        env: process.env,
        timeout: 90000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      if (!digest.trim()) {
        console.error(`Empty digest for ${date}, skipping`);
        continue;
      }

      // Write directly to history files
      const historyPath = join(HISTORY_DIR, `${date}.md`);
      const siteDigestPath = join(ROOT_DIR, 'site', 'data', 'digests', `${date}.md`);

      await writeFile(historyPath, digest, 'utf-8');
      await writeFile(siteDigestPath, digest, 'utf-8');

      console.error(`Saved ${date} (${digest.length} chars)`);
    } catch (err) {
      console.error(`Failed ${date}: ${err.message}`);
    }
  }

  console.error('\nBackfill complete');
}

main().catch((err) => {
  console.error('Backfill failed:', err.message);
  process.exit(1);
});
