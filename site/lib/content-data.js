import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

async function readJsonIfExists(filepath, fallback) {
  if (!existsSync(filepath)) return fallback;

  try {
    return JSON.parse(await readFile(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

export async function getLatestStructuredItems() {
  const index = await readJsonIfExists(join(DATA_DIR, 'item-index.json'), null);
  if (!index?.latestDate) return null;
  return readJsonIfExists(join(DATA_DIR, 'items', `${index.latestDate}.json`), null);
}

export async function getStructuredItems(date) {
  return readJsonIfExists(join(DATA_DIR, 'items', `${date}.json`), null);
}

export async function getTopicIndex() {
  return readJsonIfExists(join(DATA_DIR, 'topics', 'index.json'), []);
}

export async function getTopicItems(slug) {
  return readJsonIfExists(join(DATA_DIR, 'topics', `${slug}.json`), null);
}
