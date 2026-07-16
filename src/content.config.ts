import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      summary: z.string(),
      category: z.string(),
      status: z.string(),
      year: z.number().int().optional(),
      order: z.number().int().nonnegative().default(999),
      featured: z.boolean().default(false),
      role: z.string(),
      cover: image().optional(),
      topics: z.array(z.string()).default([]),
      externalUrl: z.url().optional(),
      repositoryUrl: z.url().optional(),
      draft: z.boolean().default(true),
    }),
});

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    type: z.string(),
    status: z.string(),
    date: z.coerce.date(),
    topics: z.array(z.string()).default([]),
    collaborators: z.array(z.string()).optional(),
    publicationUrl: z.url().optional(),
    attachment: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      draft: z.boolean().default(true),
    }),
});

export const collections = { projects, research, blog };
