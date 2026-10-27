# www.sovtech.pro

Cameron's personal page: who I am, what I'm working on, and how to reach me.

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

## Preview

```sh
npm ci
npm run dev        # wrangler dev on 0.0.0.0:3000, runs src/index.js, applies _headers and _redirects
```

Check the language pick with
`curl -sI -H 'Accept-Language: es-SV,es;q=0.9' http://127.0.0.1:3000/` (expect a 302 to `/es/`).

## Deploy

```sh
npx wrangler deployments list          # note the current version id first
CLOUDFLARE_ACCOUNT_ID=<Sovereign IT> npm run deploy   # refuses anything but a clean main
```

Roll back with `npx wrangler rollback <version id>`.

The apex `sovtech.pro` is served elsewhere and redirects here; see the comment at the
top of `wrangler.jsonc`.
