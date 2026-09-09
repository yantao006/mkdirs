"use server";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { verifyPassword } from "@/lib/password";
import { LoginSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
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
  if (!serviceConfigured("accounts"))
    return {
      status: "error",
      message: "Sign in is awaiting account configuration",
    };
  const safeCallback =
    callbackUrl?.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.includes("\\")
      ? callbackUrl
      : DEFAULT_LOGIN_REDIRECT;
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { status: "error", message: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;
  const existingUser = await getUserByEmail(email);
  if (
    !existingUser?.email ||
    !existingUser.password ||
    !(await verifyPassword(password, existingUser.password))
  ) {
    return { status: "error", message: "Invalid credentials!" };
  }

  if (!existingUser.emailVerified) {
    try {
      const verificationToken = await generateVerificationToken(
        existingUser.email,
      );
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
          "Verification email could not be sent. Your account is not yet verified; please retry later.",
      };
    }
  }

  try {
    // https://youtu.be/1MTyCvS05V4?t=9828
    await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: safeCallback,
    });

    return {
      status: "success",
      message: "Login success",
      redirectUrl: safeCallback,
    };
  } catch (error) {
    // console.error("login, error:", error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { status: "error", message: "Invalid credentials!" };
        default:
          return { status: "error", message: "Something went wrong!" };
      }
    }
    return { status: "error", message: "Something went wrong!" };
  }
}
