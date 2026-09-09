import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const contentPath = new URL("../content/directory.json", import.meta.url);
const items = JSON.parse(await readFile(contentPath, "utf8"));
const categories = {
  documentation: "Documentation",
  "languages-runtimes": "Languages & runtimes",
  "frameworks-ui": "Frameworks & UI",
  "developer-tools": "Developer tools",
  testing: "Testing",
};
const collections = {
  "learn-the-web": [
    "Learn the web",
    "Documentation and references for learning web development.",
  ],
  "web-development": [
    "Build for the web",
    "Languages, runtimes, and UI foundations for web projects.",
  ],
  "developer-toolbox": [
    "Developer toolbox",
    "Editors, collaboration, code quality, and testing resources.",
  ],
};
// Dotted IDs are Sanity document paths and are not anonymously readable.
const id = (type, slug) => `mkdirs-${type}-${slug}`;
const slugField = (current) => ({ _type: "slug", current });
const ref = (type, slug) => ({
  _type: "reference",
  _ref: id(type, slug),
  _key: slug,
});
const escapeXml = (s) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const seen = new Set();
for (const item of items) {
  if (!/^[a-z0-9-]+$/.test(item.slug) || seen.has(item.slug))
    throw new Error("Invalid or duplicate content slug");
  seen.add(item.slug);
  if (
    new URL(item.url).protocol !== "https:" ||
    !categories[item.category] ||
    !collections[item.collection]
  )
    throw new Error(`Invalid public resource: ${item.slug}`);
  if (
    Object.keys(item).some(
      (key) =>
        ![
          "slug",
          "name",
          "url",
          "description",
          "category",
          "tags",
          "collection",
        ].includes(key),
    )
  )
    throw new Error("Only public content fields are allowed");
}
if (!process.argv.includes("--apply")) {
  console.log(
    `Validated ${items.length} public resources. Dry run only. Add --apply to create missing content; existing documents are never overwritten.`,
  );
  process.exit(0);
}
process.loadEnvFile(
  process.env.CONTENT_ENV_FILE ||
    fileURLToPath(new URL("../.env.local", import.meta.url)),
);
const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
if (!project || !dataset || !token)
  throw new Error(
    "Import requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_TOKEN in a private environment file.",
  );
// An explicit target prevents accidentally importing this site's content into another product.
if (process.env.CONFIRM_SANITY_PROJECT !== project)
  throw new Error(
    "Set CONFIRM_SANITY_PROJECT to the intended project ID before importing.",
  );
const base = `https://${project}.api.sanity.io/v2024-08-01`;
async function request(path, init = {}) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      `Sanity import request failed (HTTP ${response.status}); no documents were deleted.`,
    );
  return response.json();
}
async function upload(name, square = false) {
  const width = square ? 128 : 960;
  const height = square ? 128 : 540;
  const label = square ? name.slice(0, 1).toUpperCase() : name;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" rx="16" fill="#f5f3ff"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#6d28d9" font-family="sans-serif" font-weight="600" font-size="${square ? 64 : 48}">${escapeXml(label)}</text></svg>`;
  const result = await request(
    `/assets/images/${dataset}?filename=directory-resource.svg`,
    { method: "POST", headers: { "Content-Type": "image/svg+xml" }, body: svg },
  );
  return {
    _type: "image",
    alt: `Directory reference card for ${name}; not an official logo or website screenshot`,
    asset: { _type: "reference", _ref: result.document._id },
  };
}
const documents = [
  {
    _id: id("group", "resources"),
    _type: "group",
    name: "Resources",
    slug: slugField("resources"),
    priority: 1,
  },
];
for (const [slug, name] of Object.entries(categories))
  documents.push({
    _id: id("category", slug),
    _type: "category",
    name,
    slug: slugField(slug),
    description: `Browse ${name.toLowerCase()} resources.`,
    group: ref("group", "resources"),
    priority: 0,
  });
for (const slug of new Set(items.flatMap((item) => item.tags)))
  documents.push({
    _id: id("tag", slug),
    _type: "tag",
    name:
      slug === "open-source"
        ? "Open source"
        : slug[0].toUpperCase() + slug.slice(1),
    slug: slugField(slug),
  });
for (const [slug, [name, description]] of Object.entries(collections))
  documents.push({
    _id: id("collection", slug),
    _type: "collection",
    name,
    description,
    slug: slugField(slug),
    icon: await upload(name, true),
    priority: 0,
  });
const existing = await request(
  `/data/query/${dataset}?query=${encodeURIComponent('*[_type == "item"]._id')}`,
);
for (const item of items) {
  if (existing.result.includes(id("item", item.slug))) continue;
  documents.push({
    _id: id("item", item.slug),
    _type: "item",
    name: item.name,
    slug: slugField(item.slug),
    link: item.url,
    description: item.description,
    introduction: `${item.description}\n\n## Official resource\n\nVisit [${item.name}](${item.url}) for documentation and current product details.\n\nThis entry is part of the mkdirs starter directory, based on the linked official website. Listing is not an endorsement or paid placement.`,
    publishDate: new Date().toISOString(),
    forceHidden: false,
    featured: false,
    sponsor: false,
    pricePlan: "free",
    freePlanStatus: "approved",
    categories: [ref("category", item.category)],
    tags: item.tags.map((tag) => ref("tag", tag)),
    collections: [ref("collection", item.collection)],
    icon: await upload(item.name, true),
    image: await upload(item.name),
  });
}
await request(`/data/mutate/${dataset}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mutations: documents.map((document) => ({ createIfNotExists: document })),
  }),
});
console.log(
  `Import complete for ${project}/${dataset}: ${documents.filter((document) => document._type === "item").length} new resources. Existing documents preserved.`,
);
