"use server";

import { getResend } from "@/lib/mail";
import { type NewsletterFormData, NewsletterFormSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function unsubscribeToNewsletter(
  formdata: NewsletterFormData,
): Promise<ServerActionResponse> {
  if (!serviceConfigured("newsletter"))
    return {
      status: "error",
      message:
        "Newsletter management is awaiting this site's email configuration",
    };
  try {
    const validatedInput = NewsletterFormSchema.safeParse(formdata);
    if (!validatedInput.success) {
      return { status: "error", message: "Invalid input" };
    }

    const unsubscribedResult = await getResend().contacts.remove({
      email: validatedInput.data.email,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    const unsubscribed =
      !unsubscribedResult.error && unsubscribedResult.data?.deleted === true;
    if (unsubscribed) {
      return {
        status: "success",
        message: "You have been unsubscribed from the newsletter",
      };
    }

    return {
      status: "error",
      message: "Failed to unsubscribe to the newsletter",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to unsubscribe to the newsletter",
    };
  }
}
