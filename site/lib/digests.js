import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data', 'digests');
const INDEX_PATH = join(DATA_DIR, 'index.json');

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function normalizeLinkUrl(candidate) {
  try {
    const url = new URL(candidate);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function parseInline(text) {
  const tokens = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = remaining.match(/\[([^\]]+)\]\(((?:[^()]|\([^)]*\))+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|(https?:\/\/[^\s]+)/);

    if (!match || match.index === undefined) {
      tokens.push({ type: 'text', value: remaining });
      break;
    }

    if (match.index > 0) {
      tokens.push({ type: 'text', value: remaining.slice(0, match.index) });
    }

    if (match[1] && match[2]) {
      const safeUrl = normalizeLinkUrl(match[2]);
      if (safeUrl) {
        tokens.push({ type: 'link', text: match[1], url: safeUrl });
      } else {
        tokens.push({ type: 'text', value: match[0] });
      }
    } else if (match[3]) {
      tokens.push({ type: 'strong', children: parseInline(match[3]) });
    } else if (match[4]) {
      tokens.push({ type: 'emphasis', children: parseInline(match[4]) });
    } else if (match[5]) {
      const safeUrl = normalizeLinkUrl(match[5]);
      if (safeUrl) {
        tokens.push({ type: 'link', text: match[5], url: safeUrl });
      } else {
        tokens.push({ type: 'text', value: match[5] });
      }
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return tokens;
}

export function parseDigestMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: parseInline(headingMatch[2].trim()),
      });
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].startsWith('- ')) {
        items.push(parseInline(lines[index].slice(2).trim()));
        index += 1;
      }

      blocks.push({ type: 'list', items });
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const candidate = lines[index];
      const candidateTrimmed = candidate.trim();

      if (
        candidateTrimmed.length === 0 ||
        candidate.startsWith('- ') ||
        /^(#{1,3})\s+(.+)$/.test(candidate) ||
        /^---+$/.test(candidateTrimmed)
      ) {
        break;
      }

      // Detect "Why it matters:" lines and emit as a separate blockquote block
      if (/^>?\s*\**Why it matters:?\**:?\s*/i.test(candidateTrimmed)) {
        // Flush any accumulated paragraph lines first
        if (paragraphLines.length > 0) {
          blocks.push({
            type: 'paragraph',
            lines: paragraphLines.map((paragraphLine) => parseInline(paragraphLine)),
          });
          paragraphLines.length = 0;
        }

        const whyText = candidateTrimmed.replace(/^>?\s*\**Why it matters:?\**:?\s*/i, '');
        blocks.push({
          type: 'blockquote',
          label: 'Why it matters:',
          content: parseInline(whyText),
        });
        index += 1;
        continue;
      }

      paragraphLines.push(candidateTrimmed);
      index += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        lines: paragraphLines.map((paragraphLine) => parseInline(paragraphLine)),
      });
    }
  }

  return blocks;
}

export function renderDigestPreview(markdown, maxLength = 220) {
  return escapeHtml(markdown.replace(/\s+/g, ' ').trim().slice(0, maxLength));
}

export async function getDigestIndex() {
  if (!existsSync(INDEX_PATH)) return [];

  try {
    return JSON.parse(await readFile(INDEX_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

export async function getDigest(date) {
  const filepath = join(DATA_DIR, `${date}.md`);
  if (!existsSync(filepath)) return null;

  const content = await readFile(filepath, 'utf-8');
  return { date, content };
}

export async function getLatestDigest() {
  const index = await getDigestIndex();
  if (index.length === 0) return null;
  return getDigest(index[0].date);
}
