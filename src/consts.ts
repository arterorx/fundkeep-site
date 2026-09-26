/**
 * Single source of truth for every fact that appears in more than one place.
 *
 * Rules from CLAUDE.md that live here rather than in anyone's memory:
 *
 * 1. Nothing in this file may be an unverifiable claim. Prices, the release
 *    status, the wording about competitors and what is in the version are the
 *    штаб's call — they change here, never in a template.
 * 2. The release status is a constant, never a sentence typed into a page. On
 *    sawkit.app "Coming autumn 2026" was written into three templates, drifted
 *    away from reality and had to be hunted down by hand before release.
 * 3. Prices are checked against the rendered HTML at build time
 *    (`src/build/hq-guards.ts`): an amount on a page that is not in this file
 *    fails the build.
 */

/* ==========================================================================
 * The domain switch — SPEC §6. DONE on 17.08.2026.
 *
 * The site ran on the free Cloudflare Pages address until the domain existed,
 * closed to search engines the whole time: a temporary address that gets
 * indexed has to be undone later with redirects and canonical warnings, and
 * both roomkeep.app and sawkit.app collected those.
 *
 * Flipping `live` was the whole change, as promised. It moves the canonical
 * and og:url tags to the real domain, drops `noindex` from every page but
 * /404, opens `robots.txt`, emits the sitemap, and arms the 301 in
 * `functions/_middleware.js` that sends the pages.dev duplicate here.
 *
 * It is kept rather than deleted because it is the only safe way to test a
 * domain move, and because setting it back to false is the fastest way to put
 * the site behind a closed door if that is ever needed.
 *
 * WHAT THE MOVE ACTUALLY COST, so the next one is cheaper: from a machine
 * whose DNS cache still held the registrar's old A record, the domain looked
 * misconfigured for twenty minutes — HTTPS timed out, HTTP answered 302 with
 * `X-Served-By: Namecheap URL Forward`. The zone had been right the whole
 * time. Ask the zone's own nameservers (`dig @<ns> <domain>`) and curl the
 * resolved IPs with `--resolve` before believing anything a local resolver
 * says.
 * ========================================================================== */

export const DOMAIN = {
  /**
   * True since 17.08.2026: fundkeep.app is attached to the Pages project and
   * verified serving this site before this line was changed.
   */
  live: true,
  production: 'https://fundkeep.app',
  /** The free address, created 2026-08-16. */
  temporary: 'https://fundkeep.pages.dev',
} as const;

/** The address the site is actually served from today. */
export const SITE_URL: string = DOMAIN.live
  ? DOMAIN.production
  : DOMAIN.temporary;

/**
 * Whether search engines are welcome. Read by the layout (`noindex`),
 * `robots.txt` and `astro.config.mjs` (the sitemap integration), so the three
 * cannot disagree with each other — which is exactly how a temporary address
 * gets indexed.
 */
export const INDEXABLE: boolean = DOMAIN.live;

/* ========================================================================== */

export const SITE = {
  name: 'Fundkeep',
  domain: DOMAIN.live ? 'fundkeep.app' : 'fundkeep.pages.dev',
  url: SITE_URL,
  /** Meta description of the home page. Keep under 155 characters. */
  description:
    'Envelope budgeting for iPhone, iPad and Mac. One purchase, no subscription, no bank logins, and your budget stays on your own devices.',
  locale: 'en',
  ogLocale: 'en_US',
} as const;

/**
 * The one address on the site. The support page, the privacy page, the footer
 * and the 404 all read it from here.
 *
 * On the domain since 17.08.2026, through Cloudflare Email Routing, forwarding
 * to the owner's own inbox. It replaced a personal gmail that stood here for a
 * day, because Apple files this address as the support contact and a reviewer
 * writing to a bouncing one is a rejection waiting to happen — so it was never
 * allowed to be aspirational.
 *
 * Delivery was confirmed by the owner before this line changed, and the zone
 * carries the three Cloudflare MX records, exactly one SPF and the DKIM key.
 * If mail ever stops, check for a second SPF record first: two of them on the
 * same name is a permerror, and it is how this breaks quietly.
 */
export const CONTACT_EMAIL = 'support@fundkeep.app';

/**
 * Prices are the штаб's call (SPEC §5). Change them here and nowhere else:
 * the build scans the rendered HTML for money and fails on any amount that is
 * not listed in this file.
 *
 * $39.99 is the one non-consumable purchase, registered in App Store Connect
 * in 175 territories on 2026-08-15.
 */
export const PRICING = {
  full: '$39.99',
  note: 'one purchase, not a subscription',
} as const;

