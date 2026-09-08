import { POSTS_PER_PAGE } from "@/lib/constants";
import { normalizePage } from "@/lib/directory-query";
import type { BlogPostListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { blogPostSimpleFields } from "@/sanity/lib/queries";

export async function getBlogs({
  category,
  currentPage,
}: { category?: string; currentPage: number }) {
  const page = normalizePage(String(currentPage));
  const params = {
    category: category || "",
    start: (page - 1) * POSTS_PER_PAGE,
    end: page * POSTS_PER_PAGE,
  };
  const filter = `_type == "blogPost" && defined(slug.current) && defined(publishDate) && publishDate <= now() && ($category == "" || $category in categories[]->slug.current)`;
  const [totalCount, posts] = await Promise.all([
    sanityFetch<number>({ query: `count(*[${filter}])`, params }),
    sanityFetch<BlogPostListQueryResult>({
      query: `*[${filter}] | order(publishDate desc, _id asc) [$start...$end] { ${blogPostSimpleFields} }`,
      params,
    }),
  ]);
  return { posts, totalCount };
}
