import { siteConfig } from '../../../lib/site-config';

export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI search bot access',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    '# Opt out of training crawls (keep search bots allowed)',
    'User-agent: CCBot',
    'Disallow: /',
    '',
    `Sitemap: ${siteConfig.siteUrl}/sitemap.xml`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
