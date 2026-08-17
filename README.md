# fundkeep.app

The marketing site for **Fundkeep** — envelope budgeting for iPhone, iPad and
Mac. Astro, static output, no client-side JavaScript, deployed to Cloudflare
Pages.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # writes dist/, and runs the guards below
npm run serve    # serves dist/ the way Cloudflare will, _headers included
npm run check    # TypeScript and Astro diagnostics
```

`npm run serve` exists because `astro preview` ignores `public/_headers`. The
Content-Security-Policy is only real on the served build, and a page that works
under `preview` can still be broken in production.

```bash
npm run check:live    # what the edge actually serves
```

Run it after every deploy, and after any change to Cloudflare settings. The
build guards read `dist/`, so they can only check what we wrote — and
Cloudflare rewrites pages on the way out. Its Email Address Obfuscation, on by
default, once turned every `mailto:` on this site into a script and rendered
the support address as "[email protected]" for anyone without JavaScript,
while every build guard passed. On a machine whose DNS is behind, pass
`-- --resolve <ip>`.

## One file holds the facts

`src/consts.ts` is the single source of truth for the price, the release
status, the contact address, the platforms and the trial. Nothing that appears
on a page is typed into a template — change it there, and the build checks that
the pages agree.

## The domain switch

The site currently lives on `fundkeep.pages.dev` and is **closed to search
engines**: a temporary address that gets indexed has to be undone later with
redirects and canonical warnings.

On the day `fundkeep.app` is bought, the whole change is:

1. Attach the domain to the Pages project in the Cloudflare dashboard.
2. Set `DOMAIN.live = true` in `src/consts.ts`.
3. Deploy, then submit the sitemap in Search Console.

Two things that are not the switch and have to be done by hand the same day:
turn on Cloudflare Email Routing and move `CONTACT_EMAIL` to the address on the
new domain, and change the Privacy Policy, Support and Marketing URLs in App
Store Connect. Both are metadata, not a new build.

That one boolean moves every canonical and `og:url` to the real domain, drops
`noindex` from every page, opens `robots.txt`, and turns the sitemap on. No
other file names either address.

## What the build refuses to publish

`src/build/hq-guards.ts` fails the build on:

- **A price that is not in `src/consts.ts`.** Every `$` amount in the rendered
  text is checked against the constants.
- **A page open to indexing while the address is temporary**, a `robots.txt`
  that disagrees with the switch, or a sitemap emitted while the site is
  closed.
- **A request to anybody else's server** — stylesheet, script, image, font.
  Links in prose are left alone; a link a person clicks is not a request the
  page makes.
- An intro price with no end date, a release status and store URL that were
  changed one without the other, more or fewer than one `<h1>`, a meta
  description over 155 characters, and a word run into a `<strong>` or an `<a>`
  with the space eaten.

It warns, rather than failing, when the release status or the competitor price
recorded in `src/consts.ts` is due a re-read.

## The savings calculator

`/ynab-alternative` compares a subscription with a one-time purchase over a
number of years. The arithmetic is `savings()` in `src/consts.ts` and it has
three readers: the page renders a correct table at build time, the client
script recomputes it from data attributes handed to it, and the build guard
derives from it the set of amounts the page is allowed to contain. The script
holds no prices of its own.

Without JavaScript the slider is not shown and the table still states five
years correctly. `public/savings-calculator.js` is a file rather than an inline
script so the CSP can stay `script-src 'self'`.

## Images

`public/apple-touch-icon.png` and `public/og.png` are generated:

```bash
python3 scripts/make-images.py
```

The icon is the app's own drawing transcribed into vector and Pillow, not a
bitmap copied out of the app repository — which stays read-only and out of this
repository entirely.

The app screenshots are resized from the store captures:

```bash
python3 scripts/make-screens.py
```

Read the comment at the top of that script before adding a frame. It records
which captures were rejected and why — including a folder of screenshots from
the previous design that look like ordinary ones.

## Not in this repository

`SPEC.md`, `CLAUDE.md` and `PROGRESS.md` are internal working documents and are
listed in `.gitignore`. This repository is public, and history cannot be
cleaned after the fact.