/**
 * Promotional price — off, and null is the only correct value until a price
 * schedule physically exists in App Store Connect with an end date.
 *
 * A decision to run one is not a schedule. Until the schedule is created, a
 * page naming a reduced price would be advertising a price the store does not
 * charge, and price history is public, so it cannot be walked back quietly.
 * The rule is carried over from sawkit.app, where a forgotten discount would
 * have turned a page into a false statement.
 *
 * The shape enforces the rest of it: there is no way to publish an amount
 * without also supplying the date it ends.
 */
export interface LaunchPrice {
  amount: string;
  /** Machine-readable end date, YYYY-MM-DD, for the <time> element. */
  endsOn: string;
  /** How the date reads to a person, e.g. '31 January 2027'. */
  endsOnDisplay: string;
}

export const LAUNCH_PRICE: LaunchPrice | null = null;

/**
 * YNAB, named — on the site only.
 *
 * The штаб's rule (SPEC §5): the app itself says "subscription apps" and names
 * nobody, because text in a binary is fixed until the next release and a stale
 * number attached to a named company is a false claim about that company. The
 * site is edited in a minute, so the comparison lives here.
 *
 * The consequence is that this number is a liability with a shelf life. It is
 * re-read from YNAB's own pricing page at every change to this site, and the
 * build warns when `recheckBy` passes.
 *
 * Re-read on ynab.com/pricing itself on 13.09.2026, before the /ynab-pricing
 * page was published: "$109 USD* paid annually", a monthly plan at "$14.99
 * USD*", and "How About 34 Days for Free?". Unchanged since the last read.
 * How the price got here is in `YNAB_PRICE_HISTORY`, every row with its source.
 */
export const YNAB = {
  name: 'YNAB',
  /** Billed annually. */
  price: '$109',
  period: 'a year',
  annual: 109,
  /** Billed monthly, which is what most people actually start on. */
  monthly: 14.99,
  /** Their own free trial, for the comparison to be a fair one. */
  trialDays: 34,
  /**
   * Read off ynab.com/pricing itself on this date — not from a review site,
   * not from memory. The page said "$109 USD paid annually" and "$14.99
   * USD/month".
   */
  checkedOn: '2026-09-13',
  /** The same date as a person would write it, for the caveat line. */
  checkedOnDisplay: '13 September 2026',
  source: 'https://www.ynab.com/pricing',
  recheckBy: '2026-12-13',
} as const;

/**
 * How YNAB's price got to `YNAB.price` — the table on /ynab-pricing.
 *
 * Every row was read on 13.09.2026 in a first-party source: YNAB's own pages,
 * mostly as archived by the Wayback Machine, and each row links the capture
 * it came from. Nothing here is from a review site, a forum or memory. Where
 * YNAB's own pages leave a question open, the note says so instead of filling
 * it — two stay open: whether "$99" in 2022 was a change or a rounding of
 * $98.99, and when the 2024 price reached people who already subscribed.
 *
 * The archive was read at intervals, so a promotion that lived between two
 * captures could be missing. A price increase could not: every one of these
 * stayed on the pricing page for months or years.
 *
 * Amounts in `price` and `note` are allowed by the build on /ynab-pricing,
 * the one page that declares it prints another company's prices.
 */
export interface YnabPriceRow {
  /** When, as a person says it. */
  when: string;
  /** For <time>: the effective date if YNAB gave one, else the month first seen. */
  date: string;
  /** What it cost, as YNAB's own page put it. */
  price: string;
  /** What changed, and anything the sources leave open. */
  note: string;
  source: { label: string; url: string };
}

