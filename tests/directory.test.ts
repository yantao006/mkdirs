import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { evaluate, parse } from "groq-js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import {
  buildDirectoryQuery,
  normalizePage,
  normalizeSearchParams,
  safeExternalUrl,
} from "../src/lib/directory-query";
import {
  itemFullInfoBySlugQuery,
  itemInfoBySlugQuery,
  itemSimpleFields,
} from "../src/sanity/lib/queries";

const dataset = [
  {
    _id: "category-tools",
    _type: "category",
    name: "Tools",
    slug: { current: "tools" },
  },
  { _id: "tag-web", _type: "tag", name: "Web", slug: { current: "web" } },
  { _id: "collection-web", _type: "collection", slug: { current: "web" } },
  ...Array.from({ length: 26 }, (_, index) => ({
    _id: `resource-${String(index).padStart(2, "0")}`,
    _type: "item",
    name: `Resource ${index}`,
    slug: { current: `resource-${index}` },
    publishDate: "2025-01-01T00:00:00Z",
    categories: [{ _ref: "category-tools" }],
    tags: [{ _ref: "tag-web" }],
    collections: [{ _ref: "collection-web" }],
    featured: index === 1,
    sponsor: index === 0,
  })),
  {
    _id: "unpublished",
    _type: "item",
    name: "Unpublished",
    slug: { current: "unpublished" },
  },
  {
    _id: "hidden",
    _type: "item",
    slug: { current: "hidden" },
    publishDate: "2025-01-01T00:00:00Z",
    forceHidden: true,
  },
  {
    _id: "future",
    _type: "item",
    slug: { current: "future" },
    publishDate: "2999-01-01T00:00:00Z",
  },
];
async function run(
  query: string,
  params: Record<string, unknown> = {},
  data: Record<string, unknown>[] = dataset,
) {
  return (
    await evaluate(parse(query, { params }), { dataset: data, params })
  ).get();
}

test("page and repeated URL parameters are bounded and deterministic", () => {
  for (const value of [
    undefined,
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    0,
    1.5,
    "-1",
    "1e3",
    "no",
    "99999999999999999",
    ["2", "3"],
  ])
    assert.equal(normalizePage(value), 1);
  assert.equal(normalizePage("2"), 2);
  assert.deepEqual(normalizeSearchParams({ q: ["one", "two"], page: "2" }), {
    q: "",
    page: "2",
  });
});

test("query inputs never become GROQ expressions", async () => {
  const injection = '"] || _type == "user" || name == "';
  const built = buildDirectoryQuery(
    {
      query: injection,
      category: injection,
      tag: injection,
      filter: injection,
      sortKey: injection,
    },
    "_id",
  );
  assert.ok(!built.dataQuery.includes(injection));
  assert.equal(await run(built.countQuery, built.params), 0);
  const unfiltered = buildDirectoryQuery({ filter: injection }, "_id");
  assert.equal(await run(unfiltered.countQuery, unfiltered.params), 26);
});

test("filters combine and unknown filter expressions are ignored", async () => {
  const built = buildDirectoryQuery(
    {
      category: "tools",
      tag: "web,web",
      collection: "web",
      filter: "featured==true",
    },
    "_id",
  );
  assert.equal(await run(built.countQuery, built.params), 1);
  assert.deepEqual(await run(built.dataQuery, built.params), [
    { _id: "resource-01" },
  ]);
});

test("pagination has no gaps or duplicates, including formerly sponsored records", async () => {
  const ids: string[] = [];
  for (const currentPage of [1, 2, 3]) {
    const built = buildDirectoryQuery({ currentPage }, "_id");
    const rows = await run(built.dataQuery, built.params);
    assert.equal(rows.length, currentPage === 3 ? 2 : 12);
    ids.push(...rows.map((row: { _id: string }) => row._id));
  }
  assert.equal(new Set(ids).size, 26);
  assert.ok(ids.includes("resource-00"));
});

test("list, detail and metadata do not expose unpublished, future or hidden items", async () => {
  const built = buildDirectoryQuery({}, "_id");
  assert.equal(await run(built.countQuery, built.params), 26);
  for (const slug of ["unpublished", "hidden", "future", "missing"]) {
    assert.equal(await run(itemFullInfoBySlugQuery, { slug }), null);
    assert.equal(await run(itemInfoBySlugQuery, { slug }), null);
  }
});

test("public card projection excludes user credentials, email, orders and private notes", async () => {
  const records = [
    {
      _id: "user-test",
      _type: "user",
      name: "Public name",
      email: "private@example.test",
      password: "fake-password-hash",
      access_token: "fake-token",
      image: null,
      link: "https://example.test/",
    },
    {
      _id: "resource",
      _type: "item",
      submitter: { _ref: "user-test" },
      note: "private-note",
      order: { _ref: "private-order" },
      rejectionReason: "private-reason",
    },
  ];
  const result = await run(
    `*[_type == "item"] { ${itemSimpleFields} }`,
    {},
    records,
  );
  const json = JSON.stringify(result);
  for (const secret of [
    "private@example",
    "fake-password",
    "fake-token",
    "private-note",
    "private-order",
    "private-reason",
    '"password"',
    '"email"',
  ])
    assert.ok(!json.includes(secret), secret);
  assert.ok(json.includes("Public name"));
});

test("external URLs only allow http(s) without embedded credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "https://user:password@example.test",
    "broken",
    null,
  ])
    assert.equal(safeExternalUrl(value), null);
  assert.equal(
    safeExternalUrl("https://example.test/?a=1"),
    "https://example.test/?a=1",
  );
});

test("directory Markdown does not execute expressions or render arbitrary HTML", () => {
  const html = renderToStaticMarkup(
    createElement(
      ReactMarkdown,
      { skipHtml: true },
      '{globalThis.__mkdirs_probe = "executed"}\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert)',
    ),
  );
  assert.equal(
    (globalThis as Record<string, unknown>).__mkdirs_probe,
    undefined,
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
});

test("starter catalog is unique, sourced, and contains only public content", async () => {
  const content = JSON.parse(
    await readFile(
      new URL("../content/directory.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(
    new Set(content.map((item: { slug: string }) => item.slug)).size,
    content.length,
  );
  assert.ok(content.length > 12);
  for (const item of content) {
    assert.ok(safeExternalUrl(item.url));
    assert.ok(item.description.length > 20);
    assert.deepEqual(
      Object.keys(item).sort(),
      [
        "slug",
        "name",
        "url",
        "description",
        "category",
        "tags",
        "collection",
      ].sort(),
    );
  }
});
