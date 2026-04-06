import Link from 'next/link';
import { withSitePrefix } from '../lib/site-config';

export function AppLink({ href, ...props }) {
  const resolvedHref = typeof href === 'string' && href.startsWith('/')
    ? withSitePrefix(href)
    : href;

  return <Link href={resolvedHref} {...props} />;
}
