import type { NavigationItem } from '@/types/site';

export const PRIMARY_NAVIGATION = [
  { label: '关于', href: '/about/', match: 'exact' },
  { label: '经历', href: '/experience/', match: 'exact' },
  { label: '作品', href: '/work/', match: 'prefix' },
  { label: '简历', href: '/resume/', match: 'exact' },
  { label: '联系', href: '/#contact', match: 'none' },
] as const satisfies readonly NavigationItem[];
