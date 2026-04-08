import { getDigestIndex, getDigest, extractEditorialIntro } from '../../lib/digests';
import { siteConfig } from '../../lib/site-config';

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const index = await getDigestIndex();
  const items = [];

  for (const entry of index.slice(0, 20)) {
    const digest = await getDigest(entry.date);
    if (!digest) continue;

    const intro = extractEditorialIntro(digest.content);
    const pubDate = new Date(`${entry.date}T06:00:00Z`).toUTCString();
    const link = `${siteConfig.siteUrl}/digest/${entry.date}`;

    items.push(`    <item>
      <title>${escapeXml(`AI Builders Digest — ${entry.date}`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(intro || 'Daily AI digest')}</description>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.projectName)}</title>
    <link>${escapeXml(siteConfig.siteUrl)}</link>
    <description>A daily summary of what top AI builders are shipping. Simple, readable, no hype.</description>
    <language>en</language>
    <atom:link href="${escapeXml(siteConfig.siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
