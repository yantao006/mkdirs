import type { ComponentProps } from "react";
import type {
  ItemListQueryResult,
  SponsorItemListQueryResult,
} from "../sanity.types";
import type ItemGrid from "../src/components/item/item-grid";

// Compiled by non-incremental typecheck, including after Sanity type generation.
// An intentionally disabled query yields never[], not the grid's item shape.
export function itemGridContracts(
  items: ItemListQueryResult,
  disabledSponsors: SponsorItemListQueryResult,
) {
  const ordinaryItems = {
    items,
    sponsorItems: items,
    showSponsor: false,
  } satisfies ComponentProps<typeof ItemGrid>;
  const disabledQuery = {
    items,
    sponsorItems: disabledSponsors,
    showSponsor: false,
  } satisfies ComponentProps<typeof ItemGrid>;
  return { ordinaryItems, disabledQuery };
}
