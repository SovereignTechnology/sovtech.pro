# www.sovtech.pro

Cam's personal page: who I am, what I'm working on, and how to reach me.

It is one page in two languages, `public/index.html` (English, `/`) and
`public/es/index.html` (Spanish, `/es/`, Salvadoran voseo), plus one stylesheet, served
as-is by the Cloudflare Worker `sovtech-www` with no build step. No JavaScript on the
pages, no web fonts, no third-party requests; `public/_headers` sets a CSP that enforces
that. **Change both pages together**: same sections, same links.

The only Worker code is `src/index.js`, and it runs for `/` alone
(`assets.run_worker_first`). It sends a browser that prefers Spanish to `/es/`, and the
"English · Español" switch on each page goes through `/?lang=en|es`, which stores the
choice in a `lang` cookie so the switch sticks. Cloudflare does not apply
`public/_headers` to Worker responses, so the Worker sets the same security headers
itself: **change them in both places**.

Everything in `public/` is published as it sits on disk, including files git ignores.
`public/.assetsignore` keeps the usual secret and editor files out; don't park anything
else there.

## Logo

The top bar on every page shows the Sovereign Technology wordmark, from the logo set's
`horizontal/svg/sovereign-technology_name-only_horizontal_black.svg`. The two copies in
`public/logo/` have their coordinates rounded to whole units and a fill that matches the
page text: `sovereign-technology.svg` uses the light theme's `--text`, and
`sovereign-technology-dark.svg` (for the dark theme) uses the dark one. If `--text` changes
in `style.css`, change the fill in that file too. A `<picture>` picks the file by the
visitor's colour scheme, the same way the stylesheet does.

## Search and sharing

- **Structured data.** Each page ends its `<head>` with one `application/ld+json` block
  describing the site, the page, me and the company. The company's `makesOffer` lists the
  nine groups in "Work with me" → "Everything I do", in the same order and under the same
  names as the bold labels there: change the list and `makesOffer` together, on both pages.
  It is data, not script: the CSP does not apply to it, and the pages still run no
  JavaScript. Keep the two pages' blocks in step, and only state what the page itself says
  (Google's rule; it also indexes the text inside the collapsed `<details>`). `@id`s are absolute (`https://www.sovtech.pro/#org` and so on) so both
  pages describe the same entities.
- **Titles and descriptions.** Titles stay within 60 characters and descriptions within
  155, so search results show them whole. `og:description` repeats the description.
- **Share card.** `public/share.jpg` (1200×630) is the link preview (`og:image`,
  `summary_large_image`). It was drawn once from `og.jpg`, the wordmark and Noto Sans; if
  the photo or wordmark changes, redraw it. `og.jpg` stays as the photo in the structured
  data, and `public/logo/sovereign-technology.png` is the company logo there.
- **Section anchors.** Each `h2` has an `id` (English and Spanish slugs), and the old
  `/services` URLs land on `/#work-with-me` (`public/_redirects`).
- **Caching.** Images get `max-age=86400` in `public/_headers`; HTML and CSS stay at
  `max-age=0` so a deploy shows at once.
- **IndexNow.** `npm run deploy` ends with `postdeploy`, which posts the two page URLs
  from `indexnow.json` to `api.indexnow.org` (shared with Bing, Yandex, Seznam and Naver).
  The key in `public/<key>.txt` is public by design; it only proves the ping comes from
  this site. If a new page is added, add it to `indexnow.json` and `sitemap.xml`.
- **robots.txt** is Cloudflare's managed one (search allowed, AI training blocked), with
  our `Sitemap:` line kept at the end. Indexing is watched in Google Search Console and
  Bing Webmaster Tools, as a domain property for `sovtech.pro` (Cam's accounts).

## Preview

```sh
npm ci
npm run dev        # wrangler dev on 0.0.0.0:3000, runs src/index.js, applies _headers and _redirects
```

Check the language pick with
`curl -sI -H 'Accept-Language: es-SV,es;q=0.9' http://127.0.0.1:3000/` (expect a 302 to `/es/`).

## Staging

`staging.sovtech.pro` is a second Worker, `sovtech-www-staging` (`env.staging` in
`wrangler.jsonc`), for looking at a branch before it goes to main. It serves the same
`public/`, but every path runs through `src/index.js`, which adds the security headers and
`X-Robots-Tag: noindex` so search engines leave the copy alone.

```sh
CLOUDFLARE_ACCOUNT_ID=<Sovereign IT> npm run deploy:staging   # any branch, committed tree only
```

It does not ping IndexNow. Staging keeps whatever was deployed last, so after a release it
may show an older or newer branch than www.

## Deploy

```sh
npx wrangler deployments list          # note the current version id first
CLOUDFLARE_ACCOUNT_ID=<Sovereign IT> npm run deploy   # refuses anything but a clean main
```

Roll back with `npx wrangler rollback <version id>`.

The apex `sovtech.pro` is served elsewhere and redirects here; see the comment at the
top of `wrangler.jsonc`.
