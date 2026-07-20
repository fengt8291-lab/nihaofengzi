export const normalizePathname = (pathname: string): string => {
  const [pathWithoutQuery] = pathname.trim().split(/[?#]/, 1);
  const withLeadingSlash = pathWithoutQuery?.startsWith('/')
    ? pathWithoutQuery
    : `/${pathWithoutQuery ?? ''}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');

  if (collapsed === '/') return collapsed;

  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
};

export const matchesPathname = (
  currentPathname: string,
  targetPathname: string,
  mode: 'exact' | 'prefix' = 'exact',
): boolean => {
  const current = normalizePathname(currentPathname);
  const target = normalizePathname(targetPathname);

  if (mode === 'exact') return current === target;
  if (target === '/') return current === '/';

  return current === target || current.startsWith(target);
};

export const getCanonicalUrl = (pathname: string, baseUrl: string | URL): URL => {
  const canonical = new URL(normalizePathname(pathname), baseUrl);
  canonical.search = '';
  canonical.hash = '';
  return canonical;
};
