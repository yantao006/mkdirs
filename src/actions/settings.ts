"use server";

import type { unstable_update } from "@/auth";
import type { getUserById } from "@/data/user";
import type { currentUser } from "@/lib/auth";
import type { SettingsSchema } from "@/lib/schemas";
import type { sanityClient } from "@/sanity/lib/client";
import type bcrypt from "bcryptjs";
import type { revalidatePath } from "next/cache";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function settings(
  values: z.infer<typeof SettingsSchema>,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
