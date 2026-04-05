function normalizeOptionalUrl(value) {
  if (!value) return null;

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.toString().endsWith('/') ? url.toString() : `${url.toString()}/`;
  } catch {
    return null;
  }
}

export const runtimeConfig = {
  projectName: 'AI Builders Digest',
  tagline: 'Follow builders, not influencers.',
  repoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_REPO_URL) || 'https://github.com/friscodanconia/follow-builders',
  repoRawBaseUrl: normalizeBaseUrl(process.env.FOLLOW_BUILDERS_REPO_RAW_BASE_URL) || 'https://raw.githubusercontent.com/friscodanconia/follow-builders/main/',
  upstreamRepoUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_UPSTREAM_REPO_URL) || 'https://github.com/zarazhangrui/follow-builders',
  upstreamRawBaseUrl: normalizeBaseUrl(process.env.FOLLOW_BUILDERS_UPSTREAM_RAW_BASE_URL) || 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/',
  siteUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SITE_URL),
  subscribeUrl: normalizeOptionalUrl(process.env.FOLLOW_BUILDERS_SUBSCRIBE_URL),
  newsletterProvider: process.env.FOLLOW_BUILDERS_NEWSLETTER_PROVIDER || 'Buttondown',
  subscribeCtaLabel: process.env.FOLLOW_BUILDERS_SUBSCRIBE_CTA_LABEL || 'Subscribe',
  supportEmailFrom: process.env.FOLLOW_BUILDERS_EMAIL_FROM || 'AI Builders Digest <digest@resend.dev>',
};

export function upstreamAssetUrl(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), runtimeConfig.upstreamRawBaseUrl).toString();
}

export function repoAssetUrl(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), runtimeConfig.repoRawBaseUrl).toString();
}
