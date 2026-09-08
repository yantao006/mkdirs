"use server";

import type { getItemById } from "@/data/item";
import type { currentUser } from "@/lib/auth";
import type { sendNotifySubmissionEmail } from "@/lib/mail";
import type { FreePlanStatus, PricePlans } from "@/lib/submission";
import type {
  getItemLinkInStudio,
  getItemStatusLinkInWebsite,
} from "@/lib/utils";
import type { sanityClient } from "@/sanity/lib/client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export const submitToReview = async (
  itemId: string,
): Promise<ServerActionResponse> => {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
};
