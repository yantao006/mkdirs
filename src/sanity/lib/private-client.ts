import "server-only";

import { apiVersion, dataset, projectId } from "@/sanity/lib/api";
import { type QueryParams, createClient } from "next-sanity";

/** Never import this authenticated client in Studio or a browser component. */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: "raw",
});

export function requirePrivateContentConfiguration() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error("Account and submission storage is not configured");
  }
}

export async function privateFetch<T>({
  query,
  params = {},
}: {
  query: string;
  params?: QueryParams;
}): Promise<T> {
  requirePrivateContentConfiguration();
  return sanityClient.fetch<T>(query, params, {
    cache: "no-store",
    useCdn: false,
    perspective: "raw",
    timeout: 10000,
  });
}
