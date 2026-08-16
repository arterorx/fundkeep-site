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
 * The domain switch — SPEC §6
 *
 * `fundkeep.app` is bought at the end of August 2026. Until then the site
 * lives on the free Cloudflare Pages address and is closed to search engines:
 * a temporary address that gets indexed has to be undone later with redirects
 * and canonical warnings, and both roomkeep.app and sawkit.app collected those.
 *
 * ON THE DAY THE DOMAIN IS BOUGHT, THIS IS THE WHOLE CHANGE:
 *
 *   1. Attach fundkeep.app to the Pages project in the Cloudflare dashboard.
 *   2. Set `live: true` below.
 *   3. Deploy, then submit the sitemap in Search Console.
 *
 * That one boolean moves the canonical and og:url tags to the real domain,
 * drops `noindex` from every page, opens `robots.txt`, and turns the sitemap
 * on. Nothing else in the repository mentions either address.
 * ========================================================================== */

export const DOMAIN = {
  /** False while the site lives on the temporary Pages address. */
  live: false,
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
 * It has to receive mail *before* the App Store submission: Apple files it as
 * the support contact and may write to it, and a reviewer writing to a
 * bouncing address is a rejection waiting to happen. `support@fundkeep.app`
 * cannot do that yet — the domain is not bought — so the штаб's call
 * (16.08.2026) is to publish an address that works today rather than to hold
 * the submission for the domain.
 *
 * When `fundkeep.app` is attached: turn on Cloudflare Email Routing, point
 * `support@fundkeep.app` at the same inbox, change this line, and update the
 * Support URL contact in App Store Connect. That is a metadata change, not a
 * new build.
 */
export const CONTACT_EMAIL = 'kargorage@gmail.com';

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
 * $109 a year: from the app repository's competitor table
 * (`Metadata/ProductReview.md`), which is where the штаб's own comparison
 * comes from. Verify against ynab.com/pricing before publishing any page that
 * shows it — no page does yet; the comparison arrives with SPEC §4 phase 3.
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
  checkedOn: '2026-08-16',
  /** The same date as a person would write it, for the caveat line. */
  checkedOnDisplay: '16 August 2026',
  source: 'https://www.ynab.com/pricing',
  recheckBy: '2026-11-16',
} as const;

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
  /** Where the figure was read, named on the page so it can be audited. */
  source: string;
}

export const COMPETITORS: readonly Competitor[] = [
  {
    name: 'YNAB',
    url: 'https://www.ynab.com/pricing',
    price: '$109',
    priceNote: 'a year, or $14.99 a month. 34-day trial.',
    source: "YNAB's own pricing page",
  },
  {
    name: 'Envy',
    url: 'https://apps.apple.com/us/app/envy-envelope-budget-planner/id1569230951',
    price: '$6.99',
    priceNote: 'free to download, one in-app purchase called Envy All Access.',
    source: "Apple's App Store listing",
  },
  {
    name: 'Actual Budget',
    url: 'https://actualbudget.org',
    price: 'Free',
    priceNote: 'open source. Syncing between devices means running a server.',
    source: 'the project itself',
  },
  {
    name: 'Zeroed',
    url: 'https://stillwareltd.com',
    price: null,
    priceNote:
      'a one-time purchase, but the only figure on their site today is a founder’s offer — a promotional price, which is exactly the kind that moves.',
    source: 'their own site',
  },
  {
    name: 'MoneyCoach',
    url: 'https://moneycoach.ai',
    price: null,
    priceNote:
      'free to download with a Premium subscription. Their site prints no price, and the store listings we found disagreed with each other, so we are not printing one either.',
    source: 'their own site and Apple',
  },
] as const;

/**
 * All five were read on this date. They move as one because they are re-read
 * as one — a single sweep is a task somebody will actually do, where five
 * separate dates would rot at five different speeds.
 */
export const COMPETITORS_CHECKED = {
  on: '2026-08-16',
  display: '16 August 2026',
  recheckBy: '2026-11-16',
} as const;

/** How the site writes money. One formatter, so nothing rounds differently. */
export const money = (amount: number): string =>
  amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
 * Release status.
 *
 * The app is not on the App Store: this site is what unblocks the submission,
 * not the other way round (SPEC §1). So the status carries no month, no year
 * and not the word "soon" — a status without a date cannot go stale, it can
 * only go out of date, and `recheckBy` is what catches that.
 *
 * When it ships: set `state` to 'released' and fill in `appStoreUrl`. The
 * build refuses to finish if one is done without the other.
 */
export const RELEASE = {
  state: 'unreleased' as 'unreleased' | 'released',
  /** The only sentence on the whole site about timing. */
  status: 'Not on the App Store yet',
  platforms: 'iPhone, iPad and Mac',
  /** Minimum OS, read from the app's own build settings (Config/Shared.xcconfig). */
  requires: 'iOS 26, iPadOS 26 or macOS 26',
  /** App ID 6801904284, registered 2026-08-15. Published only once it is live. */
  appStoreUrl: null as string | null,
  /**
   * Look at `status` again by this date. The build prints a warning once it
   * passes — see `src/build/hq-guards.ts`.
   */
  recheckBy: '2026-11-01',
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
 * Shown at the top of /privacy. Bump both fields together whenever the policy
 * text changes — the policy itself promises a new date on every revision.
 */
export const PRIVACY_UPDATED = {
  display: '16 August 2026',
  machine: '2026-08-16',
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
