import type { AstroIntegration } from 'astro';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_ASSET_HOSTS,
  CALCULATOR,
  COMPETITORS,
  COMPETITORS_CHECKED,
  MARKETS,
  MARKET_RIVALS,
  NO_BANK_LOGIN_APPS,
  ONE_TIME_APPS,
  NO_BANK_LOGIN_CHECKED,
  YNAB_PRICE_HISTORY,
  DOMAIN,
  INDEXABLE,
  LAUNCH_PRICE,
  PRICING,
  RELEASE,
  YNAB,
  money,
  savings,
} from '../consts.js';

/**
 * Build-time checks that turn the rules of SPEC §5, §6 and §9 into something
 * the machine enforces instead of something a person has to remember.
 *
 * They exist because of what happened on the previous two sites: a release
 * status kept in page text drifted from reality, an intro price that outlived
 * its App Store schedule would have turned a page into a false claim, and a
 * temporary address got indexed and had to be undone with redirects. All three
 * were caught by hand, late. A check that only runs when somebody remembers to
 * run it is not a check.
 *
 * Most are hard failures rather than warnings. A wrong price, a page open to
 * Google before the real domain exists, and a request to somebody else's
 * server are the three things this site is forbidden to publish, so they stop
 * the build rather than scroll past in a log nobody reads.
 */

/** Today, as YYYY-MM-DD in local time. */
function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function filesUnder(dir: string, extension: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...filesUnder(path, extension));
    else if (entry.endsWith(extension)) found.push(path);
  }
  return found;
}

/** Rendered text, with tags and JSON-LD stripped. */
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Every URL on the page that causes the browser to fetch something.
 *
 * Deliberately not `<a href>`: linking to Apple's refund page is a link a
 * person clicks, not a request the page makes. `<link>` hrefs are included
 * because stylesheets and preconnects live there — a canonical tag pointing at
 * our own domain passes the host check anyway.
 */
function subresourceUrls(html: string): string[] {
  const withoutData = html.replace(
    /<script[^>]*type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi,
    ' ',
  );

  const urls: string[] = [];
  const patterns = [
    /<link\b[^>]*\bhref=["']([^"']+)["']/gi,
    /\bsrc=["']([^"']+)["']/gi,
    /\bsrcset=["']([^"']+)["']/gi,
    /\bposter=["']([^"']+)["']/gi,
  ];
  for (const pattern of patterns) {
    for (const match of withoutData.matchAll(pattern)) {
      // srcset holds a comma-separated list of "url descriptor" pairs.
      for (const part of match[1]!.split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (url) urls.push(url);
      }
    }
  }

  for (const style of withoutData.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    urls.push(...cssUrls(style[1]!));
  }

  return urls;
}

function cssUrls(css: string): string[] {
  const urls: string[] = [];
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)/gi)) {
    urls.push(match[1]!.trim());
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?["']([^"']+)/gi)) {
    urls.push(match[1]!.trim());
  }
  return urls;
}

