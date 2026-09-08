"use server";

import type { getItemById } from "@/data/item";
import type { currentUser } from "@/lib/auth";
import type { SUPPORT_ITEM_ICON } from "@/lib/constants";
import type { sendNotifySubmissionEmail } from "@/lib/mail";
import type { EditSchema } from "@/lib/schemas";
import type { FreePlanStatus, PricePlans } from "@/lib/submission";
import type {
  getItemLinkInStudio,
  getItemStatusLinkInWebsite,
  slugify,
} from "@/lib/utils";
import type { sanityClient } from "@/sanity/lib/client";
import type { revalidatePath } from "next/cache";

// export type EditFormData = {
//   id: string;
//   name: string;
//   link: string;
//   description: string;
//   introduction: string;
//   tags: string[];
//   categories: string[];
//   imageId: string;
//   pricePlan: string;
//   planStatus: string;
// } & IconField;

type BaseEditFormData = {
  id: string;
  name: string;
  link: string;
  description: string;
  introduction: string;
  tags: string[];
  categories: string[];
  imageId: string;
  pricePlan: string;
  planStatus: string;
};

export type EditFormData = typeof SUPPORT_ITEM_ICON extends true
  ? BaseEditFormData & { iconId: string }
  : BaseEditFormData;

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

/**
 * https://nextjs.org/learn/dashboard-app/mutating-data
 */
export async function edit(
  formData: EditFormData,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
