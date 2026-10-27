// sovtech-www: picks the language for "/" and nothing else. wrangler.jsonc routes only "/" here
// (assets.run_worker_first); /es/, the stylesheet, images and 404s are served straight from public/.
//
//   /?lang=en|es  the language switch on each page: remember the choice in a cookie, then go to
//                 that language's page
//   /             cookie lang=es -> /es/, lang=en -> English; no cookie -> /es/ only when
//                 Accept-Language ranks Spanish above English (no header, as crawlers send: English)
//
// Cloudflare does not apply public/_headers to responses a Worker returns, so the same security
// headers are set here. Keep SECURITY_HEADERS in step with the /* block in public/_headers.

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// Redirect targets are fixed, never built from the request.
const HOME = { en: "/", es: "/es/" };
const ONE_YEAR = 60 * 60 * 24 * 365;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/" || (request.method !== "GET" && request.method !== "HEAD")) {
      return env.ASSETS.fetch(request);
    }

    const chosen = url.searchParams.get("lang");
    if (chosen === "en" || chosen === "es") {
      return redirect(
        HOME[chosen],
        `lang=${chosen}; Path=/; Max-Age=${ONE_YEAR}; Secure; HttpOnly; SameSite=Lax`,
      );
    }

    const lang = cookieLang(request.headers.get("Cookie")) ?? preferredLang(request.headers.get("Accept-Language"));
    if (lang === "es") return redirect(HOME.es);

    const page = await env.ASSETS.fetch(request);
    return withHeaders(new Response(page.body, page));
  },
};

function cookieLang(header) {
  for (const part of (header ?? "").split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === "lang" && (value === "en" || value === "es")) return value;
  }
  return null;
}

// The highest q-value wins; a tie, or no Spanish at all, stays English.
function preferredLang(header) {
  let en = 0;
  let es = 0;
  for (const item of (header ?? "").split(",")) {
    const [tag, ...params] = item.trim().toLowerCase().split(";");
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam === undefined ? 1 : Number(qParam.slice(2));
    if (!(q > 0 && q <= 1)) continue; // q=0 means "not acceptable"; NaN is junk
    const primary = tag.split("-")[0];
    if (primary === "en") en = Math.max(en, q);
    else if (primary === "es") es = Math.max(es, q);
  }
  return es > en ? "es" : "en";
}

function redirect(location, cookie) {
  const headers = new Headers({ Location: location, "Cache-Control": "private, no-store" });
  if (cookie) headers.set("Set-Cookie", cookie);
  return withHeaders(new Response(null, { status: 302, headers }));
}

function withHeaders(response) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}
