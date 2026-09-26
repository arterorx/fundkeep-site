/**
 * Checks what the edge actually serves, not what the build produced.
 *
 *     node scripts/check-live.mjs
 *     node scripts/check-live.mjs --resolve 104.21.72.176   # stale DNS cache
 *
 * WHY THIS EXISTS. `src/build/hq-guards.ts` reads `dist/`, so it can only
 * check what we wrote. On 17.08.2026 Cloudflare's Email Address Obfuscation —
 * a Scrape Shield default nobody switched on deliberately — rewrote every
 * deployed page: `mailto:` links became `/cdn-cgi/l/email-protection`, the
 * address rendered as "[email protected]" for anyone without JavaScript, and
 * a Cloudflare script was injected into all six pages. Every build guard
 * passed, because none of them looks at the live site.
 *
 * A site that promises "no third-party code" and whose support page exists to
 * hand over one address cannot verify either claim by reading its own output.
 * So this reads the served HTML and compares it with what was built.
 *
 * Run it after every deploy, and after any change to Cloudflare settings —
 * those change the site without touching this repository, which is exactly
 * the class of change nothing else here can see.
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const run = promisify(execFile);

const ORIGIN = 'https://fundkeep.app';
const PAGES = [
  ['/', 'index.html'],
  ['/privacy', 'privacy.html'],
  ['/support', 'support.html'],
  ['/blog', 'blog.html'],
  ['/ynab-alternative', 'ynab-alternative.html'],
  ['/ynab-pricing', 'ynab-pricing.html'],
  ['/budget-app-one-time-purchase', 'budget-app-one-time-purchase.html'],
  ['/blog/ynab-export-guide', 'blog/ynab-export-guide.html'],
  ['/blog/ynab-alternatives', 'blog/ynab-alternatives.html'],
  ['/blog/envelope-budgeting-without-a-subscription', 'blog/envelope-budgeting-without-a-subscription.html'],
  ['/blog/budget-app-without-bank-sync', 'blog/budget-app-without-bank-sync.html'],
  // The translated pages, from 26.09.2026. They carry prices in euros and yen
  // that no English page can check, and a badge and a storefront link of their
  // own — three more things the edge could silently change.
  ['/de', 'de.html'],
  ['/de/haushaltsbuch-app-ohne-abo', 'de/haushaltsbuch-app-ohne-abo.html'],
  ['/fr', 'fr.html'],
  ['/fr/application-budget-sans-abonnement', 'fr/application-budget-sans-abonnement.html'],
  ['/ja', 'ja.html'],
  ['/ja/kakeibo-apuri-kaikiri', 'ja/kakeibo-apuri-kaikiri.html'],
  ['/de/ynab-alternative', 'de/ynab-alternative.html'],
  ['/de/beste-ynab-alternativen', 'de/beste-ynab-alternativen.html'],
  ['/fr/alternative-ynab', 'fr/alternative-ynab.html'],
  ['/fr/meilleures-alternatives-ynab', 'fr/meilleures-alternatives-ynab.html'],
  ['/ja/ynab-kara-norikae', 'ja/ynab-kara-norikae.html'],
  ['/ja/ynab-daitai-apuri', 'ja/ynab-daitai-apuri.html'],
  ['/de/ynab-preise', 'de/ynab-preise.html'],
  ['/fr/prix-ynab', 'fr/prix-ynab.html'],
  ['/ja/ynab-ryokin', 'ja/ynab-ryokin.html'],
  ['/de/ynab-daten-exportieren', 'de/ynab-daten-exportieren.html'],
  ['/fr/exporter-donnees-ynab', 'fr/exporter-donnees-ynab.html'],
  ['/ja/ynab-export', 'ja/ynab-export.html'],
  // The two pages Apple has on file, now in four languages. The English ones
  // stay the addresses filed with App Review; these are the same text for
  // readers who would otherwise have to take a policy on trust in a language
  // they do not read.
  ['/de/hilfe', 'de/hilfe.html'],
  ['/de/datenschutz', 'de/datenschutz.html'],
  ['/fr/assistance', 'fr/assistance.html'],
  ['/fr/confidentialite', 'fr/confidentialite.html'],
  ['/ja/support', 'ja/support.html'],
  ['/ja/privacy', 'ja/privacy.html'],
];

/** Apple's badge, in each language the site publishes. */
const BADGES = [
  'app-store-black.svg',
  'app-store-black-de.svg',
  'app-store-black-fr.svg',
  'app-store-black-ja.svg',
];

