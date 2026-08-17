import { DOMAIN } from '../src/consts.ts';

/**
 * Sends the automatic *.pages.dev address to the real domain — but only once
 * there is a real domain to send it to.
 *
 * Cloudflare Pages gives every project a `<project>.pages.dev` hostname and
 * keeps serving it after a custom domain is attached. On the sister site
 * roomkeep.app that duplicate answered 200 with the whole site on it. The
 * canonical tag already points at the right host, so search engines are being
 * told the truth — but a second address that answers 200 is a trap that had to
 * be closed by hand on an earlier site, and a 301 says it in a way nothing has
 * to interpret.
 *
 * THE GATE MATTERS MORE THAN THE REDIRECT. `DOMAIN.live` is false until
 * fundkeep.app is attached and serving. While it is false this function does
 * nothing at all, because `*.pages.dev` is then the only address the site has
 * — redirecting it to a domain that does not answer yet would take the site
 * down, including the two URLs filed with Apple. Reading the flag here rather
 * than hardcoding a hostname is what keeps SPEC §6's promise literally true:
 * switch day is one line in src/consts.ts, and this turns itself on.
 *
 * Why this and not the other two options:
 *  - `_redirects` cannot do it. Its source field is a path; Cloudflare's own
 *    documentation lists domain-level redirects as unsupported.
 *  - Bulk Redirects (the documented method) live in the dashboard, not in this
 *    repository, so they cannot be reviewed, reverted or diffed with the code
 *    they affect.
 *
 * The cost is that every request now passes through this function, including
 * the two URLs Apple's reviewer opens. So it is written to fail open: any
 * error at all falls through to the static asset. The worst case is that the
 * duplicate keeps answering, which is where we started — never that
 * `/privacy` stops.
 */
export async function onRequest(context) {
  try {
    if (!DOMAIN.live) return context.next();

    const url = new URL(context.request.url);

    if (url.hostname.endsWith('.pages.dev')) {
      const target = new URL(url.pathname + url.search, DOMAIN.production);

      // Built by hand rather than with `Response.redirect()`, which returns an
      // immutable response. Pages then tries to attach the rules from
      // `public/_headers` to it and throws, and the visitor gets a 500 instead
      // of a redirect. Caught by driving this locally with the switch flipped
      // — the code reads fine either way.
      return new Response(null, {
        status: 301,
        headers: { Location: target.toString() },
      });
    }
  } catch {
    // Fall through: serving the page matters more than tidying a hostname.
  }

  return context.next();
}
