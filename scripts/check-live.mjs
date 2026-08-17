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

if (problems.length) {
  console.error(
    `\nThe live site differs from the build in ${problems.length} way` +
      `${problems.length === 1 ? '' : 's'}:\n  - ${problems.join('\n  - ')}\n`,
  );
  process.exit(1);
}

console.log(`${PAGES.length} pages: the edge serves what the build produced.`);
