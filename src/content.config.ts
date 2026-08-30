import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// "blog" collection: Markdown files under src/content/blog/.
// - loader: where the entries come from (glob = match files on disk).
//   This is the layer that later gets swapped for microCMS.
// - schema: the shape each file's frontmatter must have (like a SQL table
//   definition). A mismatch fails the build instead of breaking at runtime.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(), // accepts "2026-08-20" in frontmatter -> Date object
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
