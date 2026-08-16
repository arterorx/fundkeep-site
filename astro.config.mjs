// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { hqGuards } from './src/build/hq-guards.ts';
import { INDEXABLE, SITE_URL } from './src/consts.ts';

// https://astro.build/config
export default defineConfig({
  // Both the address and whether we want to be found come from the one switch
  // in src/consts.ts (SPEC §6). Nothing else in the repository names a domain.
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit /privacy.html rather than /privacy/index.html so Cloudflare Pages
    // serves /privacy without a redirect. Apple's reviewer follows the exact
    // URL filed in App Store Connect, and a 301 there is a needless risk.
    format: 'file',
  },
  integrations: [
    // No sitemap while the address is temporary. A sitemap is an invitation,
    // and the whole point of SPEC §6 is not to send one yet.
    ...(INDEXABLE
      ? [sitemap({ filter: (page) => !page.endsWith('/404') })]
      : []),
    hqGuards(),
  ],
  prefetch: false,
});
