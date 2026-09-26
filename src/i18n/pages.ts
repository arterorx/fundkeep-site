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

/**
 * "I am leaving YNAB, what do I use." The English page leads with the Mac,
 * because that is the query it can win; the translations lead with the same
 * argument in the words their own market uses.
 */
export const LEAVING_YNAB = {
  en: 'ynab-alternative',
  de: 'ynab-alternative',
  fr: 'alternative-ynab',
  ja: 'ynab-kara-norikae',
} as const;

/** The ranked comparison. English lives in the blog; the others stand alone. */
export const BEST_ALTERNATIVES = {
  en: 'blog/ynab-alternatives',
  de: 'beste-ynab-alternativen',
  fr: 'meilleures-alternatives-ynab',
  ja: 'ynab-daitai-apuri',
} as const;

/** What YNAB costs, and every price since YNAB 4. */
export const YNAB_PRICING = {
  en: 'ynab-pricing',
  de: 'ynab-preise',
  fr: 'prix-ynab',
  ja: 'ynab-ryokin',
} as const;

/** Getting your data out of YNAB. */
export const EXPORT_GUIDE = {
  en: 'blog/ynab-export-guide',
  de: 'ynab-daten-exportieren',
  fr: 'exporter-donnees-ynab',
  ja: 'ynab-export',
} as const;

/** The two pages Apple has on file, in the languages they exist in. */
export const SUPPORT = {
  en: 'support',
  de: 'hilfe',
  fr: 'assistance',
  ja: 'support',
} as const;

export const PRIVACY = {
  en: 'privacy',
  de: 'datenschutz',
  fr: 'confidentialite',
  ja: 'privacy',
} as const;

/** The index of everything written, per language. */
export const ARTICLES = {
  en: 'blog',
  de: 'artikel',
  fr: 'articles',
  ja: 'kiji',
} as const;

/** Why nearly every envelope app is a subscription, and what the fee buys. */
export const NO_SUBSCRIPTION = {
  en: 'blog/envelope-budgeting-without-a-subscription',
  de: 'umschlagmethode-ohne-abo',
  fr: 'budget-enveloppes-sans-abonnement',
  ja: 'fuutou-kakeibo-sabusuku-nashi',
} as const;

/** The apps that do not need a bank login. */
export const NO_BANK_LOGIN = {
  en: 'blog/budget-app-without-bank-sync',
  de: 'budget-app-ohne-bankzugang',
  fr: 'application-budget-sans-connexion-bancaire',
  ja: 'ginko-renkei-nashi-kakeibo-apuri',
} as const;

export const homeCluster = () => clusterFor(HOME);
export const articlesCluster = () => clusterFor(ARTICLES);
export const noSubscriptionCluster = () => clusterFor(NO_SUBSCRIPTION);
export const noBankLoginCluster = () => clusterFor(NO_BANK_LOGIN);
export const supportCluster = () => clusterFor(SUPPORT);
export const privacyCluster = () => clusterFor(PRIVACY);
export const ynabPricingCluster = () => clusterFor(YNAB_PRICING);
export const exportGuideCluster = () => clusterFor(EXPORT_GUIDE);
export const leavingYnabCluster = () => clusterFor(LEAVING_YNAB);
export const bestAlternativesCluster = () => clusterFor(BEST_ALTERNATIVES);
export const boughtOnceCluster = () => clusterFor(BOUGHT_ONCE);

/** The path of a page in one language, for linking between them. */
export const pathIn = (
  page: Record<Locale, string>,
  lang: Locale,
): string => (page[lang] ? `${lang === 'en' ? '' : `/${lang}`}/${page[lang]}` : lang === 'en' ? '/' : `/${lang}`);
