"use server";

import { getItemById } from "@/data/item";
import { currentUser } from "@/lib/auth";
import type { SUPPORT_ITEM_ICON } from "@/lib/constants";
import { sendNotifySubmissionEmail } from "@/lib/mail";
import { EditSchema } from "@/lib/schemas";
import { FreePlanStatus, PricePlans } from "@/lib/submission";
import {
  getItemLinkInStudio,
  getItemStatusLinkInWebsite,
  slugify,
} from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/private-client";
import { revalidatePath } from "next/cache";

// Icon fields follow the configured submission schema.

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
  try {
    const user = await currentUser();
    if (!user) {
      return { status: "error", message: "Unauthorized" };
    }

    // console.log("edit, data:", formData);
    const {
      id,
      name,
      link,
      description,
      introduction,
      imageId,
      tags,
      categories,
      ...rest
    } = EditSchema.parse(formData);
    const iconId = "iconId" in rest ? rest.iconId : undefined;

    // check if the user is the submitter of the item
    const item = await getItemById(id);
    if (!item) {
      return { status: "error", message: "Item not found!" };
    }
    if (item.submitter._ref !== user.id) {
      return { status: "error", message: "You are not allowed to do this!" };
    }

    const slug = item.slug?.current || slugify(name);
    const data = {
      _id: id,
      _type: "item",
      name,
      slug: {
        _type: "slug",
        current: slug,
      },
      link,
      description,
      introduction,

      // Free plan: update item leads to be unpublished and reviewed again
      // remain submitted if the plan status is submitted, otherwise set to pending
      ...(item.pricePlan === PricePlans.FREE && {
        publishDate: null,
        freePlanStatus:
          item.freePlanStatus === FreePlanStatus.SUBMITTING
            ? FreePlanStatus.SUBMITTING
            : FreePlanStatus.PENDING,
      }),

      // The _key only needs to be unique within the array itself, use index as the _key
      tags: tags.map((tag, index) => ({
        _type: "reference",
        _ref: tag,
        _key: index.toString(),
      })),
      categories: categories.map((category, index) => ({
        _type: "reference",
        _ref: category,
        _key: index.toString(),
      })),
      image: {
        _type: "image",
        alt: `image of ${name}`,
        asset: {
          _type: "reference",
          _ref: imageId,
        },
      },
      icon: iconId
        ? {
            _type: "image",
            alt: `icon of ${name}`,
            asset: {
              _type: "reference",
              _ref: iconId,
            },
          }
        : undefined,
    };

    // console.log("edit, data:", data);
    const res = await sanityClient
      .patch(id)
      .ifRevisionId(item._rev)
      .set(data)
      .commit();
    if (!res) {
      return { status: "error", message: "Failed to update item" };
    }
    // console.log("edit, success, res:", res);

    let notificationFailed = false;
    // The edit is already persisted; notification failure is not a failed save.
    if (
      item.pricePlan === PricePlans.FREE &&
      item.freePlanStatus !== FreePlanStatus.SUBMITTING
    ) {
      const statusLink = getItemStatusLinkInWebsite(id);
      const reviewLink = getItemLinkInStudio(id);
      try {
        await sendNotifySubmissionEmail(
          user.name,
          user.email,
          name,
          statusLink,
          reviewLink,
        );
      } catch {
        notificationFailed = true;
      }
    }

    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
    // Along with prefetching, this cache ensures that users can quickly navigate between routes
    // while reducing the number of requests made to the server.
    // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server.
    // You can do this with the revalidatePath function from Next.js.

    // redirect to the updated item, but not working, still showing the old item
    revalidatePath(`/edit/${id}`);
    revalidatePath(`/item/${slug}`);
    return {
      status: "success",
      message: notificationFailed
        ? "Item updated and queued for review, but email notification failed. Check your dashboard for status."
        : "Successfully updated item",
    };
  } catch (error) {
    return { status: "error", message: "Failed to update item" };
  }
}
