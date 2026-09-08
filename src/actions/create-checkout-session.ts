"use server";

import type { getUserById } from "@/data/user";
import type { currentUser } from "@/lib/auth";
import type { stripe } from "@/lib/stripe";
import type { absoluteUrl } from "@/lib/utils";
import type { sanityClient } from "@/sanity/lib/client";
import type { sanityFetch } from "@/sanity/lib/fetch";
import type { itemByIdQuery } from "@/sanity/lib/queries";
import type { ItemInfo } from "@/types";
import type { redirect } from "next/navigation";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  stripeUrl?: string;
};

/**
 * https://github.com/javayhu/lms-studio-antonio/blob/main/app/api/courses/%5BcourseId%5D/checkout/route.ts
 */
export async function createCheckoutSession(
  itemId: string,
  priceId: string,
  pricePlan: string,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
