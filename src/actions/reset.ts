"use server";

import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { ResetSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";
import { generatePasswordResetToken } from "@/lib/tokens";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function reset(
  values: z.infer<typeof ResetSchema>,
): Promise<ServerActionResponse> {
  if (!serviceConfigured("accounts") || !serviceConfigured("email"))
    return {
      status: "error",
      message: "Password reset is awaiting account and email configuration",
    };
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { status: "error", message: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser?.password) {
      const token = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(
        existingUser.name,
        token.identifier,
        token.token,
      );
    }
    return {
      status: "success",
      message:
        "If this address has a password account, check your email for a reset link.",
    };
  } catch {
    return {
      status: "error",
      message: "The reset request could not be delivered. Please retry later.",
    };
  }
}
