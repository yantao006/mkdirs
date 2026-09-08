"use server";

import { getItemById } from "@/data/item";
import { currentUser } from "@/lib/auth";
import { getPublishable } from "@/lib/submission";
import { sanityClient } from "@/sanity/lib/private-client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function publish(itemId: string): Promise<ServerActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: "error", message: "Unauthorized" };
    }
    // console.log("publish, user:", user);

    const item = await getItemById(itemId);
    if (!item) {
      return { status: "error", message: "Item not found!" };
    }
    if (item.submitter._ref !== user.id) {
      return { status: "error", message: "You are not allowed to do this!" };
    }

    if (!getPublishable(item)) {
      return {
        status: "error",
        message: "This submission has not been approved or paid.",
      };
    }

    const result = await sanityClient
      .patch(itemId)
      .set({
        publishDate: new Date().toISOString(),
      })
      .commit();
    // console.log('publish, result:', result);

    if (!result) {
      return { status: "error", message: "Failed to publish item!" };
    }
    return { status: "success", message: "Successfully published!" };
  } catch (error) {
    return { status: "error", message: "Failed to publish item!" };
  }
}
