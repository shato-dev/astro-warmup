import { getPublishedPosts, href } from '../lib/posts';

// Build-time endpoint. A file under src/pages/ ending in `.json.js` becomes
// a route that outputs a file instead of an HTML page: this one produces
// dist/search.json. That static file is the "search API" the browser fetches
// (no running server needed) — the shrunk-down stand-in for Meilisearch.
export async function GET() {
  const posts = await getPublishedPosts();

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    body: post.body ?? '', // raw Markdown text of the post
    url: href(`/posts/${post.id}`),
    tags: post.data.tags,
  }));

  return new Response(JSON.stringify(index));
}
