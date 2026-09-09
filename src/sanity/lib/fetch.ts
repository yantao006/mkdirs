import { sanityClient } from "@/sanity/lib/client";
import {
  sanityClient as privateClient,
  requirePrivateContentConfiguration,
} from "@/sanity/lib/private-client";
import type { ClientPerspective, QueryParams } from "next-sanity";
import { draftMode } from "next/headers";

/** Public requests remain anonymous; only a validated preview cookie enables drafts. */
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string;
  params?: QueryParams;
  perspective?: Omit<ClientPerspective, "raw">;
  disableCache?: boolean;
}): Promise<QueryResponse> {
  const preview = (await draftMode()).isEnabled;
  if (preview) requirePrivateContentConfiguration();
  const client = preview ? privateClient : sanityClient;
  return client.fetch<QueryResponse>(query, params, {
    perspective: preview ? "previewDrafts" : "published",
    useCdn: false,
    cache: "no-store",
    timeout: 10000,
  });
}
