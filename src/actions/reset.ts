"use server";

import type { getUserByEmail } from "@/data/user";
import type { sendPasswordResetEmail } from "@/lib/mail";
import type { ResetSchema } from "@/lib/schemas";
import type { generatePasswordResetToken } from "@/lib/tokens";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function reset(
  values: z.infer<typeof ResetSchema>,
): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
