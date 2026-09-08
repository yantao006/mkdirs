"use server";

import type { getItemTargetLinkInWebsite } from "@/lib/utils";
import type { SponsorItemListQueryResult } from "@/sanity.types";
import type { sanityFetch } from "@/sanity/lib/fetch";
import type { sponsorItemListQuery } from "@/sanity/lib/queries";

export type BannerAdData = {
  content: string;
  url: string;
};

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  data?: BannerAdData;
};

export async function getBannerAd(): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
