# www.sovtech.pro

Cameron's personal page: who I am, what I'm working on, and how to reach me.

It is one HTML page and one stylesheet in `public/`, served as-is by the Cloudflare
Worker `sovtech-www` (static assets only, no Worker code, no build step). No
JavaScript, no web fonts, no third-party requests; `public/_headers` sets a CSP that
enforces that.

Everything in `public/` is published as it sits on disk, including files git ignores.
`public/.assetsignore` keeps the usual secret and editor files out; don't park anything
else there.

## Preview

```sh
npm ci
npm run dev        # wrangler dev on 0.0.0.0:3000, applies _headers and _redirects
```

## Deploy

```sh
npx wrangler deployments list          # note the current version id first
CLOUDFLARE_ACCOUNT_ID=<Sovereign IT> npm run deploy   # refuses anything but a clean main
```

Roll back with `npx wrangler rollback <version id>`.

The apex `sovtech.pro` is served elsewhere and redirects here; see the comment at the
top of `wrangler.jsonc`.