/** Is this URL served by somebody else? `data:` and relative paths are ours. */
function isThirdParty(url: string): boolean {
  if (!/^(https?:)?\/\//i.test(url)) return false;
  const host = url
    .replace(/^https?:/i, '')
    .replace(/^\/\//, '')
    .split(/[/?#]/)[0]!
    .toLowerCase();
  return !ALLOWED_ASSET_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function hqGuards(): AstroIntegration {
  return {
    name: 'fundkeep:hq-guards',
    hooks: {
      'astro:build:start': ({ logger }) => {
        // 1. An intro price with no end date cannot be published (SPEC §5).
        //    The type already forbids it; this catches a cast.
        if (LAUNCH_PRICE && !LAUNCH_PRICE.endsOn) {
          throw new Error(
            'LAUNCH_PRICE has an amount but no end date. A reduced price may ' +
              'not be named without the date it ends, and not at all until ' +
              'the schedule exists in App Store Connect.',
          );
        }

        // 2. Released without a link, or linked without being released. Either
        //    way the pages would describe a store listing that is not there.
        if (RELEASE.state === 'released' && !RELEASE.appStoreUrl) {
          throw new Error(
            'RELEASE.state is "released" but appStoreUrl is null. Set both ' +
              'together in src/consts.ts, or neither.',
          );
        }
        if (RELEASE.state === 'unreleased' && RELEASE.appStoreUrl) {
          throw new Error(
            'RELEASE.appStoreUrl is set but state is still "unreleased". ' +
              'Set both together in src/consts.ts, or neither.',
          );
        }

        // 3. Two dates that are due a look. Warnings rather than failures:
        //    neither fact becomes false on the day the date passes, it becomes
        //    unverified, and that is a different thing.
        if (today() > RELEASE.recheckBy) {
          logger.warn(
            `RELEASE.status is "${RELEASE.status}" and was due a check on ` +
              `${RELEASE.recheckBy}. Confirm it is still true, then move ` +
              `recheckBy in src/consts.ts.`,
          );
        }
        if (today() > COMPETITORS_CHECKED.recheckBy) {
          logger.warn(
            `The named competitors were last checked on ` +
              `${COMPETITORS_CHECKED.on} and were due a sweep on ` +
              `${COMPETITORS_CHECKED.recheckBy}. Re-read each first-party ` +
              `source in COMPETITORS (src/consts.ts) and move the date. We ` +
              `name these companies, so a stale figure is a false statement ` +
              `about somebody else's product.`,
          );
        }

        if (today() > NO_BANK_LOGIN_CHECKED.recheckBy) {
          logger.warn(
            `The apps on /blog/budget-app-without-bank-sync were read on ` +
              `${NO_BANK_LOGIN_CHECKED.on} and are due a sweep. Re-read each ` +
              `first-party source in NO_BANK_LOGIN_APPS and move the date — ` +
              `prices and bank-connection terms are both claims about named ` +
              `companies.`,
          );
        }

        if (today() > YNAB.recheckBy) {
          logger.warn(
            `${YNAB.name}'s price is recorded as ${YNAB.price} ${YNAB.period}, ` +
              `checked ${YNAB.checkedOn}. Re-read ${YNAB.source} and move ` +
              `recheckBy in src/consts.ts. We name this company, so a stale ` +
              `number here is a false statement about them (SPEC §5).`,
          );
        }

        if (!INDEXABLE) {
          logger.info(
            `building for ${DOMAIN.temporary} — every page gets noindex and ` +
              `robots.txt stays closed (SPEC §6). Flip DOMAIN.live in ` +
              `src/consts.ts on the day fundkeep.app is attached.`,
          );
        }
      },

      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = filesUnder(root, '.html');
        const problems: string[] = [];

        const allowedAmounts = new Set<string>([
          PRICING.full,
          YNAB.price,
          money(YNAB.monthly),
        ]);
        /* Euro and yen, on the translated pages. Without this the guard read
           only dollars, so a German page could print any figure it liked and
           the build would say "prices match src/consts.ts" — the check would
           have been decorative exactly where prices are hardest to verify by
           eye. Every amount comes from MARKETS and MARKET_RIVALS, which were
           read on each storefront. */
        for (const market of Object.values(MARKETS)) {
          allowedAmounts.add(market.full);
        }
        if (LAUNCH_PRICE) allowedAmounts.add(LAUNCH_PRICE.amount);

        /**
         * Other companies' prices, allowed only on a page that declares it
         * names them.
         *
         * Scoped rather than global on purpose. A competitor's price could one
         * day be the same figure as a promotional price of ours that the штаб
         * has not authorised — put every amount in one global set and the
         * guard would wave that through anywhere on the site. Here it can only
         * appear on a page that has said, in its own front matter, that
         * naming competitors is what it is for.
         */
        const competitorAmounts = new Set<string>();
        /* Dollars, euros and yen — the same three forms the page scan below
           looks for. Reading only dollars here is what let four correct euro
           figures fail the build on 26.09.2026: they were in src/consts.ts,
           but this never took them out of it. */
        const MONEY = /\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{3})*,\d{2}\s?€|¥\d+(?:,\d{3})*/g;
        const add = (text: string) => {
          for (const amount of text.match(MONEY) ?? []) {
            competitorAmounts.add(amount.replace(/\s?€/, ' €'));
          }
        };
        for (const rival of [...COMPETITORS, ...NO_BANK_LOGIN_APPS]) {
          add(`${rival.price ?? ''} ${rival.priceNote}`);
        }
        // Apps that appear only in the one-time table — Moneydance and
        // Moneyspire are not in COMPETITORS, and on 26.09.2026 that alone
        // blocked the build. An app named in any table on this site has to
        // feed this set, or the guard punishes adding a row rather than
        // inventing a number.
        for (const market of Object.values(MARKETS)) {
          add(`${market.ynabYear} ${market.ynabMonth}`);
        }
        for (const list of Object.values(MARKET_RIVALS)) {
          for (const rival of list) add(rival.price);
        }
        for (const entry of ONE_TIME_APPS) {
          add(`${entry.app.price ?? ''} ${entry.app.priceNote} ${entry.priceHere ?? ''} ${entry.priceHereNote ?? ''} ${entry.paidAgain}`);
        }
        // YNAB's past prices, for /ynab-pricing. Same scope as the rest: only
        // on a page that declares it prints another company's prices.
        for (const row of YNAB_PRICE_HISTORY) {
          for (const amount of `${row.price} ${row.note}`.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) ?? []) {
            competitorAmounts.add(amount);
          }
        }

        // The savings calculator prints arithmetic rather than constants, so
        // the allowed set has to include every figure that arithmetic can
        // produce — computed here by the same function the page uses, never
        // by copying numbers across. A total that this loop cannot produce is
        // a total somebody typed by hand, and that is exactly what should
        // fail.
        for (
          let years = CALCULATOR.minYears;
          years <= CALCULATOR.maxYears;
          years++
        ) {
          const row = savings(years);
          allowedAmounts.add(money(row.annual));
          allowedAmounts.add(money(row.monthly));
          allowedAmounts.add(money(row.saved));
          allowedAmounts.add(money(row.once));
        }

        for (const page of pages) {
          const html = readFileSync(page, 'utf8');
          const text = visibleText(html);
          const name = page.slice(root.length);

          // --- Money (SPEC §9) ---------------------------------------------
          // Every amount on the page has to be one of ours. Prices that
          // disagree with src/consts.ts break the build rather than quietly go
          // out on the live site — including a promotional price that has not
          // been switched on in LAUNCH_PRICE.
          //
          // This reads `text`, which is the rendered words with tags stripped,
          // so alt text is deliberately out of scope: alt describes a
          // screenshot, and the screenshots are full of demo-budget figures
          // ($670.00 to assign, $1,600.00 of rent) that are not prices and
          // must not be in the allow-list. Nothing can tell a demo figure from
          // a price claim automatically, so alt text stays the author's
          // responsibility — write what the picture shows, never an offer.

          const namesCompetitors = html.includes(
            '<meta name="fundkeep:competitor-prices" content="yes">',
          );
          const pageAmounts = namesCompetitors
            ? new Set([...allowedAmounts, ...competitorAmounts])
            : allowedAmounts;

          // A comma belongs to a number only when three digits follow it: the
          // first version took the comma in "Since $60, and" as part of the
          // price and failed a correct page.
          //
          // Sums in the millions and billions are left alone: no app on this
          // site costs one, and they appear only where a page reports a court
          // settlement or a company's figures. Carved out narrowly and in the
          // open, so that nobody has to write "58 million dollars" to get a
          // true sentence past a price check.
          /* Three currencies, because the site is published in four
             languages and Apple prices per region: "$39.99" in the United
             States is "44,99 €" in Germany and "¥6,000" in Japan. The euro
             form is written after the number with a non-breaking space, which
             is how Apple writes it and how MARKETS stores it. */
          const amounts = [
            ...(text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?(?!\d|\s*(?:million|billion)\b)/g) ?? []),
            ...(text.match(/\d+(?:\.\d{3})*,\d{2}\s?€/g) ?? []).map((raw) =>
              raw.replace(/\s?€/, ' €'),
            ),
            ...(text.match(/¥\d+(?:,\d{3})*/g) ?? []),
          ];
          for (const amount of amounts) {
            if (!pageAmounts.has(amount)) {
              problems.push(
                `${name}: price ${amount} is not in src/consts.ts` +
                  (namesCompetitors ? '' : ', and this page does not declare that it names competitors') +
                  `. Allowed here: ${[...pageAmounts].join(', ')}.`,
              );
            }
          }

          // --- Indexing (SPEC §6) ------------------------------------------
          const robotsMeta = html.match(
            /<meta name="robots" content="([^"]*)"/,
          )?.[1];
          if (!INDEXABLE && !robotsMeta?.includes('noindex')) {
            problems.push(
              `${name}: no noindex while the site is on the temporary address. ` +
                `Every page carries it until DOMAIN.live is true (SPEC §6).`,
            );
          }
          if (INDEXABLE && robotsMeta?.includes('noindex') && !name.includes('404')) {
            problems.push(
              `${name}: still carries noindex although DOMAIN.live is true. ` +
                `Only /404 may stay out of the index.`,
            );
          }

          // --- Third-party requests (SPEC §9) ------------------------------
          // "Zero third-party requests" is a claim /privacy makes in writing.
          // Checked here, and again by the CSP in public/_headers.
          for (const url of subresourceUrls(html)) {
            if (isThirdParty(url)) {
              problems.push(
                `${name}: fetches ${url} from somebody else's server. The site ` +
                  `promises zero third-party requests (SPEC §9).`,
              );
            }
          }

          // --- Release (SPEC §3) --------------------------------------------
          // A released call to action that rendered without its link is the
          // "not on the App Store yet" failure in a different costume: the
          // reader reaches the moment of buying and finds nothing to press.
          // Counted per page, so every block has to bring its own link. The
          // app was on sale for eleven days while this site said otherwise;
          // the constant made the fix one line, and this makes sure the line
          // actually reached the page.
          if (RELEASE.state === 'released' && RELEASE.appStoreUrl) {
            const ctas = html.match(/<div class="cta[\s"]/g)?.length ?? 0;
            /* Any address of OUR listing counts, not one exact string: the
               translated pages send the reader to their own storefront
               (apps.apple.com/de/app/id…), which is the same app and the
               storefront whose price the page just printed. The id is what is
               checked, so a button pointing at somebody else's app still
               fails. */
            const id = RELEASE.appStoreUrl.match(/\/id(\d+)/)?.[1];
            const links = id
              ? (html.match(
                  new RegExp(`href="https://apps\\.apple\\.com/[^"]*id${id}\\b[^"]*"`, 'g'),
                )?.length ?? 0)
              : 0;
            if (links < ctas) {
              problems.push(
                `${name}: ${ctas} call-to-action block(s) but ${links} link(s) ` +
                  `to a storefront address for id${id}. RELEASE says the app ` +
                  `is on sale, so every call to action has to lead to it.`,
              );
            }
          }

          // --- Dates -------------------------------------------------------------
          // No page may be dated after the day it is built. On 13.09.2026 two
          // live pages said "updated 14 September" and "last checked on 14
          // September": the штаб numbers its task documents by day of a plan,
          // and those numbers were copied onto the pages as if they were the
          // calendar. A check dated in the future is not a check.
          for (const m of html.matchAll(
            /(?:datetime="|"date(?:Published|Modified)":"|name="fundkeep:sources-checked" content=")(\d{4}-\d{2}-\d{2})/g,
          )) {
            if (m[1]! > today()) {
              problems.push(
                `${name}: dated ${m[1]}, after today (${today()}). Dates on a page ` +
                  `record when something happened — use the calendar, not a plan's numbering.`,
              );
            }
          }

          // --- Apple's banner and badge ----------------------------------------
          // The Smart App Banner on every page while the app is on sale, with
          // the same ID as the buttons — and nowhere while it is not, because
          // a banner for an app that is not in the store is a promise the page
          // cannot keep.
          const bannerId = html.match(
            /<meta name="apple-itunes-app" content="app-id=(\d+)"/,
          )?.[1];
          const listingId = RELEASE.appStoreUrl?.match(/\/id(\d+)/)?.[1];
          if (RELEASE.state === 'released' && bannerId !== listingId) {
            problems.push(
              `${name}: Smart App Banner app-id is ${bannerId ?? 'missing'}, ` +
                `but RELEASE.appStoreUrl points at id${listingId}.`,
            );
          }
          if (RELEASE.state === 'unreleased' && bannerId) {
            problems.push(
              `${name}: carries a Smart App Banner while RELEASE says the app ` +
                `is not on sale.`,
            );
          }

          // Apple: "Use one App Store badge per layout." A second call to
          // action on a page is the text variant of AppStoreCta.
          const badges = html.match(/src="\/badges\/app-store-[a-z-]+\.svg"/g)?.length ?? 0;
          if (badges > 1) {
            problems.push(
              `${name}: ${badges} App Store badges. Apple's guidelines allow ` +
                `one per layout — make the later ones <AppStoreCta variant="text" />.`,
            );
          }

          // Every file a page loads from this site has to exist in the build.
          // A missing badge is not an error anyone sees — it is a call to
          // action that silently isn't there.
          for (const url of subresourceUrls(html)) {
            if (!url.startsWith('/') || url.startsWith('//')) continue;
            const path = url.split(/[?#]/)[0]!;
            if (!existsSync(join(root, path))) {
              problems.push(`${name}: loads ${path}, which is not in the build.`);
            }
          }

          // A year in a title is a claim that the page is current. Warned, not
          // failed: the page does not become false on New Year's Day, it
          // becomes unchecked — re-read the sources, then move the year.
          const titleText = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
          for (const year of titleText.match(/\b20\d\d\b/g) ?? []) {
            if (Number(year) < Number(today().slice(0, 4))) {
              logger.warn(
                `${name}: the title says ${year}. Re-check the page's sources ` +
                  `before changing the year — the year is what promises they are current.`,
              );
            }
          }

          // --- Structure ----------------------------------------------------
          const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
          if (h1s !== 1) {
            problems.push(
              `${name}: ${h1s} <h1> elements; there must be exactly one.`,
            );
          }

          const meta = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
          if (!meta) {
            problems.push(`${name}: no meta description.`);
          } else if (meta.length > 155) {
            problems.push(
              `${name}: meta description is ${meta.length} characters, over 155.`,
            );
          }

          // An article whose facts have not been re-read in a year. A warning
          // rather than a failure: the page does not become false on the
          // anniversary, it becomes unverified, and that is a different thing.
          // It matters more here than it would elsewhere, because these
          // articles state things about a named company's product.
          const checked = html.match(
            /<meta name="fundkeep:sources-checked" content="([\d-]+)"/,
          )?.[1];
          if (checked) {
            const due = new Date(checked);
            due.setFullYear(due.getFullYear() + 1);
            if (today() > due.toISOString().slice(0, 10)) {
              logger.warn(
                `${name}: sources last checked ${checked}, over a year ago. ` +
                  `Re-read it, then move sourcesCheckedOn in the front matter.`,
              );
            }
          }

          // A word run straight into a link or a <strong>, with the space
          // eaten. Astro collapses the newline between a word and an element
          // on the next line, so this happens by writing perfectly ordinary
          // markup — and it is nearly invisible when proof-reading. Three of
          // them shipped to production on roomkeep.app before this existed.
          //
          // The third alternative below is an inline element closing directly
          // onto a link. That is how the breadcrumb lost its space —
          // "Fundkeep ›Articles" — and the first two alternatives could not
          // see it, because the character before the link was a `>` rather
          // than a letter. Only the eye caught it.
          //
          // It is deliberately narrow: only a link on the right-hand side, and
          // no block tags at all. `<li><a>` is ordinary markup, and two spans
          // butted together are how the slider's end labels sit at opposite
          // ends of a flex row — the first draft of this rule failed the build
          // on both.
          for (const m of html.matchAll(
            /([a-zA-Z,;:])<(?:a|strong|code|em)[\s>]|<\/(?:a|strong|code|em)>([a-zA-Z])|<\/(?:a|span|strong|code|em)><a[\s>]/g,
          )) {
            /* Japanese does not put spaces between words, so "高い。</strong>
               Zeroed は" is correctly set with nothing between the tag and the
               next word — the rule above is about English run-ons and has no
               meaning across a CJK character. Checked on the text either side
               of the match rather than on the page's language, so an English
               sentence inside a Japanese page is still checked. */
            const CJK = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uff9f]/;
            const near = html.slice(Math.max(0, m.index - 2), m.index + m[0].length + 2);
            if (CJK.test(near)) continue;
            const at = Math.max(0, m.index - 30);
            problems.push(
              `${name}: missing space around an inline element — ` +
                `"…${html.slice(at, m.index + m[0].length).replace(/\s+/g, ' ')}…". ` +
                `Astro eats the newline; write {' '} where the space belongs.`,
            );
          }
        }

        // --- The listing, where it has to be --------------------------------
        // Named rather than inferred, because counting call-to-action blocks
        // passes trivially on a page that lost its block altogether. The home
        // page (SPEC §3 puts the button on the first screen), /ynab-alternative
        // (the page this site exists for), /support (filed with Apple, and
        // opened by people deciding whether to buy), and every article.
        if (RELEASE.state === 'released' && RELEASE.appStoreUrl) {
          // Articles too, from 13.09.2026: they are where search traffic
          // lands, and until then not one of them led to the store.
          const articles = pages
            .map((page) => page.slice(root.length))
            .filter((name) => name.startsWith('blog/'));
          for (const required of ['index.html', 'ynab-alternative.html', 'ynab-pricing.html', 'budget-app-one-time-purchase.html', 'support.html', ...articles]) {
            const path = join(root, required);
            if (!existsSync(path)) {
              problems.push(`${required} was not emitted.`);
            } else if (
              !readFileSync(path, 'utf8').includes(`href="${RELEASE.appStoreUrl}"`)
            ) {
              problems.push(
                `${required}: the app is on sale but this page does not link ` +
                  `to ${RELEASE.appStoreUrl}.`,
              );
            }
          }
        }

        // --- robots.txt and the sitemap (SPEC §6) ---------------------------
        const robotsPath = join(root, 'robots.txt');
        if (!existsSync(robotsPath)) {
          problems.push('robots.txt was not emitted.');
        } else {
          const robots = readFileSync(robotsPath, 'utf8');
          if (!INDEXABLE) {
            if (!/^\s*Disallow:\s*\/\s*$/m.test(robots)) {
              problems.push(
                'robots.txt does not say "Disallow: /" while the site is on ' +
                  'the temporary address (SPEC §6).',
              );
            }
            if (/Sitemap:/i.test(robots)) {
              problems.push(
                'robots.txt names a sitemap while the site is closed. A ' +
                  'sitemap is an invitation, and we are not sending one yet.',
              );
            }
            if (existsSync(join(root, 'sitemap-index.xml'))) {
              problems.push(
                'a sitemap was emitted while the site is closed to indexing.',
              );
            }
          } else {
            if (!/Sitemap:/i.test(robots)) {
              problems.push(
                'DOMAIN.live is true but robots.txt names no sitemap.',
              );
            }
            if (!existsSync(join(root, 'sitemap-index.xml'))) {
              problems.push('DOMAIN.live is true but no sitemap was emitted.');
            }
          }
        }

        // --- Third-party requests from the stylesheets ----------------------
        for (const sheet of filesUnder(root, '.css')) {
          for (const url of cssUrls(readFileSync(sheet, 'utf8'))) {
            if (isThirdParty(url)) {
              problems.push(
                `${sheet.slice(root.length)}: loads ${url} from somebody ` +
                  `else's server (SPEC §9).`,
              );
            }
          }
        }

        if (problems.length) {
          throw new Error(
            `Build blocked by ${problems.length} ` +
              `problem${problems.length === 1 ? '' : 's'}:\n  - ` +
              problems.join('\n  - '),
          );
        }

        logger.info(
          `checked ${pages.length} pages: prices match src/consts.ts, ` +
            `no third-party requests, ` +
            `${INDEXABLE ? 'open to indexing' : 'closed to indexing'}`,
        );
      },
    },
  };
}
