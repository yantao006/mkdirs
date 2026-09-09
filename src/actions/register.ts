"use server";

import { getUserByEmail } from "@/data/user";
import { privateIdentityId } from "@/lib/identity-id";
import { sendVerificationEmail } from "@/lib/mail";
import { RegisterSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";
import { generateVerificationToken } from "@/lib/tokens";
import { sanityClient } from "@/sanity/lib/private-client";
import { UserRole } from "@/types/user-role";
import bcrypt from "bcryptjs";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function register(
  values: z.infer<typeof RegisterSchema>,
): Promise<ServerActionResponse> {
  if (!serviceConfigured("accounts") || !serviceConfigured("email")) {
    return {
      status: "error",
      message:
        "Registration is awaiting this site's account and email configuration.",
    };
  }
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { status: "error", message: "Invalid Fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { status: "error", message: "Email already being used" };
  }

  try {
    await sanityClient.create({
      _type: "user",
      _id: await privateIdentityId("user", email.trim().toLowerCase()),
      name,
      email: email.trim().toLowerCase(),
      role: UserRole.USER,
      password: hashedPassword,
    });
  } catch {
    return {
      status: "error",
      message:
        "Unable to create the account. If you already registered, sign in to resend verification.",
    };
  }
  try {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token,
    );
    return {
      status: "success",
      message: "Please check your email for verification",
    };
  } catch {
    return {
      status: "error",
      message:
        "Account saved, but the email provider did not accept verification. Try signing in to resend it.",
    };
  }
}
