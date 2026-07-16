import type { NavigationItem } from '@/types/site';

export const PRIMARY_NAVIGATION = [
  { label: 'About', href: '#about-snapshot' },
  { label: 'Projects', href: '#selected-projects' },
  { label: 'Research', href: '#research-preview' },
  { label: 'Contact', href: '#contact' },
] as const satisfies readonly NavigationItem[];