export const YNAB_PRICE_HISTORY: readonly YnabPriceRow[] = [
  {
    when: '2012 to 2017',
    date: '2012-06',
    price: '$60 once',
    note: 'YNAB 4, a program you installed. YNAB’s purchase page: “This one-time purchase lets you use YNAB on every PC and Mac in your home.” It stopped selling by April 2017.',
    source: {
      label: 'YNAB’s purchase page, February 2015',
      url: 'https://web.archive.org/web/20150201191155/https://purchase.youneedabudget.com/',
    },
  },
  {
    when: 'December 2015',
    date: '2015-12',
    price: '$5 a month or $50 a year',
    note: 'The new YNAB launches, as a subscription.',
    source: {
      label: 'YNAB’s launch post, December 2015',
      url: 'https://web.archive.org/web/20151231182644/http://www.youneedabudget.com/blog/post/the-new-ynab-is-here',
    },
  },
  {
    when: 'November 2016',
    date: '2016-11',
    price: '$50 a year',
    note: 'Monthly billing ends for new subscribers. People already paying monthly keep doing so.',
    source: {
      label: 'YNAB’s 2017 price FAQ',
      url: 'https://web.archive.org/web/20181017033648/https://www.youneedabudget.com/price-change-faqs-2017/',
    },
  },
  {
    when: '15 November 2017',
    date: '2017-11-15',
    price: '$83.99 a year',
    note: 'For new subscribers only: “If you signed up for YNAB before November 15, 2017, you will be billed at the same price you paid when you initially subscribed.”',
    source: {
      label: 'YNAB’s 2017 price FAQ',
      url: 'https://web.archive.org/web/20181017033648/https://www.youneedabudget.com/price-change-faqs-2017/',
    },
  },
  {
    when: 'By November 2019',
    date: '2019-11',
    price: '$11.99 a month, or $84 a year',
    note: 'A monthly plan returns, next to the yearly one. We found no announcement of it.',
    source: {
      label: 'YNAB’s pricing page, November 2019',
      url: 'https://web.archive.org/web/20191115132229/https://www.youneedabudget.com/pricing/',
    },
  },
  {
    when: '1 December 2021',
    date: '2021-12-01',
    price: '$98.99 a year or $14.99 a month',
    note: 'For everyone, at their first renewal on or after that date — “This price change applies to all customers”, including those still on the 2015 prices.',
    source: {
      label: 'YNAB’s 2021 price change page',
      url: 'https://web.archive.org/web/20211101121240/https://www.youneedabudget.com/price-change-2021/',
    },
  },
  {
    when: 'September 2022',
    date: '2022-09',
    price: '$99 a year; $14.99 a month',
    note: 'The pricing page starts showing $99. We found no announcement, so this may be the same price, rounded.',
    source: {
      label: 'YNAB’s pricing page, September 2022',
      url: 'https://web.archive.org/web/20220917221424/https://www.youneedabudget.com/pricing/',
    },
  },
  {
    when: '1 August 2024',
    date: '2024-08-01',
    price: '$109 a year; $14.99 a month',
    note: 'Announced on the pricing page in July 2024: “Our annual subscription rate increases to $109 on 8/1.” We found no first-party word on when it reached existing subscribers.',
    source: {
      label: 'YNAB’s pricing page, July 2024',
      url: 'https://web.archive.org/web/20240704060623/https://www.ynab.com/pricing',
    },
  },
] as const;

/** How the site writes money. One formatter, so nothing rounds differently. */
export const money = (amount: number): string =>
  amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * The other apps, named — the штаб's decision of 16.08.2026, which reversed
 * the narrower line this site launched with.
 *
 * Every one of these is a liability with a shelf life, which is why they live
 * here and not in prose: naming a company and attaching a stale number to it
 * is a false statement about that company, and it is the single most damaging
 * thing this site could publish.
 *
 * THE RULE FOR `price`: it is filled in only from a **first-party** source we
 * read ourselves — the company's own pricing page, or Apple's own App Store
 * listing. Not a review site, not a comparison blog, and not the competitor
 * table in the app repository, which is internal analysis and was wrong about
 * two of these when it was checked.
 *
 * `price: null` means we could not verify one on `checkedOn`, and the article
 * says so in as many words rather than printing a number we do not stand
 * behind. Two of the five are null today, and that is the honest state rather
 * than a gap to be filled in later by guessing.
 */
export interface Competitor {
  name: string;
  /** Their own page, for the reader to check the price themselves. */
  url: string;
  /** Verified first-hand, or null. Never anything in between. */
  price: string | null;
  /** How that price is charged, or why there is no figure. */
  priceNote: string;
  /**
   * Whether an Apple buyer can actually get it, checked against Apple's own
   * catalogue rather than against the company's marketing. This matters more
   * than price on a page read by people with iPhones: an app they cannot
   * install is not an alternative, whatever it costs.
   */
  availability: string;
  /** Where the figure was read, named on the page so it can be audited. */
  source: string;
  /**
   * Who this one is the right answer for — one line, in the ranked comparison.
   *
   * A ranking by the company that sells one of the apps is worth nothing
   * unless every other row is given its real case. So each of these says what
   * the app genuinely beats us at, and ours says what it does not.
   */
  bestFor: string;
}

/*
 * Each app's facts live in one constant, and every table that names the app
 * uses that constant. A price that moves is one line to change, however many
 * pages print it.
 */

const ENVY: Competitor = {
  name: 'Envy',
  url: 'https://apps.apple.com/us/app/envy-envelope-budget-planner/id1569230951',
  price: '$6.99',
  priceNote: 'free to download, one in-app purchase called Envy All Access.',
  availability:
    'On the App Store. iPhone and iPad; on a Mac it runs as the iPad app.',
  source: "Apple's App Store listing",
  bestFor: 'The cheapest unlock on the App Store',
};

const ACTUAL_BUDGET: Competitor = {
  name: 'Actual Budget',
  url: 'https://actualbudget.org',
  price: 'Free',
  priceNote: 'open source. Syncing between devices means running a server.',
  availability:
    'Not an App Store app. You run it yourself, which is the whole idea.',
  source: 'the project itself',
  bestFor: 'Paying nothing, if you are willing to run it yourself',
};

