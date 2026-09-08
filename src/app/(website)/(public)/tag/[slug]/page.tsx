import ItemGrid from "@/components/item/item-grid";
import EmptyGrid from "@/components/shared/empty-grid";
import CustomPagination from "@/components/shared/pagination";
import { siteConfig } from "@/config/site";
import { getItems } from "@/data/item";
import {
  DEFAULT_SORT,
  ITEMS_PER_PAGE,
  SORT_FILTER_LIST,
} from "@/lib/constants";
import { normalizePage, normalizeSearchParams } from "@/lib/directory-query";
import { constructMetadata } from "@/lib/metadata";
import type {
  SponsorItemListQueryResult,
  TagQueryResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery, tagQuery } from "@/sanity/lib/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await paramsPromise;

  const tag = await sanityFetch<TagQueryResult>({
    query: tagQuery,
    params: { slug: params.slug },
  });
  if (!tag) notFound();

  const ogImageUrl = new URL(`${siteConfig.url}/api/og`);
  ogImageUrl.searchParams.append("title", tag.name);
  ogImageUrl.searchParams.append("description", tag.description || "");
  ogImageUrl.searchParams.append("type", "Tag");

  return constructMetadata({
    title: `${tag.name}`,
    description: tag.description,
    canonicalUrl: `${siteConfig.url}/tag/${params.slug}`,
    // image: ogImageUrl.toString(),
  });
}

export default async function TagPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await paramsPromise;
  const searchParams = normalizeSearchParams(await searchParamsPromise);
  const tag = await sanityFetch<TagQueryResult>({
    query: tagQuery,
    params: { slug: params.slug },
  });
  if (!tag) notFound();

  const sponsorItems =
    (await sanityFetch<SponsorItemListQueryResult>({
      query: sponsorItemListQuery,
    })) || [];
  // console.log("TagPage, sponsorItems", sponsorItems);
  const showSponsor = true;
  const hasSponsorItem = showSponsor && sponsorItems.length > 0;

  const { sort, page } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;
  const currentPage = normalizePage(page);
  const { items, totalCount } = await getItems({
    tag: params.slug,
    sortKey,
    reverse,
    currentPage,
  });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  console.log("TagPage, totalCount", totalCount, ", totalPages", totalPages);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">{tag.name}</h2>
      {/* when no items are found */}
      {items?.length === 0 && <EmptyGrid />}

      {/* when items are found */}
      {items && items.length > 0 && (
        <section className="">
          <ItemGrid
            items={items}
            sponsorItems={sponsorItems}
            showSponsor={showSponsor}
          />

          <div className="mt-8 flex items-center justify-center">
            <CustomPagination
              routePrefix={`/tag/${params.slug}`}
              totalPages={totalPages}
            />
          </div>
        </section>
      )}
    </div>
  );
}
