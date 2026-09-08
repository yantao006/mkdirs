import { sanityClient } from "@/sanity/lib/client";
import type { ClientPerspective, QueryParams } from "next-sanity";

/** Published public content only. No application write token or draft access. */
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string;
  params?: QueryParams;
  perspective?: Omit<ClientPerspective, "raw">;
  disableCache?: boolean;
}): Promise<QueryResponse> {
  return sanityClient.fetch<QueryResponse>(query, params, {
    perspective: "published",
    useCdn: false,
    cache: "no-store",
    timeout: 10000,
  });
}
