import { siteConfig } from "@/config/site";
import { PUBLISHED_ITEM } from "@/lib/directory-query";
import { sanityFetch } from "@/sanity/lib/fetch";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await sanityFetch<
    { _type: string; slug: string; _updatedAt: string }[]
  >({
    query: `*[defined(slug.current) && ((${PUBLISHED_ITEM}) || _type in ["category", "tag", "collection", "page", "blogCategory"] || (_type == "blogPost" && defined(publishDate) && publishDate <= now()))] [0...49000] { _type, "slug": slug.current, _updatedAt }`,
  });
  const routes = [
    "/",
    "/search",
    "/category",
    "/tag",
    "/collection",
    "/blog",
    "/pricing",
  ];
  return [
    ...routes.map((path) => ({ url: `${siteConfig.url}${path}` })),
    ...entries
      .filter((entry) => /^[a-z0-9-]+$/.test(entry.slug))
      .map((entry) => ({
        url: `${siteConfig.url}/${entry._type === "page" ? "" : entry._type === "blogPost" ? "blog/" : entry._type === "blogCategory" ? "blog/category/" : `${entry._type}/`}${entry.slug}`,
        lastModified: entry._updatedAt,
      })),
  ];
}
