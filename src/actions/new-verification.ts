"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { sanityClient } from "@/sanity/lib/private-client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function newVerification(
  token: string,
): Promise<ServerActionResponse> {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { status: "error", message: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { status: "error", message: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);
  if (!existingUser) {
    return { status: "error", message: "Email does not exist!" };
  }

  try {
    await sanityClient
      .transaction()
      .patch(existingToken._id, (patch) =>
        patch.ifRevisionId(existingToken._rev).set({ consumed: true }),
      )
      .patch(existingUser._id, (patch) =>
        patch.ifRevisionId(existingUser._rev).set({
          emailVerified: new Date().toISOString(),
        }),
      )
      .delete(existingToken._id)
      .commit();
    return { status: "success", message: "Email verified!" };
  } catch {
    return {
      status: "error",
      message:
        "This link was already used or the account changed. Request a new verification link.",
    };
  }
}
