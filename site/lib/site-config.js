function normalizeOptionalUrl(value) {
  if (!value) return null;

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function deriveSitePathPrefix(siteUrl) {
  if (!siteUrl) return '';

  try {
    const pathname = new URL(siteUrl).pathname.replace(/\/$/, '');
    return pathname === '/' ? '' : pathname;
  } catch {
    return '';
  }
}

export const siteConfig = {
  projectName: 'AI Builders Digest',
  tagline: 'Follow builders, not influencers.',
  repoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_REPO_URL) || 'https://github.com/friscodanconia/follow-builders',
  upstreamRepoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_UPSTREAM_REPO_URL) || 'https://github.com/zarazhangrui/follow-builders',
  siteUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SITE_URL) || 'https://www.soumyosinha.com/ai-updates',
  subscribeUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SUBSCRIBE_URL),
  newsletterProvider: process.env.FOLLOW_BUILDERS_NEWSLETTER_PROVIDER || 'Buttondown',
  subscribeCtaLabel: process.env.FOLLOW_BUILDERS_SUBSCRIBE_CTA_LABEL || 'Subscribe',
};

siteConfig.sitePathPrefix = deriveSitePathPrefix(siteConfig.siteUrl);

export function withSitePrefix(pathname = '/') {
  if (!pathname.startsWith('/')) return pathname;
  return `${siteConfig.sitePathPrefix}${pathname}` || '/';
}
