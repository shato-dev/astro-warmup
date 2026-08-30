// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Public URL of the deployed site. Used for absolute URLs (sitemap, RSS, etc).
  site: 'https://shato-dev.github.io',
  // The site is served from a subpath on GitHub Pages, not the domain root.
  // Astro prefixes its own asset URLs with this; hand-written links go through
  // the href() helper in src/lib/posts.ts.
  base: '/astro-warmup',
});
