"use server";

import { getItemTargetLinkInWebsite } from "@/lib/utils";
import type { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";

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
  try {
    const result = await sanityFetch<SponsorItemListQueryResult>({
      query: sponsorItemListQuery,
    });

    // console.log("getBannerAd, result", result);

    // we only show the first sponsor item as banner ad
    if (result && result.length > 0) {
      return {
        status: "success",
        message: "Banner ad fetched successfully!",
        data: {
          content: `🎉 ${result[0].name}: ${result[0].description}`,
          url: getItemTargetLinkInWebsite(result[0]),
        },
      };
    }

    return {
      status: "error",
      message: "no banner ad!",
      data: null,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to fetch banner ad!",
      data: null,
    };
  }
}
