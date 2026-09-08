import { ITEMS_PER_PAGE } from "@/lib/constants";
import { buildDirectoryQuery } from "@/lib/directory-query";
import type { Item, ItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { itemSimpleFields } from "@/sanity/lib/queries";
import type { ItemInfo } from "@/types";

export async function getItemById(id: string) {
  return sanityFetch<Item>({
    query: '*[_type == "item" && _id == $id][0]',
    params: { id },
  });
}

export async function getItemInfoById(id: string) {
  return sanityFetch<ItemInfo>({
    query: `*[_type == "item" && _id == $id][0] { ${itemSimpleFields} }`,
    params: { id },
  });
}

export async function getItems(input: {
  collection?: string;
  category?: string;
  tag?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  filter?: string;
  currentPage: number;
  hasSponsorItem?: boolean;
}) {
  // No reserved sponsor slot: every page has the same capacity and offset.
  const { countQuery, dataQuery, params } = buildDirectoryQuery(
    input,
    itemSimpleFields,
    ITEMS_PER_PAGE,
  );
  const [totalCount, items] = await Promise.all([
    sanityFetch<number>({ query: countQuery, params }),
    sanityFetch<ItemListQueryResult>({ query: dataQuery, params }),
  ]);
  return { items, totalCount };
}
