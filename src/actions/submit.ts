"use server";

import { currentUser } from "@/lib/auth";
import type { SUPPORT_ITEM_ICON } from "@/lib/constants";
import { SubmitSchema } from "@/lib/schemas";
import { FreePlanStatus, PricePlans } from "@/lib/submission";
import { slugify } from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/private-client";
import { revalidatePath } from "next/cache";

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
  requestId: string,
): Promise<ServerActionResponse> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { status: "error", message: "Unauthorized" };
    }
    if (!/^[0-9a-f-]{36}$/.test(requestId)) {
      return {
        status: "error",
        message: "Invalid submission request; reload the form",
      };
    }
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${user.id}:${requestId}`),
    );
    const id = `submission-${Buffer.from(digest).toString("hex")}`;
    const previous = await sanityClient.getDocument(id);
    if (previous)
      return { status: "success", message: "Submission already saved", id };

    // console.log("submit, data:", formData);
    const {
      name,
      link,
      description,
      introduction,
      imageId,
      tags,
      categories,
      ...rest
    } = SubmitSchema.parse(formData);
    const iconId = "iconId" in rest ? rest.iconId : undefined;

    // A stable request suffix avoids concurrent name collisions without renaming existing URLs.
    const slug = `${slugify(name).slice(0, 100) || "resource"}-${id.slice(-12)}`;
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
      publishDate: null,

      paid: false,
      pricePlan: PricePlans.FREE,
      freePlanStatus: FreePlanStatus.SUBMITTING,
      submitter: {
        _type: "reference",
        _ref: user.id,
      },

      // The _key only needs to be unique within the array itself
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

    // console.log("submit, data:", data);

    const res = await sanityClient.createIfNotExists(data);
    if (!res) {
      return { status: "error", message: "Failed to submit" };
    }

    // console.log("submit, success, res:", res);

    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
    // Along with prefetching, this cache ensures that users can quickly navigate between routes
    // while reducing the number of requests made to the server.
    // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server.
    // You can do this with the revalidatePath function from Next.js.
    revalidatePath("/submit");

    return { status: "success", message: "Successfully created", id: res._id };
  } catch (error) {
    return { status: "error", message: "Failed to submit" };
  }
}