const ZEROED: Competitor = {
  name: 'Zeroed',
  url: 'https://apps.apple.com/us/app/zeroed-offline-budget-planner/id6804301133',
  price: '$19.99',
  priceNote:
    'a founder price until 14 February 2027, then $39.99, paid once after a 34-day trial. Free to download, with the purchase inside.',
  // Until 26.09.2026 this row said Zeroed was not on the App Store. It is:
  // "Zeroed: Offline Budget Planner", Stillware Ltd, released 14.09.2026.
  // Apple's search does not return it for the word "zeroed" even now, which is
  // how we missed it — the link on the company's own page does. Look a product
  // up by the identifier it publishes, not by its name.
  availability:
    'On the App Store since 14 September 2026 — iPhone, iPad and Macs with Apple silicon. Also on Google Play and the Microsoft Store, and as a direct download for Mac and Windows.',
  source: 'their own site, and Apple’s App Store listing',
  bestFor: 'One payment that also covers Windows and Android',
};

const MONEYCOACH: Competitor = {
  name: 'MoneyCoach',
  url: 'https://moneycoach.ai',
  // Until 13.09.2026 this said Apple does not publish in-app purchase prices.
  // It does: the listing shows them. What it shows for Premium is a column of
  // different amounts with no period against most of them, and that is not a
  // price anyone can quote as the price — so the one clear figures are given
  // and the rest is described.
  price: 'Free',
  priceNote:
    'the most used features are free. Premium is a subscription that Apple’s US listing shows at several prices; Lifetime Premium is $199.99.',
  availability: 'On the App Store. iPhone, iPad, Mac and Apple Watch.',
  source: 'their own site, and Apple’s App Store listing',
  bestFor: 'Bank sync in Europe, in an Apple-native app',
};

const GOODBUDGET: Competitor = {
  name: 'Goodbudget',
  url: 'https://goodbudget.com',
  price: 'Free',
  priceNote:
    'a free plan with 10 regular and 10 more envelopes and one account. Plus is $8 a month or $70 a year; Premium, the plan with bank sync, is $10 a month or $80 a year. Prices from its own website.',
  availability: 'On the App Store for iPhone, and on Android and the web.',
  source: 'its own website and help pages',
  bestFor: 'Sharing envelopes with somebody on Android or the web',
};

const PENNIES: Competitor = {
  name: 'Pennies',
  url: 'https://www.getpennies.com',
  price: null,
  priceNote:
    'free to download. Apple’s US listing shows annual subscriptions at several prices, and we could not find what a subscription adds, so we print none.',
  availability: 'On the App Store. iPhone, iPad and Apple Watch.',
  source: 'its own website, and Apple’s App Store listing',
  bestFor: 'A daily spending number, not a full plan',
};

const SKWAD: Competitor = {
  name: 'Skwad',
  url: 'https://skwad.app',
  price: '$49 a year',
  priceNote:
    'for DIY, which syncs from your bank’s email alerts; LINK, with bank linking, is $65 a year. Billed monthly they are $6 and $8. No free plan.',
  availability: 'On the App Store for iPhone and iPad, on Android, and on the web.',
  source: 'its own pricing page, and Apple’s App Store listing',
  bestFor: 'Transactions arriving by themselves without a bank login',
};

const MONEYDANCE: Competitor = {
  name: 'Moneydance',
  url: 'https://infinitekind.com/moneydance',
  price: '$49.99',
  priceNote:
    'paid once, from their own store. A free trial stops at 100 transactions.',
  availability:
    'Mac, Windows and Linux, bought from the company. The iPhone and iPad app is free, and their own App Store listing says the desktop version is required to use it.',
  source: 'their own product page, and Apple’s App Store listing',
  bestFor: 'A full desktop ledger, if the computer is where you budget',
};

const MONEYSPIRE: Competitor = {
  name: 'Moneyspire',
  url: 'https://www.moneyspire.com/purchase',
  price: '$59.99',
  // Read from their own purchase page on 26.09.2026: "$59.99 Was $99.99",
  // marked 40% off. The undiscounted figure is the one to watch — a sale
  // price quoted as the price is the same mistake as quoting an intro price.
  priceNote:
    'a sale price on their own purchase page that day, down from $99.99. The same page says a new major version is released every year, optional, at $49.99.',
  availability:
    'Mac and Windows, bought from the company. Moneyspire Mobile comes with it, and their own page calls it a companion to the desktop software.',
  source: 'their own purchase page and mobile page',
  bestFor: 'Bank download services and business-style reports on a computer',
};

