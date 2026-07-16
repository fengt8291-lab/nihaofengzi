export interface SiteConfig {
  name: string;
  englishName: string;
  url: string;
  language: string;
  defaultTitle: string;
  defaultDescription: string;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonical?: URL | string;
  image?: URL | string;
  noIndex?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface CurrentExploration {
  title: string;
  description: string;
  updatedAt: string;
  link?: string;
}
