"use server";

import type { signIn } from "@/auth";
import type { getUserByEmail } from "@/data/user";
import type { sendVerificationEmail } from "@/lib/mail";
import type { LoginSchema } from "@/lib/schemas";
import type { generateVerificationToken } from "@/lib/tokens";
import type { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import type { AuthError } from "next-auth";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  redirectUrl?: string;
};

export async function login(
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