/** `--resolve IP` forces the address, for a machine whose DNS is behind. */
const resolveAt = process.argv.includes('--resolve')
  ? process.argv[process.argv.indexOf('--resolve') + 1]
  : null;

async function fetchPage(path) {
  const args = ['-s', '--max-time', '20'];
  if (resolveAt) args.push('--resolve', `fundkeep.app:443:${resolveAt}`);
  args.push(`${ORIGIN}${path}`);
  const { stdout } = await run('curl', args, { maxBuffer: 20_000_000 });
  return stdout;
}

const problems = [];
const note = (page, message) => problems.push(`${page}: ${message}`);

for (const [path, file] of PAGES) {
  let live;
  try {
    live = await fetchPage(path);
  } catch (error) {
    note(path, `could not be fetched — ${error.message}`);
    continue;
  }

  if (!live.trim()) {
    note(path, 'served an empty response');
    continue;
  }

  const built = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');

  // 1. Anything injected between the build and the browser. The site says in
  //    writing that it runs no third-party code; a script that arrives at the
  //    edge is still a script the reader executes.
  for (const marker of ['/cdn-cgi/scripts', '__cf_email__', 'email-protection']) {
    if (live.includes(marker) && !built.includes(marker)) {
      note(path, `the edge injected "${marker}" — it is not in dist/${file}`);
    }
  }

  // 2. Every mailto that was built has to survive to the reader. The support
  //    page exists to hand over an address; obfuscating it into a script
  //    breaks it for anyone without JavaScript.
  const builtMailto = new Set(built.match(/mailto:[^"']+/g) ?? []);
  const liveMailto = new Set(live.match(/mailto:[^"']+/g) ?? []);
  for (const link of builtMailto) {
    if (!liveMailto.has(link)) note(path, `lost the link ${link}`);
  }

  // 2b. The way to the store. A listing link that is in the build but not on
  //     the live page means the deploy did not land, or something rewrote the
  //     page on the way out. For eleven days in September 2026 the live site
  //     said the app was not out while it was on sale — this is the check
  //     that would have shown the build and the site disagreeing.
  const listing = /https:\/\/apps\.apple\.com\/app\/id\d+/g;
  const liveListing = new Set(live.match(listing) ?? []);
  for (const link of new Set(built.match(listing) ?? [])) {
    if (!liveListing.has(link)) note(path, `lost the App Store link ${link}`);
  }

  // 2c. The title and the headline the build wrote. The export guide was
  //     retitled for search on 13.09.2026 and the штаб checks the result by
  //     looking at the live page; this looks at every page, every deploy.
  const tag = (html, re) => html.match(re)?.[1]?.replace(/<[^>]+>/g, '').trim();
  for (const [label, re] of [['<title>', /<title>([\s\S]*?)<\/title>/], ['<h1>', /<h1[^>]*>([\s\S]*?)<\/h1>/]]) {
    if (tag(live, re) !== tag(built, re)) {
      note(path, `live ${label} is "${tag(live, re)}", the build has "${tag(built, re)}"`);
    }
  }

  // 2d. Apple's Smart App Banner, if the build put it there.
  const banner = /<meta name="apple-itunes-app" content="([^"]+)"/;
  if (built.match(banner) && live.match(banner)?.[1] !== built.match(banner)[1]) {
    note(path, 'lost the Smart App Banner on the way out');
  }

  // 3. The address has to be readable as text, not only linked.
  const readable = (html) => (html.match(/support@fundkeep\.app/g) ?? []).length;
  if (readable(live) < readable(built)) {
    note(
      path,
      `shows the address ${readable(live)} times, the build has it ` +
        `${readable(built)} — something is rewriting it`,
    );
  }

  // 4. The two tags the domain switch moves, checked where it counts.
  const canonical = live.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical?.startsWith(ORIGIN)) {
    note(path, `canonical is "${canonical}", not on ${ORIGIN}`);
  }
  if (/<meta name="robots"[^>]*noindex/.test(live)) {
    note(path, 'is still noindex on the live domain');
  }
}

// Every other hostname that reaches this project has to hand the reader back
// to the canonical one. This is checked separately from the pages above
// because it is the failure that arrives without a commit: attaching a
// hostname is a dashboard click, and on 17.08.2026 `www` was added and served
// 200 with the whole site until this caught it.
for (const host of ['www.fundkeep.app', 'fundkeep.pages.dev']) {
  try {
    const { stdout } = await run('curl', [
      '-s', '-o', '/dev/null', '--max-time', '20',
      '-w', '%{http_code} %{redirect_url}',
      `https://${host}/privacy`,
    ]);
    const [code, target] = stdout.trim().split(/\s+/);
    if (code !== '301') {
      note(host, `answers ${code} instead of redirecting — a second address serving the site`);
    } else if (target !== `${ORIGIN}/privacy`) {
      note(host, `redirects to "${target}", not ${ORIGIN}/privacy`);
    }
  } catch (error) {
    note(host, `could not be checked — ${error.message}`);
  }
}

// The two addresses filed with Apple have to answer in place. A redirect is
// not a failure a browser shows anybody, which is exactly why it has to be
// checked: App Review opens these, and so does anyone Apple sends there.
for (const path of ['/privacy', '/support']) {
  try {
    const args = ['-s', '-o', '/dev/null', '--max-time', '20', '-w', '%{http_code}'];
    if (resolveAt) args.push('--resolve', `fundkeep.app:443:${resolveAt}`);
    const { stdout } = await run('curl', [...args, `${ORIGIN}${path}`]);
    if (stdout.trim() !== '200') {
      note(path, `answers ${stdout.trim()}, not 200 in place — this URL is filed with Apple`);
    }
  } catch (error) {
    note(path, `could not be checked — ${error.message}`);
  }
}

// Apple's badge, served as it was downloaded. A missing or altered file is a
// call to action that is not there, and Apple's guidelines forbid modifying
// the artwork, so the check is byte for byte against the file in public/.
for (const badge of BADGES) try {
  const args = ['-s', '--max-time', '20', '-D', '-'];
  if (resolveAt) args.push('--resolve', `fundkeep.app:443:${resolveAt}`);
  const { stdout } = await run('curl', [...args, `${ORIGIN}/badges/${badge}`], {
    encoding: 'buffer',
    maxBuffer: 5_000_000,
  });
  const split = stdout.indexOf('\r\n\r\n');
  const head = stdout.subarray(0, split).toString();
  const body = stdout.subarray(split + 4);
  const local = await readFile(new URL(`../public/badges/${badge}`, import.meta.url));
  const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
  if (!/^HTTP\/\S+ 200/m.test(head)) {
    note(`/badges/${badge}`, `answers ${head.split('\r\n')[0]}`);
  } else if (!/content-type:\s*image\/svg\+xml/i.test(head)) {
    note(`/badges/${badge}`, 'is not served as image/svg+xml');
  } else if (sha(body) !== sha(local)) {
    note(`/badges/${badge}`, `differs from public/badges/${badge}`);
  }
} catch (error) {
  note(`/badges/${badge}`, `could not be checked — ${error.message}`);
}

// The address people guess for the sitemap, sent to the one Astro writes.
try {
  const args = ['-s', '-o', '/dev/null', '--max-time', '20', '-w', '%{http_code} %{redirect_url}'];
  if (resolveAt) args.push('--resolve', `fundkeep.app:443:${resolveAt}`);
  const { stdout } = await run('curl', [...args, `${ORIGIN}/sitemap.xml`]);
  const [code, target] = stdout.trim().split(/\s+/);
  if (code !== '301' || target !== `${ORIGIN}/sitemap-index.xml`) {
    note('/sitemap.xml', `answers "${stdout.trim()}", expected 301 to ${ORIGIN}/sitemap-index.xml`);
  }
} catch (error) {
  note('/sitemap.xml', `could not be checked — ${error.message}`);
}

if (problems.length) {
  console.error(
    `\nThe live site differs from the build in ${problems.length} way` +
      `${problems.length === 1 ? '' : 's'}:\n  - ${problems.join('\n  - ')}\n`,
  );
  process.exit(1);
}

console.log(`${PAGES.length} pages: the edge serves what the build produced.`);
