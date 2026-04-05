#!/usr/bin/env node

// ============================================================================
// Follow Builders — Save History
// ============================================================================
// Saves a digest to the history/ directory as a dated markdown file.
// Also maintains history/index.json for the website to read.
//
// Usage:
//   echo "digest text" | node save-history.js
//   node save-history.js --file /path/to/digest.md
//   node save-history.js --message "digest text"
//
// Output: history/YYYY-MM-DD.md
// ============================================================================

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const HISTORY_DIR = join(SCRIPT_DIR, '..', 'history');
const INDEX_PATH = join(HISTORY_DIR, 'index.json');
const SITE_DIGESTS_DIR = join(SCRIPT_DIR, '..', 'site', 'data', 'digests');
const SITE_DIGEST_INDEX_PATH = join(SCRIPT_DIR, '..', 'site', 'data', 'digests', 'index.json');

// -- Read input --------------------------------------------------------------

async function getDigestText() {
  const args = process.argv.slice(2);

  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  // Read from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// -- Extract title from digest -----------------------------------------------

function extractTitle(text) {
  // Try to find the "AI Builders Digest — <date>" line
  const match = text.match(/^#?\s*AI Builders Digest\s*[—–-]\s*(.+)$/m);
  if (match) return match[1].trim();

  // Fallback: first non-empty line
  const firstLine = text.split('\n').find(l => l.trim().length > 0);
  return firstLine ? firstLine.replace(/^#+\s*/, '').trim() : 'AI Builders Digest';
}

// -- Main --------------------------------------------------------------------

async function main() {
  await mkdir(HISTORY_DIR, { recursive: true });
  await mkdir(SITE_DIGESTS_DIR, { recursive: true });

  const digestText = await getDigestText();
  if (!digestText || digestText.trim().length === 0) {
    console.error('No digest text provided');
    process.exit(1);
  }

  // Use today's date or --date flag
  const args = process.argv.slice(2);
  const dateIdx = args.indexOf('--date');
  const dateStr = (dateIdx !== -1 && args[dateIdx + 1])
    ? args[dateIdx + 1]
    : new Date().toISOString().split('T')[0];

  const filename = `${dateStr}.md`;
  const filepath = join(HISTORY_DIR, filename);

  // Save the digest
  await writeFile(filepath, digestText);
  await writeFile(join(SITE_DIGESTS_DIR, filename), digestText);
  console.error(`Saved: history/${filename} (${digestText.length} chars)`);

  // Update the index
  let index = [];
  if (existsSync(INDEX_PATH)) {
    try {
      index = JSON.parse(await readFile(INDEX_PATH, 'utf-8'));
    } catch {
      index = [];
    }
  }

  // Remove existing entry for this date (in case of re-run)
  index = index.filter(e => e.date !== dateStr);

  // Add new entry
  index.unshift({
    date: dateStr,
    title: extractTitle(digestText),
    file: filename,
    chars: digestText.length,
    savedAt: new Date().toISOString()
  });

  // Sort newest first
  index.sort((a, b) => b.date.localeCompare(a.date));

  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
  await writeFile(SITE_DIGEST_INDEX_PATH, JSON.stringify(index, null, 2));
  console.error(`Updated history/index.json (${index.length} entries)`);

  console.log(JSON.stringify({ status: 'ok', file: filename, date: dateStr }));
}

main().catch(err => {
  console.error('Save history failed:', err.message);
  process.exit(1);
});
