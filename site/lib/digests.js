import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// In Vercel builds, process.cwd() is the repo root (no rootDirectory set).
// Locally, cwd is site/, so we check both locations.
function findHistoryDir() {
  const candidates = [
    join(process.cwd(), 'history'),       // repo root (Vercel build)
    join(process.cwd(), '..', 'history'), // site/ dir (local dev)
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return candidates[0]; // fallback
}

const HISTORY_DIR = findHistoryDir();
const INDEX_PATH = join(HISTORY_DIR, 'index.json');

export async function getDigestIndex() {
  if (!existsSync(INDEX_PATH)) return [];
  try {
    const data = JSON.parse(await readFile(INDEX_PATH, 'utf-8'));
    return data;
  } catch {
    return [];
  }
}

export async function getDigest(date) {
  const filepath = join(HISTORY_DIR, `${date}.md`);
  if (!existsSync(filepath)) return null;
  const content = await readFile(filepath, 'utf-8');
  return { date, content };
}

export async function getLatestDigest() {
  const index = await getDigestIndex();
  if (index.length === 0) return null;
  return getDigest(index[0].date);
}

// Simple markdown to HTML (handles the digest format without heavy deps)
export function markdownToHtml(md) {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-medium mt-6 mb-2 text-gray-900 dark:text-gray-100">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-medium mt-8 mb-3 text-gray-900 dark:text-gray-100">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-medium mt-8 mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900 dark:text-gray-100 font-medium">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-600 dark:text-amber-400 underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
    // Bare URLs on their own line
    .replace(/^(https?:\/\/\S+)$/gm, '<a href="$1" class="text-amber-600 dark:text-amber-400 underline hover:no-underline text-xs break-all" target="_blank" rel="noopener">$1</a>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="my-6 border-gray-200 dark:border-gray-800" />')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*(?:<br \/>)?)+)/g, '<ul class="list-disc mb-4 space-y-1">$1</ul>');
  // Clean up <br> inside <ul>
  html = html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match) => match.replace(/<br \/>/g, ''));

  return `<p class="mb-4">${html}</p>`;
}