export const COMPETITORS: readonly Competitor[] = [
  // The order the ranked comparison uses, after Fundkeep: the reader's own
  // case decides, and these are sorted by how many readers each case fits.
  ZEROED,
  ACTUAL_BUDGET,
  ENVY,
  MONEYCOACH,
  {
    name: YNAB.name,
    url: YNAB.source,
    // Derived, never retyped. YNAB's figure moves, and on the day it does
    // there must be exactly one line in this repository to change — the
    // штаб's standing instruction. Writing "$109" here as a string would have
    // made two, and the second one would have been the one nobody remembered.
    price: YNAB.price,
    priceNote: `${YNAB.period}, or ${money(YNAB.monthly)} a month. ${YNAB.trialDays}-day trial.`,
    availability: 'On the App Store, free to download; the subscription is inside.',
    source: "YNAB's own pricing page",
    bestFor: 'Staying put, if bank sync and sharing are what you pay for',
  },
] as const;

/**
 * All five were read on this date. They move as one because they are re-read
 * as one — a single sweep is a task somebody will actually do, where five
 * separate dates would rot at five different speeds.
 */
export const COMPETITORS_CHECKED = {
  // Re-read as one on 26.09.2026, before the comparison became a ranked one.
  // What changed since 13.09: Zeroed reached the App Store. Prices for YNAB,
  // Envy, Actual Budget, Zeroed and MoneyCoach were all confirmed unchanged.
  on: '2026-09-26',
  display: '26 September 2026',
  recheckBy: '2026-12-26',
} as const;

/**
 * What this app and YNAB actually cost on each storefront the site is
 * published in.
 *
 * WHY THESE ARE NOT CONVERTED. Apple does not convert; it sets a price per
 * region, and the numbers are not a translation of the American one — the app
 * is $39.99 in the United States and 44,99 € in Germany, and YNAB is $109 a
 * year there and 119,00 € here. A German page that printed "$39.99" would
 * be wrong twice: it is not the price, and it is not the currency the reader
 * is charged in. Every figure below was read on the storefront itself, in the
 * App Store's own listing, on 26.09.2026:
 *
 *   ours     apps.apple.com/{us,de,fr,jp}/app/id6801904284 → "Fundkeep Full"
 *   YNAB     apps.apple.com/{us,de,fr,jp}/app/id1010865877 → "YNAB Subscription"
 *
 * Apple shows the two YNAB amounts without a period against them. They are
 * named here as the year and the month because the American pair, $109.00 and
 * $14.99, is exactly what ynab.com/pricing publishes as annual and monthly —
 * the same two products, priced per region.
 *
 * A price that moves is one line here, and `src/build/hq-guards.ts` fails any
 * page printing a money amount that is not in this file.
 */
export interface Market {
  /** What one purchase costs on this storefront. */
  full: string;
  /** What YNAB charges there, as the App Store lists it. */
  ynabYear: string;
  ynabMonth: string;
  /** The storefront the figures were read on. */
  storeUrl: string;
}

export const MARKETS: Record<'en' | 'de' | 'fr' | 'ja', Market> = {
  en: {
    full: '$39.99',
    ynabYear: '$109',
    ynabMonth: '$14.99',
    storeUrl: 'https://apps.apple.com/us/app/id6801904284',
  },
  de: {
    full: '44,99 €',
    ynabYear: '119,00 €',
    ynabMonth: '15,49 €',
    storeUrl: 'https://apps.apple.com/de/app/id6801904284',
  },
  fr: {
    full: '44,99 €',
    ynabYear: '119,00 €',
    ynabMonth: '15,49 €',
    storeUrl: 'https://apps.apple.com/fr/app/id6801904284',
  },
  ja: {
    full: '¥6,000',
    ynabYear: '¥15,000',
    ynabMonth: '¥1,700',
    storeUrl: 'https://apps.apple.com/jp/app/id6801904284',
  },
} as const;

/**
 * The other App Store apps a translated page names, priced on that page's own
 * storefront. Read the same day and the same way as MARKETS, from each app's
 * listing:
 *
 *   Envy    id1569230951 → "Envy All Access"
 *   Zeroed  id6804301133 → "Zeroed - Offline Budget Planner"
 *
 * Zeroed is absent from the French list because it is absent from the French
 * store: Apple's own lookup returns nothing for it on `fr`, while `de`, `us`
 * and `jp` all return the app. An app somebody cannot install is not an
 * alternative to them, whatever it costs somewhere else.
 *
 * The desktop apps (Moneydance, Moneyspire) are sold by their makers in US
 * dollars rather than through the App Store, so their prices are the same
 * figure everywhere and stay in COMPETITORS. Where a translated page names
 * them, it says the amount is in dollars.
 */
export interface MarketRival {
  name: string;
  price: string;
  url: string;
}

