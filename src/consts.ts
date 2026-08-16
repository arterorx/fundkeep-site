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
  price: '$109',
  period: 'a year',
  checkedOn: '2026-08-16',
  source: 'https://www.ynab.com/pricing',
  recheckBy: '2026-11-16',
} as const;

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
