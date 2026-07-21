export const EXPERIENCE_CATEGORY_IDS = ['campus', 'work', 'research'] as const;
export type ExperienceCategory = (typeof EXPERIENCE_CATEGORY_IDS)[number];

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonical?: URL | string;
  image?: URL | string;
  noIndex?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  match: 'exact' | 'prefix' | 'none';
}
