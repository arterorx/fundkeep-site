/**
 * The build emits flat files (`/privacy.html`), so at build time
 * `Astro.url.pathname` is `/privacy.html` while the address everyone actually
 * visits — Apple's reviewer included — is `/privacy`. Left alone, that puts the
 * wrong URL in every canonical and og:url tag.
 *
 * This normalises a pathname to the served address, and gives the same answer
 * in `astro dev` (where the pathname has no extension) as in `astro build`.
 */
export function canonicalPath(pathname: string): string {
  let path = pathname;

  if (path.endsWith('/index.html')) {
    path = path.slice(0, -'index.html'.length);
  } else if (path.endsWith('.html')) {
    path = path.slice(0, -'.html'.length);
  }

  // Collapse any trailing slash except on the root itself.
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path === '' ? '/' : path;
}
