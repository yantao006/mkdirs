"use server";

import type { getUserById } from "@/data/user";
import type { currentUser } from "@/lib/auth";
import type { UserPasswordData } from "@/lib/schemas";
import type { sanityClient } from "@/sanity/lib/client";
import type bcrypt from "bcryptjs";
import type { revalidatePath } from "next/cache";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function updateUserPassword(
  values: UserPasswordData,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
