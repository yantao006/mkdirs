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
import type { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

export default async function HomePage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await searchParamsPromise) || {};

  const {
    category,
    tag,
    sort,
    page,
    q: query,
    f: filter,
  } = normalizeSearchParams(await searchParams);
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;
  const { items, totalCount } = await getItems({
    category,
    tag,
    sortKey,
    reverse,
    query,
    filter,
    currentPage: normalizePage(page),
  });
  const sponsorItems = await sanityFetch<SponsorItemListQueryResult>({
    query: sponsorItemListQuery,
  });
  return (
    <div>
      <output className="mb-4 block text-sm text-muted-foreground">
        {totalCount} resources found
      </output>
      {items.length === 0 ? (
        <EmptyGrid />
      ) : (
        <section aria-label="Directory resources">
          <ItemGrid items={items} sponsorItems={sponsorItems} showSponsor />
          <div className="mt-8 flex justify-center">
            <CustomPagination
              routePrefix="/"
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
