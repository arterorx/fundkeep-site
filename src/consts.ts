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
};

const ACTUAL_BUDGET: Competitor = {
  name: 'Actual Budget',
  url: 'https://actualbudget.org',
  price: 'Free',
  priceNote: 'open source. Syncing between devices means running a server.',
  availability:
    'Not an App Store app. You run it yourself, which is the whole idea.',
  source: 'the project itself',
};

const ZEROED: Competitor = {
  name: 'Zeroed',
  url: 'https://www.stillwareltd.com/zeroed',
  // Null until 13.09.2026, when the only figure on their site was a founder's
  // offer. The page now prints the price that follows it as well, with the
  // date the offer ends — a promotional price with an end date and the price
  // after it is a price we can print.
  price: '$19.99',
  priceNote:
    'a founder price until 14 February 2027, then $39.99, paid once after a 34-day trial.',
  availability:
    'Not on the App Store: Apple’s catalogue returns nothing for it in any storefront we checked, and its own page says iOS is coming soon. On Google Play and the Microsoft Store, and as a download for Mac and Windows.',
  source: 'their own site, and Apple’s catalogue for availability',
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
};

const GOODBUDGET: Competitor = {
  name: 'Goodbudget',
  url: 'https://goodbudget.com',
  price: 'Free',
  priceNote:
    'a free plan with 10 regular and 10 more envelopes and one account. Plus is $8 a month or $70 a year; Premium, the plan with bank sync, is $10 a month or $80 a year. Prices from its own website.',
  availability: 'On the App Store for iPhone, and on Android and the web.',
  source: 'its own website and help pages',
};

const PENNIES: Competitor = {
  name: 'Pennies',
  url: 'https://www.getpennies.com',
  price: null,
  priceNote:
    'free to download. Apple’s US listing shows annual subscriptions at several prices, and we could not find what a subscription adds, so we print none.',
  availability: 'On the App Store. iPhone, iPad and Apple Watch.',
  source: 'its own website, and Apple’s App Store listing',
};

const SKWAD: Competitor = {
  name: 'Skwad',
  url: 'https://skwad.app',
  price: '$49 a year',
  priceNote:
    'for DIY, which syncs from your bank’s email alerts; LINK, with bank linking, is $65 a year. Billed monthly they are $6 and $8. No free plan.',
  availability: 'On the App Store for iPhone and iPad, on Android, and on the web.',
  source: 'its own pricing page, and Apple’s App Store listing',
};

export const COMPETITORS: readonly Competitor[] = [
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
  },
  ENVY,
  ACTUAL_BUDGET,
  ZEROED,
  MONEYCOACH,
] as const;

/**
 * All five were read on this date. They move as one because they are re-read
 * as one — a single sweep is a task somebody will actually do, where five
 * separate dates would rot at five different speeds.
 */
export const COMPETITORS_CHECKED = {
  // Re-read as one on 13.09.2026. Zeroed now prints the price after its
  // founder offer, and MoneyCoach's note claimed Apple publishes no in-app
  // purchase prices, which it does; both were corrected in the same sweep.
  on: '2026-09-13',
  display: '13 September 2026',
  recheckBy: '2026-12-13',
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
    name: SITE.name,
    url: '/',
    price: PRICING.full,
    priceNote: `${PRICING.note}. Free for the first ${TRIAL.days} days.`,
    availability: `On the App Store. ${RELEASE.platforms}.`,
    source: 'our own App Store listing',
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
