"use server";

import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { getResend } from "@/lib/mail";
import { type NewsletterFormData, NewsletterFormSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function subscribeToNewsletter(
  formdata: NewsletterFormData,
): Promise<ServerActionResponse> {
  if (!serviceConfigured("newsletter"))
    return {
      status: "error",
      message:
        "Newsletter subscription is awaiting this site's email configuration",
    };
  try {
    const validatedInput = NewsletterFormSchema.safeParse(formdata);
    if (!validatedInput.success) {
      return { status: "error", message: "Invalid input" };
    }

    const subscribedResult = await getResend().contacts.create({
      email: validatedInput.data.email,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    const subscribed =
      !subscribedResult.error && Boolean(subscribedResult.data?.id);

    if (subscribed) {
      const emailSentResult = await getResend().emails.send({
        from: process.env.RESEND_EMAIL_FROM,
        to: validatedInput.data.email,
        subject: "Welcome to our newsletter!",
        react: NewsletterWelcomeEmail({ email: validatedInput.data.email }),
      });

      const emailSent =
        !emailSentResult.error && Boolean(emailSentResult.data?.id);
      return {
        status: "success",
        message: emailSent
          ? "Subscribed to the newsletter"
          : "Subscription saved, but the welcome email could not be delivered.",
      };
    }

    return {
      status: "error",
      message: "Failed to subscribe to the newsletter",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to subscribe to the newsletter",
    };
  }
}
