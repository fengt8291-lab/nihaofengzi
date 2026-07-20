import { getCollection, type CollectionEntry } from 'astro:content';

import {
  EXPECTED_FEATURED_WORK_IDS,
  getWorkCategoryOrder,
} from '@/data/work';

export type WorkEntry = CollectionEntry<'work'>;

let validatedCatalogPromise: Promise<readonly WorkEntry[]> | undefined;

const compareByCatalogOrder = (a: WorkEntry, b: WorkEntry) => {
  const categoryDifference =
    getWorkCategoryOrder(a.data.category) - getWorkCategoryOrder(b.data.category);

  if (categoryDifference !== 0) return categoryDifference;
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;

  return a.data.title.localeCompare(b.data.title, 'zh-CN');
};

const compareByFeaturedOrder = (a: WorkEntry, b: WorkEntry) =>
  (a.data.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
  (b.data.featuredOrder ?? Number.MAX_SAFE_INTEGER);

const validateCatalog = (entries: readonly WorkEntry[]) => {
  const duplicateIds = entries
    .map((entry) => entry.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    throw new Error(`Duplicate work IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  }

  const featured = entries
    .filter((entry) => entry.data.visibility === 'public' && entry.data.featured)
    .sort(compareByFeaturedOrder);

  if (featured.length !== EXPECTED_FEATURED_WORK_IDS.length) {
    throw new Error(
      `Expected ${EXPECTED_FEATURED_WORK_IDS.length} featured work entries, found ${featured.length}.`,
    );
  }

  const featuredOrders = featured.map((entry) => entry.data.featuredOrder);
  const uniqueFeaturedOrders = new Set(featuredOrders);

  if (uniqueFeaturedOrders.size !== featuredOrders.length) {
    throw new Error('featuredOrder values must be unique.');
  }

  const featuredIds = featured.map((entry) => entry.id);
  const expectedIds = [...EXPECTED_FEATURED_WORK_IDS];

  if (featuredIds.some((id, index) => id !== expectedIds[index])) {
    throw new Error(
      `Featured work order must be ${expectedIds.join(' → ')}, found ${featuredIds.join(' → ')}.`,
    );
  }
};

export const getValidatedWorkCatalog = async (): Promise<readonly WorkEntry[]> => {
  validatedCatalogPromise ??= getCollection('work').then((entries) => {
    validateCatalog(entries);
    return Object.freeze([...entries]);
  });

  return validatedCatalogPromise;
};

export const getPublicWork = async (): Promise<WorkEntry[]> =>
  (await getValidatedWorkCatalog())
    .filter((entry) => entry.data.visibility === 'public')
    .sort(compareByCatalogOrder);

export const getFeaturedWork = async (): Promise<WorkEntry[]> =>
  (await getValidatedWorkCatalog())
    .filter((entry) => entry.data.visibility === 'public' && entry.data.featured)
    .sort(compareByFeaturedOrder);

export const getDetailWork = async (): Promise<WorkEntry[]> =>
  (await getValidatedWorkCatalog())
    .filter(
      (entry) =>
        entry.data.visibility === 'public' &&
        (entry.data.detailMode === 'internal' || entry.data.detailMode === 'hybrid'),
    )
    .sort(compareByCatalogOrder);

export const getArchivedWork = async (): Promise<WorkEntry[]> =>
  (await getValidatedWorkCatalog())
    .filter(
      (entry) => entry.data.visibility === 'public' && entry.data.detailMode === 'archive',
    )
    .sort(compareByCatalogOrder);

export const getWorkHref = (entry: WorkEntry): string | undefined => {
  if (entry.data.detailMode === 'internal' || entry.data.detailMode === 'hybrid') {
    return `/work/${entry.id}/`;
  }

  if (entry.data.detailMode === 'external') return entry.data.externalUrl;

  return undefined;
};
