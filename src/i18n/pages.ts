/**
 * Which slug each language uses for the same page.
 *
 * A translated page is not the English one with the words swapped: the German
 * page is at the phrase Germans search, and so is the French and the Japanese.
 * What makes them one page for a search engine is the hreflang cluster, and
 * the cluster is only correct if every language agrees on it — so the mapping
 * lives here once, and both ends read it.
 */

import { clusterFor, type Locale } from './config';

export const HOME = { en: '', de: '', fr: '', ja: '' } as const;

/**
 * "What do I buy instead of subscribing." The English page is the payment
 * model one; each translation is at the query its own market types:
 *   de  Haushaltsbuch-App ohne Abo
 *   fr  application budget sans abonnement
 *   ja  家計簿アプリ 買い切り (kaikiri — bought outright)
 */
export const BOUGHT_ONCE = {
  en: 'budget-app-one-time-purchase',
  de: 'haushaltsbuch-app-ohne-abo',
  fr: 'application-budget-sans-abonnement',
  ja: 'kakeibo-apuri-kaikiri',
} as const;

export const homeCluster = () => clusterFor(HOME);
export const boughtOnceCluster = () => clusterFor(BOUGHT_ONCE);

/** The path of a page in one language, for linking between them. */
export const pathIn = (
  page: Record<Locale, string>,
  lang: Locale,
): string => (page[lang] ? `${lang === 'en' ? '' : `/${lang}`}/${page[lang]}` : lang === 'en' ? '/' : `/${lang}`);
