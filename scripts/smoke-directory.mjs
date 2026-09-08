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
  assert.ok(
    (Array.isArray(expected) ? expected : [expected]).includes(response.status),
    `${path}: unexpected HTTP status ${response.status}`,
  );
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
]) {
  await request(path, 404);
}
for (const path of [
  "/auth/login",
  "/auth/register",
  "/auth/reset",
  "/pricing",
  "/blog",
]) {
  await request(path, 200);
}
const { body: session } = await request("/api/auth/session", 200);
assert.ok(
  [null, undefined].includes(JSON.parse(session)?.user),
  "anonymous request must not receive a user",
);
for (const path of ["/dashboard", "/settings", "/submit"]) {
  const { response } = await request(path, [302, 307], { redirect: "manual" });
  assert.match(response.headers.get("location"), /\/auth\/login/);
}
for (const path of ["/api/send-email", "/api/upload-image"]) {
  await request(path, 403, {
    method: "POST",
    body: "{}",
    headers: {
      "content-type": "application/json",
      origin: "https://example.invalid",
    },
  });
}
await request("/api/upload-image", [401, 503], {
  method: "POST",
  body: "{}",
  headers: { "content-type": "application/json", origin },
});
await request("/api/webhook", [400, 503], { method: "POST", body: "{}" });
// 503 means explicitly unconfigured, not an accepted upload/payment or an end-to-end pass.
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
