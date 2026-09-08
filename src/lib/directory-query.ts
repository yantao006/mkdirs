export const PUBLISHED_ITEM =
  '_type == "item" && defined(slug.current) && defined(publishDate) && publishDate <= now() && forceHidden != true';

export function normalizePage(value: unknown): number {
  const page =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : 1;
  return Number.isSafeInteger(page) && page > 0 && page <= 10000 ? page : 1;
}

export function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.slice(0, 200) : "";
}

export function normalizeSearchParams(
  params: Record<string, string | string[] | undefined> = {},
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, firstParam(value)]),
  );
}

export function buildDirectoryQuery(
  input: {
    collection?: string;
    category?: string;
    tag?: string;
    sortKey?: string;
    reverse?: boolean;
    query?: string;
    filter?: string;
    currentPage?: number;
  },
  fields: string,
  pageSize = 12,
) {
  const page = normalizePage(input.currentPage);
  const sortKey = input.sortKey === "name" ? "name" : "publishDate";
  const direction = input.reverse === false ? "asc" : "desc";
  // match wildcards supplied by visitors are treated as separators, not syntax.
  const query = (input.query || "")
    .slice(0, 200)
    .replace(/[\\*?]/g, " ")
    .trim();
  const tags = [...new Set((input.tag || "").split(",").filter(Boolean))].slice(
    0,
    20,
  );
  const params = {
    pattern: `*${query}*`,
    hasQuery: query.length > 0,
    category: input.category || "",
    collection: input.collection || "",
    tags,
    featured: input.filter === "featured==true",
    start: (page - 1) * pageSize,
    end: page * pageSize,
  };
  const condition = `${PUBLISHED_ITEM}
    && (!$hasQuery || name match $pattern || description match $pattern || introduction match $pattern)
    && (!$featured || featured == true)
    && ($category == "" || $category in categories[]->slug.current)
    && ($collection == "" || $collection in collections[]->slug.current)
    && (count($tags) == 0 || count((tags[]->slug.current)[@ in $tags]) == count($tags))`;
  return {
    params,
    countQuery: `count(*[${condition}])`,
    dataQuery: `*[${condition}] | order(${sortKey} ${direction}, _id asc) [$start...$end] { ${fields} }`,
  };
}

export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
