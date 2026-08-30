import { getCollection } from 'astro:content';

// Shared helper: all non-draft posts, newest first.
// Used by the index page, tag pages, and the search endpoint, so the
// "hide drafts + sort" rule lives in one place.
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// "2026-08-25" style string for <time> elements.
export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Prefix an absolute site path with the configured base path so links keep
// working when the site is served from a subpath (GitHub Pages puts it under
// /astro-warmup). BASE_URL is "/" in dev and "/astro-warmup" once `base` is
// set in astro.config.mjs (no trailing slash); Astro does not rewrite
// hand-written hrefs, so every internal link goes through here.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // "" in dev, "/astro-warmup" on Pages

export function href(path: string) {
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${rel}`;
}
