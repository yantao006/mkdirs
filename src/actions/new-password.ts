"use server";

import type { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import type { getUserByEmail } from "@/data/user";
import type { NewPasswordSchema } from "@/lib/schemas";
import type { sanityClient } from "@/sanity/lib/client";
import type bcrypt from "bcryptjs";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function newPassword(
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