export const MARKET_RIVALS: Record<'en' | 'de' | 'fr' | 'ja', readonly MarketRival[]> = {
  en: [
    { name: 'Envy', price: '$6.99', url: 'https://apps.apple.com/us/app/id1569230951' },
    { name: 'Zeroed', price: '$19.99', url: 'https://apps.apple.com/us/app/id6804301133' },
  ],
  de: [
    { name: 'Envy', price: '7,99 €', url: 'https://apps.apple.com/de/app/id1569230951' },
    { name: 'Zeroed', price: '22,99 €', url: 'https://apps.apple.com/de/app/id6804301133' },
  ],
  fr: [
    { name: 'Envy', price: '7,99 €', url: 'https://apps.apple.com/fr/app/id1569230951' },
  ],
  ja: [
    { name: 'Envy', price: '¥1,100', url: 'https://apps.apple.com/jp/app/id1569230951' },
    { name: 'Zeroed', price: '¥3,000', url: 'https://apps.apple.com/jp/app/id6804301133' },
  ],
} as const;

/** The day every figure in MARKETS was read on its own storefront. */
export const MARKETS_CHECKED = {
  on: '2026-09-26',
  display: { en: '26 September 2026', de: '26. September 2026', fr: '26 septembre 2026', ja: '2026年9月26日' },
  recheckBy: '2026-12-26',
} as const;

/** The range the savings calculator offers, and where it starts. */
export const CALCULATOR = {
  minYears: 1,
  maxYears: 10,
  defaultYears: 5,
} as const;

/**
 * What each side costs over `years`, from the constants above and nothing
 * else.
 *
 * The page renders one of these server-side so the calculator says something
 * true before any script runs, the client script recomputes it from the same
 * numbers handed to it in data attributes, and `src/build/hq-guards.ts` uses
 * it to work out which amounts a page is allowed to contain. Three readers,
 * one piece of arithmetic — which is the only way the printed figures and the
 * checked figures cannot drift apart.
 */
/**
 * How many months of the subscription one purchase pays for.
 *
 * SPEC §4 asked for this figure and the штаб restated it on 17.08.2026: the
 * first thing a reader sees on that page has to be their own arithmetic, not
 * our slogan. This is the sharpest form of it — not "we are cheaper", but a
 * number they can check against their own bank statement.
 *
 * Measured against annual billing, which is the cheaper of the two ways to pay
 * them, so the figure is the conservative one. Somebody billed monthly is
 * getting a better deal than this line claims.
 */
export function monthsCovered(): number {
  const once = Number(PRICING.full.replace(/[$,]/g, ''));
  return once / (YNAB.annual / 12);
}

export function savings(years: number) {
  const once = Number(PRICING.full.replace(/[$,]/g, ''));
  const annual = YNAB.annual * years;
  const monthly = YNAB.monthly * 12 * years;
  return {
    years,
    once,
    annual,
    monthly,
    /** Against the cheaper of YNAB's two ways to pay, so the claim is safe. */
    saved: annual - once,
  };
}

/**
 * Release status. ON SALE since 2 September 2026.
 *
 * App ID 6801904284, listed as "Envelope Budgeting: Fundkeep". iOS 1.1 went on
 * sale on 02.09.2026 and macOS 1.1 on 07.09.2026; both were on 1.2 by
 * 13.09.2026. The in-app purchase `app.fundkeep.fullunlock` is approved, and
 * its US price in the App Store Connect price schedule read $39.99 on
 * 13.09.2026 — so `PRICING.full` above was already right and did not move.
 *
 * Checked twice, from two sides, on 13.09.2026. The штаб read the version
 * states from the App Store Connect API (READY_FOR_SALE on both platforms).
 * Apple's public catalogue (itunes.apple.com/lookup?id=6801904284) was read
 * separately, because it is what a visitor actually reaches: same name,
 * version 1.2, first released 2026-09-02, minimumOsVersion 26.0, and the Mac
 * among the supported devices of the one listing. It shows the download as
 * Free — the $39.99 is the unlock inside, which is what the pages already say.
 *
 * The site kept saying "Not on the App Store yet" for eleven days after the app
 * went on sale, on the home page and in every call to action, without a single
 * link to its own listing. That is the failure this constant was built to make
 * cheap to fix — and it still needed somebody to notice. `recheckBy` is a
 * reminder, not a monitor.
 *
 * WHY THIS FORM OF THE URL. It carries no storefront (`/us/`) on purpose:
 * apps.apple.com sends a storefront-less link to the visitor's own country, so
 * a reader in Germany lands in the German store rather than an American page
 * they cannot buy from. Verified: it answers 200 and redirects to the local
 * storefront.
 *
 * `state` and `appStoreUrl` move together or not at all — the build refuses to
 * finish otherwise, and it also fails if the released branch renders a call to
 * action without the link in it (`src/build/hq-guards.ts`).
 */
