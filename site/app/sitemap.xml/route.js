import { getDigestIndex } from '../../lib/digests';
import { getBuilderIndex } from '../../lib/content-data';
import { siteConfig } from '../../lib/site-config';

function escapeXml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [digestIndex, builderIndex] = await Promise.all([
    getDigestIndex(),
    getBuilderIndex(),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/archive', priority: '0.9', changefreq: 'daily' },
    { url: '/builders', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/subscribe', priority: '0.5', changefreq: 'monthly' },
  ];

  const urls = [
    ...staticPages.map((p) => ({
      url: p.url,
      lastmod: today,
      priority: p.priority,
      changefreq: p.changefreq,
    })),
    ...digestIndex.map((entry) => ({
      url: `/digest/${entry.date}`,
      lastmod: entry.date,
      priority: '0.9',
      changefreq: 'monthly',
    })),
    ...builderIndex.map((b) => ({
      url: `/builder/${b.handle}`,
      lastmod: b.latestDate || today,
      priority: '0.7',
      changefreq: 'weekly',
    })),
    ...[
      { slug: 'agents', latestDate: '2026-04-13' },
      { slug: 'coding', latestDate: '2026-04-13' },
      { slug: 'research', latestDate: '2026-04-13' },
      { slug: 'benchmarks', latestDate: '2026-04-13' },
      { slug: 'china-models', latestDate: '2026-04-13' },
      { slug: 'computer-use', latestDate: '2026-04-13' },
      { slug: 'enterprise', latestDate: '2026-04-13' },
      { slug: 'fine-tuning', latestDate: '2026-04-13' },
      { slug: 'inference', latestDate: '2026-04-13' },
      { slug: 'multimodal', latestDate: '2026-04-13' },
      { slug: 'open-source', latestDate: '2026-04-13' },
      { slug: 'reasoning', latestDate: '2026-04-13' },
      { slug: 'safety', latestDate: '2026-04-13' },
      { slug: 'tool-use', latestDate: '2026-04-13' },
      { slug: 'voice', latestDate: '2026-04-13' },
    ].map((t) => ({
      url: `/topic/${t.slug}`,
      lastmod: t.latestDate,
      priority: '0.6',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(`${siteConfig.siteUrl}${u.url}`)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
