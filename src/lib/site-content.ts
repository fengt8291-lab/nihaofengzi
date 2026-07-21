import { getCollection, type CollectionEntry } from 'astro:content';

export type SiteContent = CollectionEntry<'site'>['data'];
export type ProfileExperience = SiteContent['profile']['experiences'][number];

let siteContentPromise: Promise<SiteContent> | undefined;

export const getSiteContent = async (): Promise<SiteContent> => {
  siteContentPromise ??= getCollection('site').then((entries) => {
    const siteEntry = entries.find((entry) => entry.id === 'site');

    if (!siteEntry) {
      throw new Error('Missing required site content entry with ID "site".');
    }

    if (entries.length !== 1) {
      throw new Error(
        `Expected exactly one site content entry, found ${entries.length}: ${entries
          .map((entry) => entry.id)
          .join(', ')}`,
      );
    }

    return siteEntry.data;
  });

  return siteContentPromise;
};

export const getProfileExperiences = (
  siteContent: SiteContent,
  ids: readonly string[],
): ProfileExperience[] =>
  ids.map((id) => {
    const experience = siteContent.profile.experiences.find((entry) => entry.id === id);

    if (!experience) throw new Error(`Unknown profile experience: ${id}`);
    return experience;
  });
