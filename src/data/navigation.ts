import type { NavigationItem } from '@/types/site';

export const NAVIGATION_IDS = ['about', 'experience', 'work', 'resume', 'contact'] as const;
export type NavigationId = (typeof NAVIGATION_IDS)[number];

const NAVIGATION_MATCH_BY_ID = {
  about: 'exact',
  experience: 'exact',
  work: 'prefix',
  resume: 'exact',
  contact: 'none',
} as const satisfies Record<NavigationId, NavigationItem['match']>;

interface NavigationContentItem {
  id: NavigationId;
  label: string;
  href: string;
}

export const getPrimaryNavigation = (
  items: readonly NavigationContentItem[],
): NavigationItem[] =>
  items.map((item) => ({
    ...item,
    match: NAVIGATION_MATCH_BY_ID[item.id],
  }));
