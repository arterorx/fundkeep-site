/**
 * Serves `dist/` the way Cloudflare will: clean URLs, the real `_headers`
 * file, and a 404 page with a 404 status.
 *
 * `astro preview` does none of that. On sawkit.app that gap shipped a broken
 * page to production — a script that worked on localhost and was blocked by
 * the Content-Security-Policy on the live site, because the preview server
 * never read `_headers`. Anything that depends on the CSP has to be checked
 * against this server before it is pushed.
 *
 *     npm run build && npm run serve
 *
 * Node's standard library only; this is a development tool, not a dependency.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'dist');
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

/**
 * Parses Cloudflare's `_headers`: a path pattern in column 1, then indented
 * `Name: value` lines. Only the `*` wildcard is supported, which is all this
 * site uses.
 */
async function loadHeaderRules() {
  let text;
  try {
    text = await readFile(join(ROOT, '_headers'), 'utf8');
  } catch {
    console.warn('no _headers in the build output — serving without them');
    return [];
  }

  const rules = [];
  let current = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: [] };
      rules.push(current);
      continue;
    }
    const at = raw.indexOf(':');
    if (current && at > 0) {
      current.headers.push([raw.slice(0, at).trim(), raw.slice(at + 1).trim()]);
    }
  }
  return rules;
}

function matches(pattern, path) {
  const rx = new RegExp(
    '^' +
      pattern
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      '$',
  );
  return rx.test(path);
}

async function readIfFile(path) {
  try {
    if ((await stat(path)).isFile()) return await readFile(path);
  } catch {
    /* not there */
  }
  return null;
}

const rules = await loadHeaderRules();

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  // No traversal out of dist.
  const target = resolve(join(ROOT, path));
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  // Cloudflare serves /privacy from privacy.html, and / from index.html.
  const candidates =
    path === '/'
      ? [join(ROOT, 'index.html')]
      : [target, `${target}.html`, join(target, 'index.html')];

  let body = null;
  let hit = null;
  for (const candidate of candidates) {
    body = await readIfFile(candidate);
    if (body) {
      hit = candidate;
      break;
    }
  }

  let status = 200;
  if (!body) {
    status = 404;
    body = (await readIfFile(join(ROOT, '404.html'))) ?? Buffer.from('Not found');
    hit = join(ROOT, '404.html');
  }

  for (const rule of rules) {
    if (matches(rule.pattern, path)) {
      for (const [name, value] of rule.headers) res.setHeader(name, value);
    }
  }
  res.setHeader('Content-Type', TYPES[extname(hit)] ?? 'application/octet-stream');
  res.writeHead(status).end(body);
});

server.listen(PORT, () => {
  console.log(`dist/ on http://localhost:${PORT} with ${rules.length} header rules`);
});
