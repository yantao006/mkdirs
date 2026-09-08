"use server";

import type { unstable_update } from "@/auth";
import type { getUserById } from "@/data/user";
import type { currentUser } from "@/lib/auth";
import type { UserLinkData, UserLinkSchema } from "@/lib/schemas";
import type { sanityClient } from "@/sanity/lib/client";
import type { revalidatePath } from "next/cache";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function updateUserLink(
  values: UserLinkData,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
