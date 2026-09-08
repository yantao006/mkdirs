"use server";

import type { currentUser } from "@/lib/auth";
import type { stripe } from "@/lib/stripe";
import type { absoluteUrl } from "@/lib/utils";
import type { redirect } from "next/navigation";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  stripeUrl?: string;
};

/**
 * NOTICE: not used in the app yet
 */
export async function openCustomerPortal(
  stripeCustomerId: string,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
