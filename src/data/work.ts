export const WORK_CATEGORY_IDS = [
  'product-digital',
  'research-content',
  'learning-tools',
  'creative-life',
] as const;

export type WorkCategoryId = (typeof WORK_CATEGORY_IDS)[number];

export const WORK_CATEGORIES = [
  {
    id: 'product-digital',
    label: '产品、网站与数字实践',
    description: '从个人观察和真实问题出发形成的产品原型、网站与数字实践。',
  },
  {
    id: 'research-content',
    label: '用户研究与内容作品',
    description: '由用户洞察、课程研究和内容表达形成的阶段性作品。',
  },
  {
    id: 'learning-tools',
    label: '学习工具实验',
    description: '围绕真实学习需求进行的知识结构化与工具实验。',
  },
  {
    id: 'creative-life',
    label: '影像与个人创作',
    description: '通过影像与个人创作保存具体生活和阶段变化。',
  },
] as const satisfies readonly {
  id: WorkCategoryId;
  label: string;
  description: string;
}[];

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
  'daily-tasks',
  'huian',
  'sleep-recovery',
] as const;

export const getWorkCategoryOrder = (category: WorkCategoryId) =>
  WORK_CATEGORY_IDS.indexOf(category);
