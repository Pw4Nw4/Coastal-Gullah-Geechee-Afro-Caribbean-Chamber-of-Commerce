// Serves the chamber website and its API (Node 20+, no dependencies). Built for Coolify but runs anywhere.
//   GET  /, *.html, /css/*, /js/*, /images/*   the site (nothing else in the repo is ever served)
//   POST /api/checkout                         start a Stripe Checkout session for a membership
//   POST /api/forms                            save an email signup, contact message or chat question
//   GET  /admin/submissions.csv[?form=...]     download saved submissions (Basic auth, password = ADMIN_TOKEN)
//   GET  /healthz                              health check
// Environment: PORT, SITE_URL, STRIPE_SECRET_KEY, ADMIN_TOKEN, FORMS_WEBHOOK_URL, DATA_DIR, NOINDEX (see .env.example).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const { createCheckout } = require("./checkout");
const { saveSubmission, submissionsCsv } = require("./forms");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv.find((a) => a.startsWith("--port="))?.slice(7) || process.env.PORT || 3000);
const PUBLIC = /^\/(?:[\w-]+\.html|(?:css|js|images)\/[\w-]+(?:\.[\w-]+)+)$/;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
};
const COMPRESS = new Set([".html", ".css", ".js", ".svg"]);

// Cache busting. Pages are always served fresh, but Cloudflare and browsers keep CSS, JS and images for hours, so a
// deploy could pair new pages with old styles and scripts. Every css/js/images URL in a page gets ?v=<hash of all
// of them>, so any change to an asset changes the URLs; requests carrying the current version are cached for a year.
const VERSION = (() => {
  const hash = crypto.createHash("sha1");
  for (const dir of ["css", "js", "images"]) {
    for (const name of fs.readdirSync(path.join(ROOT, dir)).sort()) {
      const file = path.join(ROOT, dir, name);
      if (fs.statSync(file).isFile()) hash.update(name).update(fs.readFileSync(file));
    }
  }
  return hash.digest("hex").slice(0, 10);
})();
const versionUrls = (html) => html.replace(/((?:href|src)="(?:css|js|images)\/[\w-]+(?:\.[\w-]+)+)"/g, `$1?v=${VERSION}"`);
const SECURITY = {
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "SAMEORIGIN",
  // NOINDEX=true while the site is only a preview, so search engines don't list its sample content
  ...(/^(1|true|yes)$/i.test(process.env.NOINDEX || "") && { "X-Robots-Tag": "noindex, nofollow" }),
};

const json = (res, status, body) => {
  res.writeHead(status, { ...SECURITY, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};

const notFound = (res) => {
  res.writeHead(404, { ...SECURITY, "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found</title>
<body style="font:17px/1.6 system-ui,sans-serif;color:#13153a;max-width:34rem;margin:15vh auto;padding:0 1rem">
<h1 style="font-family:Georgia,serif;color:#232856">We couldn't find that page.</h1>
<p>It may have moved. Start from the <a href="/" style="color:#007081">home page</a> or call 912-417-9591.</p></body>`);
};

async function serveStatic(req, res, pathname, version) {
  if (pathname === "/") pathname = "/index.html";
  if (!PUBLIC.test(pathname)) return notFound(res);
  let body;
  try { body = await fs.promises.readFile(path.join(ROOT, pathname)); } catch { return notFound(res); }
  const ext = path.extname(pathname);
  if (ext === ".html") body = Buffer.from(versionUrls(body.toString("utf8")));
  const cache = ext === ".html" ? "no-cache" : version === VERSION ? "public, max-age=31536000, immutable" : "public, max-age=3600";
  const headers = { ...SECURITY, "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": cache };
  if (COMPRESS.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    body = zlib.gzipSync(body);
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
  }
  res.writeHead(200, { ...headers, "Content-Length": body.length });
  res.end(req.method === "HEAD" ? undefined : body);
}

// Reads a request body up to 16 KB. A larger body is drained and refused, so the visitor still gets a reply.
function readBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => { size += c.length; if (size <= limit) chunks.push(c); });
    req.on("end", () => (size > limit
      ? reject(Object.assign(new Error("Body too large"), { status: 413 }))
      : resolve(Buffer.concat(chunks).toString("utf8"))));
    req.on("error", reject);
  });
}

const parseBody = (req, raw) => ((req.headers["content-type"] || "").includes("application/json")
  ? JSON.parse(raw || "{}")
  : Object.fromEntries(new URLSearchParams(raw)));

// Per-visitor cap on posts (20 per 10 minutes) so bots can't flood the inbox or Stripe.
const hits = new Map();
function limited(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(ip, recent);
  return recent.length > 20;
}

function authorized(req) {
  const token = process.env.ADMIN_TOKEN;
  const m = /^Basic (.+)$/.exec(req.headers.authorization || "");
  if (!token || !m) return false;
  const given = Buffer.from(Buffer.from(m[1], "base64").toString().split(":").slice(1).join(":"));
  const expected = Buffer.from(token);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

const baseUrl = (req) => (process.env.SITE_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`).replace(/\/$/, "");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/healthz") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }

    if (pathname === "/api/checkout" || pathname === "/api/forms") {
      if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
      if (limited(req)) return json(res, 429, { error: "Too many requests. Please wait a few minutes and try again." });
      const data = parseBody(req, await readBody(req));
      const [status, body] = pathname === "/api/checkout" ? await createCheckout(data, baseUrl(req)) : await saveSubmission(data);
      return json(res, status, body);
    }

    if (pathname === "/admin/submissions.csv") {
      if (!process.env.ADMIN_TOKEN) return notFound(res);
      if (!authorized(req)) {
        res.writeHead(401, { ...SECURITY, "WWW-Authenticate": 'Basic realm="Chamber submissions", charset="UTF-8"' });
        return res.end();
      }
      const only = url.searchParams.get("form");
      res.writeHead(200, {
        ...SECURITY, "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${only || "submissions"}-${new Date().toISOString().slice(0, 10)}.csv"`,
      });
      return res.end("﻿" + await submissionsCsv(only)); // the BOM makes Excel read the file as UTF-8
    }

    if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "Method not allowed." });
    return serveStatic(req, res, pathname, url.searchParams.get("v"));
  } catch (e) {
    if (res.headersSent) return res.end();
    if (e.status === 413) return json(res, 413, { error: "That's too long. Please shorten it and try again." });
    if (e instanceof SyntaxError) return json(res, 400, { error: "Invalid request." });
    if (e instanceof URIError) return notFound(res);
    console.error(e);
    return json(res, 500, { error: "Something went wrong. Please try again." });
  }
});

server.listen(PORT, () => console.log(`Chamber site listening on port ${PORT} (assets version ${VERSION})`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
