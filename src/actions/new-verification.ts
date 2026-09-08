"use server";

import type { getUserByEmail } from "@/data/user";
import type { getVerificationTokenByToken } from "@/data/verification-token";
import type { sanityClient } from "@/sanity/lib/client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function newVerification(
  token: string,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