export const RELEASE = {
  state: 'released' as 'unreleased' | 'released',
  /** The only sentence on the whole site about release. */
  status: 'On the App Store',
  platforms: 'iPhone, iPad and Mac',
  /**
   * Minimum OS, read from the app's own build settings (Config/Shared.xcconfig)
   * and matching Apple's catalogue, which lists minimumOsVersion 26.0.
   */
  requires: 'iOS 26, iPadOS 26 or macOS 26',
  appStoreUrl: 'https://apps.apple.com/app/id6801904284' as string | null,
  /**
   * Look at `status` again by this date. The build prints a warning once it
   * passes — see `src/build/hq-guards.ts`.
   */
  recheckBy: '2027-03-01',
} as const;

/**
 * The trial, exactly as the app implements it (app repository,
 * `Metadata/ReviewNotes.md`). Every word of this is checkable by installing it:
 * fourteen days with nothing withheld, then read-only until the purchase —
 * and export keeps working forever, trial or no trial.
 */
export const TRIAL = {
  days: 14,
  afterwards:
    'the app becomes read-only until you buy it: everything you entered stays visible, and exporting to CSV keeps working',
} as const;

/**
 * Budget apps that do not need a bank login — the table on
 * /blog/budget-app-without-bank-sync (штаб, 13.09.2026).
 *
 * Every field was read from a first-party source on 13.09.2026: the company's
 * own site, pricing page or help, or Apple's own listing — under the same rule
 * as `COMPETITORS`, and sharing its constants, so an app that appears in both
 * tables has one price line.
 *
 * `bank` is the claim the page is about, and it is split in two on purpose.
 * Three of these never connect to a bank at all. Four can, if you set it up,
 * and usually only on a paid plan or in some countries. A headline that said
 * "don't connect to your bank" of all seven would be wrong about four named
 * companies, so the table says which is which.
 *
 * Alphabetical, with Fundkeep in its place rather than on top — the штаб's
 * instruction, and the only order that does not sell while it informs.
 */
export interface NoBankLoginApp extends Competitor {
  /** Never connects to a bank, or can if you choose to. */
  bank: 'never' | 'optional';
  /** How transactions get in, and the conditions on any bank connection. */
  bankNote: string;
  /** Where it runs, from the same sources. */
  runsOn: string;
  ours?: true;
}

/**
 * Ours, in the shape the comparison tables print. One constant, so the ranked
 * comparison and the no-bank-login table cannot describe us differently.
 */
export const FUNDKEEP: Competitor = {
  name: SITE.name,
  url: RELEASE.appStoreUrl ?? '/',
  price: PRICING.full,
  priceNote: `${PRICING.note}. Free for the first ${TRIAL.days} days.`,
  availability: `On the App Store. ${RELEASE.platforms}.`,
  source: 'our own App Store listing',
  bestFor: 'Keeping the envelope method on iPhone, iPad and Mac, bought once',
};

export const NO_BANK_LOGIN_APPS: readonly NoBankLoginApp[] = [
  {
    ...ACTUAL_BUDGET,
    bank: 'optional',
    bankNote:
      'Bank integration is optional and off until you set it up with one of its data providers. Even then it fetches only when you ask. Otherwise you type transactions or import CSV, QIF, OFX or QFX files.',
    runsOn: 'The web, Windows, Mac and Linux',
  },
  {
    ...ENVY,
    bank: 'never',
    bankNote: 'Manual by design: you type your transactions.',
    runsOn: 'iPhone and iPad; on a Mac, as the iPad app',
  },
  {
    ...FUNDKEEP,
    ours: true,
    bank: 'never',
    bankNote: 'You type transactions, or import the CSV file your bank gives you.',
    runsOn: RELEASE.platforms,
  },
  {
    ...GOODBUDGET,
    bank: 'optional',
    bankNote:
      'Only on the Premium plan, only with US banks, and through Plaid. On the free and Plus plans you type transactions or import QFX, OFX or CSV files.',
    runsOn: 'iPhone, Android and the web',
  },
  {
    ...MONEYCOACH,
    bank: 'optional',
    bankNote:
      'Only with Premium, and only for European banks; UK banks are not supported. Otherwise you type transactions or import a CSV file.',
    runsOn: 'iPhone, iPad, Mac and Apple Watch',
  },
  {
    ...PENNIES,
    bank: 'never',
    bankNote: 'No bank connection at all, in its developer’s own words.',
    runsOn: 'iPhone, iPad and Apple Watch',
  },
  {
    ...SKWAD,
    bank: 'optional',
    bankNote:
      'The DIY plan needs no bank login: it reads the alert emails your bank already sends. The LINK plan connects through Plaid.',
    runsOn: 'iPhone, iPad, Android and the web',
  },
] as const;

