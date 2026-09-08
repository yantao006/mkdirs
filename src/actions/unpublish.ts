"use server";

import type { getItemById } from "@/data/item";
import type { currentUser } from "@/lib/auth";
import type { sanityClient } from "@/sanity/lib/client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function unpublish(itemId: string): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
