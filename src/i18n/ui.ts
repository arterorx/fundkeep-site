/**
 * Every string the shell of the site says, in four languages.
 *
 * English defines the keys. The other three are typed against it, so a
 * missing or invented key fails `astro check` rather than shipping an English
 * word into the middle of a German page.
 *
 * Tone and terms follow the app's own store listings, which are already
 * localised: German uses "du" and "Umschlag-Budget", French "vous" and
 * "Budget Enveloppes", Japanese the polite です/ます form. The site and the
 * listing are read by the same person within about ten seconds of each other,
 * and they should not sound like two different products.
 */

import type { Locale } from './config';

const en = {
  'nav.leaving': 'Leaving YNAB?',
  'nav.articles': 'Articles',
  'nav.compare': 'Compared',
  'nav.support': 'Support',
  'nav.privacy': 'Privacy',
  skipLink: 'Skip to content',
  'footer.note':
    'Fundkeep keeps your budget on your own devices. No account, no bank logins, no server of ours.',
  'footer.legal':
    'Apple, the Apple logo, App Store, Apple Watch, iCloud, iPad, iPadOS, iPhone, Mac, macOS and Safari are trademarks of Apple Inc.',
  'lang.label': 'Language',
  'cta.badgeAlt': 'Download on the App Store',
  'price.checked': 'Prices read on the App Store on',
  'home.trial': 'Free for the first {days} days.',
  'calc.question': 'How long do you expect to keep budgeting?',
  'calc.over': 'Over {years}',
  'calc.pay': 'You pay',
  'calc.annual': 'billed annually',
  'calc.monthly': 'billed monthly',
  'calc.ours': 'bought once',
  'calc.difference': 'Difference over {years}',
  'calc.yearOne': '1 year',
  'calc.yearMany': '{n} years',
} as const;

export type UIKey = keyof typeof en;

const de = {
  'nav.leaving': 'Weg von YNAB?',
  'nav.articles': 'Artikel',
  'nav.compare': 'Vergleich',
  'nav.support': 'Hilfe',
  'nav.privacy': 'Datenschutz',
  skipLink: 'Zum Inhalt springen',
  'footer.note':
    'Fundkeep behält dein Budget auf deinen eigenen Geräten. Kein Konto, keine Bankzugänge, kein Server von uns.',
  'footer.legal':
    'Apple, das Apple-Logo, App Store, Apple Watch, iCloud, iPad, iPadOS, iPhone, Mac, macOS und Safari sind Marken von Apple Inc.',
  'lang.label': 'Sprache',
  'cta.badgeAlt': 'Laden im App Store',
  'price.checked': 'Preise im App Store gelesen am',
  'home.trial': 'Die ersten {days} Tage kostenlos.',
  'calc.question': 'Wie lange willst du budgetieren?',
  'calc.over': 'Über {years}',
  'calc.pay': 'Du zahlst',
  'calc.annual': 'jährlich abgerechnet',
  'calc.monthly': 'monatlich abgerechnet',
  'calc.ours': 'einmal gekauft',
  'calc.difference': 'Unterschied über {years}',
  'calc.yearOne': '1 Jahr',
  'calc.yearMany': '{n} Jahre',
} satisfies Record<UIKey, string>;

const fr = {
  'nav.leaving': 'Vous quittez YNAB ?',
  'nav.articles': 'Articles',
  'nav.compare': 'Comparatif',
  'nav.support': 'Assistance',
  'nav.privacy': 'Confidentialité',
  skipLink: 'Aller au contenu',
  'footer.note':
    'Fundkeep garde votre budget sur vos propres appareils. Aucun compte, aucun identifiant bancaire, aucun serveur chez nous.',
  'footer.legal':
    'Apple, le logo Apple, App Store, Apple Watch, iCloud, iPad, iPadOS, iPhone, Mac, macOS et Safari sont des marques d’Apple Inc.',
  'lang.label': 'Langue',
  'cta.badgeAlt': 'Télécharger dans l’App Store',
  'price.checked': 'Prix relevés sur l’App Store le',
  'home.trial': 'Gratuit les {days} premiers jours.',
  'calc.question': 'Pendant combien de temps comptez-vous tenir un budget ?',
  'calc.over': 'Sur {years}',
  'calc.pay': 'Vous payez',
  'calc.annual': 'facturé à l’année',
  'calc.monthly': 'facturé au mois',
  'calc.ours': 'acheté une fois',
  'calc.difference': 'Écart sur {years}',
  'calc.yearOne': '1 an',
  'calc.yearMany': '{n} ans',
} satisfies Record<UIKey, string>;

const ja = {
  'nav.leaving': 'YNABからの乗り換え',
  'nav.articles': '記事',
  'nav.compare': '比較',
  'nav.support': 'サポート',
  'nav.privacy': 'プライバシー',
  skipLink: '本文へスキップ',
  'footer.note':
    'Fundkeepは家計を自分のデバイスの中だけに保ちます。アカウントなし、銀行ログインなし、こちらのサーバーもありません。',
  'footer.legal':
    'Apple、Appleロゴ、App Store、Apple Watch、iCloud、iPad、iPadOS、iPhone、Mac、macOS、SafariはApple Inc.の商標です。',
  'lang.label': '言語',
  'cta.badgeAlt': 'App Storeでダウンロード',
  'price.checked': 'App Storeで価格を確認した日',
  'home.trial': '最初の{days}日間は無料です。',
  'calc.question': '家計簿を何年つけるつもりですか？',
  'calc.over': '{years}で',
  'calc.pay': '支払額',
  'calc.annual': '年額',
  'calc.monthly': '月額',
  'calc.ours': '買い切り',
  'calc.difference': '{years}の差額',
  'calc.yearOne': '1年間',
  'calc.yearMany': '{n}年間',
} satisfies Record<UIKey, string>;

const DICTIONARIES: Record<Locale, Record<UIKey, string>> = { en, de, fr, ja };

/** `t('de')('nav.articles')` → 'Artikel'. */
export const t = (lang: Locale) => (key: UIKey) => DICTIONARIES[lang][key];

/**
 * The same, with values filled in: `tf('ja')('home.trial', { days: TRIAL.days })`.
 * Numbers that live in src/consts.ts stay there — writing "14" into four
 * dictionaries would be four places to forget when the trial changes.
 */
export const tf =
  (lang: Locale) =>
  (key: UIKey, values: Record<string, string | number>) =>
    DICTIONARIES[lang][key].replace(/\{(\w+)\}/g, (whole, name) =>
      name in values ? String(values[name]) : whole,
    );
