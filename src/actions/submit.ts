"use server";

import type { currentUser } from "@/lib/auth";
import type { SUPPORT_ITEM_ICON } from "@/lib/constants";
import type { SubmitSchema } from "@/lib/schemas";
import type { FreePlanStatus, PricePlans } from "@/lib/submission";
import type { slugify } from "@/lib/utils";
import type { sanityClient } from "@/sanity/lib/client";
import type { revalidatePath } from "next/cache";

type BaseSubmitFormData = {
  name: string;
  link: string;
  description: string;
  introduction: string;
  imageId: string;
  tags: string[];
  categories: string[];
};

export type SubmitFormData = typeof SUPPORT_ITEM_ICON extends true
  ? BaseSubmitFormData & { iconId: string }
  : BaseSubmitFormData;

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  id?: string;
};

/**
 * https://nextjs.org/learn/dashboard-app/mutating-data
 */
export async function submit(
  formData: SubmitFormData,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
