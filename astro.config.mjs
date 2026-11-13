import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical production origin. Used for canonical URLs, sitemap, OG tags and JSON-LD.
const site = process.env.SITE_URL || 'https://blocmfb.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // Pages marked noindex (placeholders still to be filled) stay out of the sitemap.
      filter: (page) => !['/404', '/leadership/'].some((p) => page.includes(p)),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  // Old blocmfb.com URLs. Configure real 301s at the host as well (see README).
  redirects: {
    '/faq': '/help/#faq',
    '/compliance': '/legal/',
    '/download-retail-app': '/personal/#download',
    '/waitlist': '/supply-chain-finance/',
  },
});
