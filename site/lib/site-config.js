function normalizeOptionalUrl(value) {
  if (!value) return null;

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export const siteConfig = {
  projectName: 'AI Builders Digest',
  tagline: 'Follow builders, not influencers.',
  repoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_REPO_URL) || 'https://github.com/friscodanconia/follow-builders',
  upstreamRepoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_UPSTREAM_REPO_URL) || 'https://github.com/zarazhangrui/follow-builders',
  siteUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SITE_URL),
  subscribeUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SUBSCRIBE_URL),
  newsletterProvider: process.env.FOLLOW_BUILDERS_NEWSLETTER_PROVIDER || 'Buttondown',
  subscribeCtaLabel: process.env.FOLLOW_BUILDERS_SUBSCRIBE_CTA_LABEL || 'Subscribe',
};