/**
 * Budget apps you buy once — the table on /budget-app-one-time-purchase.
 *
 * The search results for "budget app one time purchase" are a forum thread and
 * a few small blogs: nobody owns the phrase, and it is what this app is. The
 * page exists for that, and this list is what it may print.
 *
 * Rule of entry, the same as everywhere else here: how an app charges has to
 * come from the company's own page or Apple's own listing, read on the date in
 * COMPETITORS_CHECKED — these five are the same constants that table prints. Two well-known desktop apps are missing for exactly
 * that reason — their sites answered with an empty shell on 26.09.2026, and an
 * app we cannot quote is an app we do not name.
 */
export interface OneTimeApp {
  app: Competitor;
  /**
   * What one purchase costs here, when that is not the app's headline price.
   * MoneyCoach's headline is "Free" because its free tier is real; the figure
   * this page is about is the one that buys it outright.
   */
  priceHere?: string;
  /** Why the figure above is that figure, if it needs a word. */
  priceHereNote?: string;
  /**
   * Whether the reader pays again, and for what. This is the column the page
   * is really about.
   *
   * The first version of this table had "Payment" here, which said "One
   * purchase" for every row and so distinguished nothing — it left price as
   * the only column that varied, and a page about payment models turned into
   * a price ladder. Two of the apps below sell a version and then sell the
   * next one; that is the fact a person choosing between buying and renting
   * needs, and it is invisible in a price.
   */
  paidAgain: string;
  /** Where it runs — and, where it matters, what the phone app actually is. */
  runsOn: string;
}

export const ONE_TIME_APPS: readonly OneTimeApp[] = [
  // Ours first, because this is our site and the row says so. The rest run
  // from nothing to $199.99, in that order: a rule a reader can check, rather
  // than an order that flatters us.
  {
    app: FUNDKEEP,
    paidAgain: 'No',
    runsOn: RELEASE.platforms,
  },
  {
    app: ACTUAL_BUDGET,
    paidAgain: 'No — you run the server instead',
    runsOn: 'The web, Windows, Mac and Linux',
  },
  {
    app: ENVY,
    paidAgain: 'No',
    runsOn: 'iPhone and iPad; on a Mac, as the iPad app',
  },
  {
    app: ZEROED,
    paidAgain: 'No',
    runsOn: 'iPhone, iPad, Mac, Windows and Android',
  },
  {
    app: MONEYDANCE,
    paidAgain: 'Not for this version',
    runsOn: 'Mac, Windows and Linux. The phone app needs the desktop one',
  },
  {
    app: MONEYSPIRE,
    priceHere: '$59.99',
    priceHereNote: 'a sale price that day, down from $99.99',
    paidAgain: 'Yes — a new major version yearly, at $49.99',
    runsOn: 'Mac and Windows. The phone app is a companion to it',
  },
  {
    app: MONEYCOACH,
    priceHere: '$199.99',
    priceHereNote: 'Lifetime Premium; the free tier costs nothing',
    paidAgain: 'No, at that price. Otherwise a subscription',
    runsOn: 'iPhone, iPad, Mac and Apple Watch',
  },
] as const;

/** All of NO_BANK_LOGIN_APPS was read on this date, as one sweep. */
export const NO_BANK_LOGIN_CHECKED = {
  on: '2026-09-13',
  display: '13 September 2026',
  recheckBy: '2026-12-13',
} as const;

/**
 * Shown at the top of /privacy. Bump both fields together whenever the policy
 * text changes — the policy itself promises a new date on every revision.
 */
export const PRIVACY_UPDATED = {
  // 13.09.2026, twice: a paragraph saying that Safari's App Store banner
  // exists, and "no content delivery network" replaced — it was literally
  // untrue, the site is served by Cloudflare, which is one. The штаб's wording:
  // no third-party CDN for fonts, scripts or images.
  display: '13 September 2026',
  machine: '2026-09-13',
} as const;

/**
 * Hosts a page is allowed to fetch anything from — which is this site, and
 * nothing else (SPEC §9: zero third-party requests, checked rather than
 * intended).
 *
 * `src/build/hq-guards.ts` reads the built HTML and CSS and fails on any
 * stylesheet, script, image, font or preconnect pointing somewhere else. It
 * deliberately does not look at ordinary links in prose: linking to Apple's
 * refund page is a link a person clicks, not a request a page makes.
 *
 * There is no phrase blacklist here on purpose. A grep for "connects to your
 * bank" would fire on the sentence we most want to publish — the one that
 * says it does not — and a guard that punishes the truth teaches people to
 * work around guards.
 */
export const ALLOWED_ASSET_HOSTS: readonly string[] = [
  'fundkeep.app',
  'fundkeep.pages.dev',
];
