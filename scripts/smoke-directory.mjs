import assert from "node:assert/strict";

const origin = process.env.SMOKE_ORIGIN;
assert.ok(origin, "Set SMOKE_ORIGIN to the deployed HTTPS origin");
assert.equal(new URL(origin).protocol, "https:");
const results = [];
async function request(path, expected, options = {}) {
  const response = await fetch(new URL(path, origin), {
    ...options,
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  assert.equal(response.status, expected, `${path}: unexpected HTTP status`);
  results.push({
    path,
    status: response.status,
    mime: response.headers.get("content-type"),
  });
  return { response, body };
}

const { body: home } = await request("/", 200);
assert.match(home, /Directory resources/);
assert.doesNotMatch(
  home,
  /__name\(/,
  "serialized theme script must be self-contained",
);
assert.doesNotMatch(
  home,
  /<span[^>]+href=/,
  "pagination must not use non-navigable spans",
);
for (const path of [
  "/item/not-a-directory-entry",
  "/category/not-a-category",
  "/tag/not-a-tag",
  "/collection/not-a-collection",
  "/not-a-page",
  "/auth/login",
  "/api/auth/session",
]) {
  await request(path, 404);
}
for (const path of [
  "/api/webhook",
  "/api/send-email",
  "/api/upload-image",
  "/",
]) {
  await request(path, 405, {
    method: "POST",
    body: "{}",
    headers: { "content-type": "application/json" },
  });
}
const { body: sitemap } = await request("/sitemap.xml", 200);
assert.match(sitemap, /<urlset/);
assert.ok(sitemap.includes(`${origin}/item/`));
const { body: robots } = await request("/robots.txt", 200);
assert.ok(robots.includes(`${origin}/sitemap.xml`));
const { response: og } = await request("/directory-og.png", 200);
assert.match(og.headers.get("content-type"), /^image\/png/);
const { body: empty } = await request(
  "/?q=mkdirs-smoke-no-results-951437",
  200,
);
assert.match(empty, /No matching resources/);
console.log(JSON.stringify({ origin, results }, null, 2));
