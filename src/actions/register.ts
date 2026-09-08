"use server";

import type { getUserByEmail } from "@/data/user";
import type { sendVerificationEmail } from "@/lib/mail";
import type { RegisterSchema } from "@/lib/schemas";
import type { generateVerificationToken } from "@/lib/tokens";
import type { sanityClient } from "@/sanity/lib/client";
import type { UserRole } from "@/types/user-role";
import type { uuid } from "@sanity/uuid";
import type bcrypt from "bcryptjs";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function register(
  values: z.infer<typeof RegisterSchema>,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
