import type { AstroIntegration } from 'astro';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_ASSET_HOSTS,
  CALCULATOR,
  COMPETITORS,
  COMPETITORS_CHECKED,
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
        for (const rival of COMPETITORS) {
          for (const amount of `${rival.price ?? ''} ${rival.priceNote}`.match(
            /\$\d[\d,]*(?:\.\d{2})?/g,
          ) ?? []) {
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

          for (const amount of text.match(/\$\d[\d,]*(?:\.\d{2})?/g) ?? []) {
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
            const at = Math.max(0, m.index - 30);
            problems.push(
              `${name}: missing space around an inline element — ` +
                `"…${html.slice(at, m.index + m[0].length).replace(/\s+/g, ' ')}…". ` +
                `Astro eats the newline; write {' '} where the space belongs.`,
            );
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
