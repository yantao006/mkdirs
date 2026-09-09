"use server";

import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { NewPasswordSchema } from "@/lib/schemas";
import { sanityClient } from "@/sanity/lib/private-client";
import bcrypt from "bcryptjs";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function newPassword(
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
): Promise<ServerActionResponse> {
  // console.log('newPassword, token:', token);
  if (!token) {
    return { status: "error", message: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { status: "error", message: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { status: "error", message: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { status: "error", message: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);
  if (!existingUser) {
    return { status: "error", message: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sanityClient
      .transaction()
      .patch(existingToken._id, (patch) =>
        patch.ifRevisionId(existingToken._rev).set({ consumed: true }),
      )
      .patch(existingUser._id, (patch) =>
        patch.ifRevisionId(existingUser._rev).set({ password: hashedPassword }),
      )
      .delete(existingToken._id)
      .commit();
    return { status: "success", message: "Password updated!" };
  } catch {
    return {
      status: "error",
      message:
        "This reset link was already used or the account changed. Request a new link.",
    };
  }
}
