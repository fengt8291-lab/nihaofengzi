import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import {
  WORK_CATEGORY_IDS,
  WORK_COVER_VARIANTS,
  WORK_DETAIL_MODES,
  WORK_VISIBILITIES,
} from '@/data/work';

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        type: z.string().min(1),
        summary: z.string().min(1),
        category: z.enum(WORK_CATEGORY_IDS),
        visibility: z.enum(WORK_VISIBILITIES),
        featured: z.boolean().default(false),
        featuredOrder: z.number().int().positive().optional(),
        detailMode: z.enum(WORK_DETAIL_MODES),
        status: z.string().min(1),
        year: z.number().int().optional(),
        period: z.string().min(1).optional(),
        order: z.number().int().nonnegative().default(999),
        role: z.string().min(1).optional(),
        coverImage: image().optional(),
        coverAlt: z.string().min(1).optional(),
        coverVariant: z.enum(WORK_COVER_VARIANTS).optional(),
        topics: z.array(z.string().min(1)).default([]),
        externalUrl: z.url().optional(),
        repositoryUrl: z.url().optional(),
        reportUrl: z.url().optional(),
        relatedSlugs: z.array(z.string().min(1)).default([]),
      })
      .superRefine((data, context) => {
        if (data.featured && data.visibility !== 'public') {
          context.addIssue({
            code: 'custom',
            path: ['featured'],
            message: 'Featured work must be public.',
          });
        }

        if (data.featured && data.featuredOrder === undefined) {
          context.addIssue({
            code: 'custom',
            path: ['featuredOrder'],
            message: 'Featured work requires featuredOrder.',
          });
        }

        if (!data.featured && data.featuredOrder !== undefined) {
          context.addIssue({
            code: 'custom',
            path: ['featuredOrder'],
            message: 'Non-featured work must not define featuredOrder.',
          });
        }

        if (data.featured && !data.role) {
          context.addIssue({
            code: 'custom',
            path: ['role'],
            message: 'Featured work requires a role.',
          });
        }

        if (
          (data.detailMode === 'hybrid' || data.detailMode === 'external') &&
          !data.externalUrl
        ) {
          context.addIssue({
            code: 'custom',
            path: ['externalUrl'],
            message: `${data.detailMode} work requires externalUrl.`,
          });
        }

        if (data.coverImage && !data.coverAlt) {
          context.addIssue({
            code: 'custom',
            path: ['coverAlt'],
            message: 'coverImage requires coverAlt.',
          });
        }

        if (data.coverAlt && !data.coverImage) {
          context.addIssue({
            code: 'custom',
            path: ['coverAlt'],
            message: 'coverAlt must only be used with coverImage.',
          });
        }

        if (data.detailMode === 'hidden' && data.visibility !== 'hidden') {
          context.addIssue({
            code: 'custom',
            path: ['detailMode'],
            message: 'hidden detailMode requires hidden visibility.',
          });
        }
      }),
});

export const collections = { work };
