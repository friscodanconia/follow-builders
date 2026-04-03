import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// History dir: Vercel builds from repo root (cwd = repo root),
// local dev runs from site/ (cwd = site/).
function findHistoryDir() {
  const candidates = [
    join(process.cwd(), '..', 'history'), // local dev (cwd = site/)
    join(process.cwd(), 'history'),       // Vercel build (cwd = repo root)
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return candidates[0];
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
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium mt-6 mb-2 text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-medium mt-10 mb-3 text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-medium mt-10 mb-4 text-white">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-medium">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
    // Bare URLs not already inside an href or anchor tag
    .replace(/(?<!href="|">)(https?:\/\/[^\s<)]+)/g, '<a href="$1" class="text-amber-400 underline hover:no-underline break-all" target="_blank" rel="noopener">$1</a>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="my-8 border-gray-700" />')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-5">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*(?:<br \/>)?)+)/g, '<ul class="list-disc mb-5 space-y-1">$1</ul>');
  // Clean up <br> inside <ul>
  html = html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match) => match.replace(/<br \/>/g, ''));

  // Wrap in a div instead of <p> to avoid nesting issues and alignment problems
  return `<div>${html}</div>`;
}
