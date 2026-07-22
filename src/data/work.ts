export const WORK_CATEGORY_IDS = [
  'product-digital',
  'research-content',
  'learning-tools',
  'creative-life',
] as const;

export type WorkCategoryId = (typeof WORK_CATEGORY_IDS)[number];

export const WORK_VISIBILITIES = ['public', 'draft', 'hidden'] as const;
export type WorkVisibility = (typeof WORK_VISIBILITIES)[number];

export const WORK_DETAIL_MODES = [
  'internal',
  'hybrid',
  'external',
  'archive',
  'hidden',
] as const;
export type WorkDetailMode = (typeof WORK_DETAIL_MODES)[number];

export const WORK_COVER_VARIANTS = [
  'task-path',
  'shore-line',
  'recovery-rhythm',
] as const;
export type WorkCoverVariant = (typeof WORK_COVER_VARIANTS)[number];

export const EXPECTED_FEATURED_WORK_IDS = [
  'gap',
  'sleep-recovery',
  'daily-tasks',
] as const;

export const getWorkCategoryOrder = (category: WorkCategoryId) =>
  WORK_CATEGORY_IDS.indexOf(category);
