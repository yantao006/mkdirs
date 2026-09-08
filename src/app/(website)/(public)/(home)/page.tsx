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

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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
  return (
    <div>
      <output className="mb-4 block text-sm text-muted-foreground">
        {totalCount} resources found
      </output>
      {items.length === 0 ? (
        <EmptyGrid />
      ) : (
        <section aria-label="Directory resources">
          <ItemGrid items={items} sponsorItems={[]} showSponsor={false} />
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
