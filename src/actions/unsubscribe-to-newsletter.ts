"use server";

import type { resend } from "@/lib/mail";
import type { NewsletterFormData, NewsletterFormSchema } from "@/lib/schemas";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function unsubscribeToNewsletter(
  formdata: NewsletterFormData,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
