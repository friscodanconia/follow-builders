import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

export async function readJson(filepath, fallback = null) {
  if (!existsSync(filepath)) return fallback;
  try {
    return JSON.parse(await readFile(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(filepath, data) {
  await mkdir(filepath.replace(/\/[^/]+$/, ''), { recursive: true });
  await writeFile(filepath, `${JSON.stringify(data, null, 2)}\n`);
}

export function stableId(parts) {
  return createHash('sha1').update(parts.filter(Boolean).join('::')).digest('hex').slice(0, 16);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(value, maxLength = 320) {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
