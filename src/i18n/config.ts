/**
 * The languages this site is published in.
 *
 * English lives at the root with no prefix; every other language sits under
 * its own. That is the shape the sister site uses, where translations carry
 * about half of all impressions — the reason this exists at all.
 */

export const LOCALES = ['en', 'de', 'fr', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Each language named in itself, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
};

/** BCP-47, for `og:locale` and for formatting dates. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ja: 'ja-JP',
};

/** No prefix for the default language. */
export const localePrefix = (lang: Locale) =>
  lang === DEFAULT_LOCALE ? '' : `/${lang}`;

/** ('de', 'haushaltsbuch-app-ohne-abo') → '/de/haushaltsbuch-app-ohne-abo' */
export const localePath = (lang: Locale, slug = '') =>
  slug ? `${localePrefix(lang)}/${slug}` : localePrefix(lang) || '/';

/** One language version of a page, for the hreflang cluster. */
export interface Alternate {
  lang: Locale;
  path: string;
}

/**
 * The hreflang cluster of a page, given the slug each language uses for it.
 * A page with no translations gets no cluster, which is valid and correct —
 * hreflang with one entry says nothing.
 */
export const clusterFor = (slugs: Partial<Record<Locale, string>>): Alternate[] =>
  LOCALES.filter((lang) => slugs[lang] !== undefined).map((lang) => ({
    lang,
    path: localePath(lang, slugs[lang]),
  }));

/**
 * A date written the way the page's language writes it.
 *
 * The constants carry one English rendering of each date ("13 September
 * 2026"), which is right on the English pages and wrong everywhere else — a
 * German page saying "am 13 September 2026" reads like a machine. The ISO
 * value stays the single source; this is only how it is spoken.
 */
export const formatDate = (iso: string, lang: Locale): string =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALE_TAGS[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
