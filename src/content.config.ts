import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { NAVIGATION_IDS } from '@/data/navigation';
import {
  WORK_CATEGORY_IDS,
  WORK_COVER_VARIANTS,
  WORK_DETAIL_MODES,
  WORK_VISIBILITIES,
} from '@/data/work';
import { EXPERIENCE_CATEGORY_IDS } from '@/types/site';

const nonEmptyString = z.string().min(1);
const navigationId = z.enum(NAVIGATION_IDS);
const experienceCategory = z.enum(EXPERIENCE_CATEGORY_IDS);
const workCategoryId = z.enum(WORK_CATEGORY_IDS);

const actionSchema = z
  .object({
    label: nonEmptyString,
    href: nonEmptyString,
  })
  .strict();

const sectionHeadingSchema = z
  .object({
    eyebrow: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
  })
  .strict();

const seoSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
  })
  .strict();

const siteSchema = z
  .object({
    identity: z
      .object({
        name: z
          .object({
            chinese: nonEmptyString,
            english: nonEmptyString,
            username: nonEmptyString,
          })
          .strict(),
        brand: z
          .object({
            chinese: nonEmptyString,
            english: nonEmptyString,
          })
          .strict(),
        location: nonEmptyString,
        education: z
          .object({
            school: nonEmptyString,
            college: nonEmptyString,
            major: nonEmptyString,
            stage: nonEmptyString,
            period: nonEmptyString,
          })
          .strict(),
        summary: nonEmptyString,
        contact: z
          .object({
            email: z.email(),
            github: z
              .object({
                username: nonEmptyString,
                url: z.url(),
              })
              .strict(),
          })
          .strict(),
      })
      .strict(),
    global: z
      .object({
        url: z.url(),
        language: nonEmptyString,
        defaultTitle: nonEmptyString,
        defaultDescription: nonEmptyString,
        defaultOgImage: nonEmptyString,
        footer: z
          .object({
            description: nonEmptyString,
          })
          .strict(),
      })
      .strict(),
    navigation: z.array(
      z
        .object({
          id: navigationId,
          label: nonEmptyString,
          href: nonEmptyString,
        })
        .strict(),
    ),
    home: z
      .object({
        hero: z
          .object({
            eyebrow: z
              .object({
                chinese: nonEmptyString,
                english: nonEmptyString,
              })
              .strict(),
            title: nonEmptyString,
            supportingTitle: nonEmptyString,
            introduction: nonEmptyString,
            actions: z.array(actionSchema).length(2),
            visualHints: z.array(nonEmptyString).length(4),
          })
          .strict(),
        about: z
          .object({
            eyebrow: nonEmptyString,
            title: nonEmptyString,
            paragraphs: z.array(nonEmptyString).min(1),
            action: actionSchema,
          })
          .strict(),
        now: z
          .object({
            updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            items: z
              .array(
                z
                  .object({
                    label: nonEmptyString,
                    description: nonEmptyString,
                  })
                  .strict(),
              )
              .length(4),
          })
          .strict(),
        experienceIds: z.array(nonEmptyString).min(1),
        sections: z
          .object({
            now: sectionHeadingSchema,
            experience: sectionHeadingSchema.extend({ action: actionSchema }).strict(),
            work: sectionHeadingSchema.extend({ action: actionSchema }).strict(),
            contact: sectionHeadingSchema.extend({ resumeAction: actionSchema }).strict(),
          })
          .strict(),
      })
      .strict(),
    pages: z
      .object({
        about: z
          .object({
            seo: seoSchema,
            intro: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
              })
              .strict(),
            education: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
              })
              .strict(),
            why: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
              })
              .strict(),
            path: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
              })
              .strict(),
            current: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
              })
              .strict(),
            actions: z.array(actionSchema).length(3),
          })
          .strict(),
        experience: z
          .object({
            seo: seoSchema,
            intro: sectionHeadingSchema,
            groups: z.array(
              z
                .object({
                  category: experienceCategory,
                  eyebrow: nonEmptyString,
                  title: nonEmptyString,
                  description: nonEmptyString,
                })
                .strict(),
            ),
            footer: z
              .object({
                description: nonEmptyString,
                actions: z.array(actionSchema).length(2),
              })
              .strict(),
          })
          .strict(),
        resume: z
          .object({
            seo: seoSchema,
            intro: z
              .object({
                eyebrow: nonEmptyString,
              })
              .strict(),
            sections: z
              .object({
                education: nonEmptyString,
                experience: nonEmptyString,
                work: nonEmptyString,
                capabilities: nonEmptyString,
              })
              .strict(),
            contact: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
                emailActionLabel: nonEmptyString,
                githubActionLabel: nonEmptyString,
              })
              .strict(),
          })
          .strict(),
        work: z
          .object({
            seo: seoSchema,
            intro: z
              .object({
                eyebrow: nonEmptyString,
                title: nonEmptyString,
                paragraphs: z.array(nonEmptyString).length(2),
              })
              .strict(),
            categories: z.array(
              z
                .object({
                  id: workCategoryId,
                  label: nonEmptyString,
                  description: nonEmptyString,
                })
                .strict(),
            ),
          })
          .strict(),
      })
      .strict(),
    profile: z
      .object({
        about: z
          .object({
            introduction: z.array(nonEmptyString).min(1),
            focus: z.array(nonEmptyString).min(1),
            turningPoints: z.array(
              z
                .object({
                  title: nonEmptyString,
                  period: nonEmptyString.optional(),
                  description: nonEmptyString,
                })
                .strict(),
            ),
            current: z.array(nonEmptyString).min(1),
          })
          .strict(),
        experiences: z.array(
          z
            .object({
              id: nonEmptyString,
              category: experienceCategory,
              title: nonEmptyString,
              organization: nonEmptyString.optional(),
              role: nonEmptyString,
              period: nonEmptyString,
              summary: nonEmptyString,
              responsibilities: z.array(nonEmptyString).min(1),
              featured: z.boolean(),
              resume: z.boolean(),
              boundary: nonEmptyString.optional(),
            })
            .strict(),
        ),
        capabilities: z.array(
          z
            .object({
              title: nonEmptyString,
              description: nonEmptyString,
              evidence: z.array(nonEmptyString).min(1),
            })
            .strict(),
        ),
      })
      .strict(),
  })
  .strict()
  .superRefine((data, context) => {
    const experienceIds = data.profile.experiences.map((entry) => entry.id);
    const duplicateExperienceIds = experienceIds.filter(
      (id, index, ids) => ids.indexOf(id) !== index,
    );

    if (duplicateExperienceIds.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['profile', 'experiences'],
        message: `Experience IDs must be unique: ${[...new Set(duplicateExperienceIds)].join(', ')}`,
      });
    }

    data.home.experienceIds.forEach((id, index) => {
      if (!experienceIds.includes(id)) {
        context.addIssue({
          code: 'custom',
          path: ['home', 'experienceIds', index],
          message: `Unknown experience ID: ${id}`,
        });
      }
    });

    if (new Set(data.home.experienceIds).size !== data.home.experienceIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['home', 'experienceIds'],
        message: 'Home experience IDs must be unique.',
      });
    }

    const validateExactIds = (
      actualIds: readonly string[],
      expectedIds: readonly string[],
      path: (string | number)[],
      label: string,
    ) => {
      const uniqueIds = new Set(actualIds);
      const missing = expectedIds.filter((id) => !uniqueIds.has(id));
      const duplicates = actualIds.filter((id, index, ids) => ids.indexOf(id) !== index);

      if (
        actualIds.length !== expectedIds.length ||
        missing.length > 0 ||
        duplicates.length > 0
      ) {
        context.addIssue({
          code: 'custom',
          path,
          message: `${label} IDs must exactly match: ${expectedIds.join(', ')}`,
        });
      }
    };

    validateExactIds(
      data.navigation.map((item) => item.id),
      NAVIGATION_IDS,
      ['navigation'],
      'Navigation',
    );
    validateExactIds(
      data.pages.experience.groups.map((group) => group.category),
      EXPERIENCE_CATEGORY_IDS,
      ['pages', 'experience', 'groups'],
      'Experience category',
    );
    validateExactIds(
      data.pages.work.categories.map((category) => category.id),
      WORK_CATEGORY_IDS,
      ['pages', 'work', 'categories'],
      'Work category',
    );
  });

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
        cardStatus: z.string().min(1).optional(),
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
        if (data.visibility === 'public' && !data.cardStatus) {
          context.addIssue({
            code: 'custom',
            path: ['cardStatus'],
            message: 'Public work requires cardStatus.',
          });
        }

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

const site = defineCollection({
  loader: file('./src/content/site.yaml'),
  schema: siteSchema,
});

export const collections = { site, work };
