import type { APIRoute } from 'astro';
import { INDEXABLE, SITE_URL } from '../consts';

/**
 * Generated rather than kept in `public/`, so that the file cannot say one
 * thing while the pages say another (SPEC §6). Both read `INDEXABLE`.
 *
 * While the site is on the temporary Pages address this serves `Disallow: /`
 * and names no sitemap. Flipping `DOMAIN.live` in src/consts.ts opens it.
 */
export const GET: APIRoute = () => {
  const body = INDEXABLE
    ? `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`
    : `# Temporary address. The site is not open to search engines until
# fundkeep.app is attached — see the domain switch in src/consts.ts.
User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
