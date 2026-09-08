"use server";

import { unstable_update } from "@/auth";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { SettingsSchema } from "@/lib/schemas";
import { sanityClient } from "@/sanity/lib/private-client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type * as z from "zod";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function settings(
  values: z.infer<typeof SettingsSchema>,
): Promise<ServerActionResponse> {
  try {
    const parsed = SettingsSchema.safeParse(values);
    if (!parsed.success)
      return { status: "error", message: "Invalid account settings" };
    const user = await currentUser();
    if (!user) return { status: "error", message: "Unauthorized" };
    const dbUser = await getUserById(user.id);
    if (!dbUser) return { status: "error", message: "Account not found" };
    const { name, link, password, newPassword } = parsed.data;
    const fields: { name: string; link?: string; password?: string } = {
      name,
      link,
    };
    if (password || newPassword) {
      if (user.isOAuth || !dbUser.password || !password || !newPassword) {
        return {
          status: "error",
          message:
            "Password changes require a credentials account and the current password",
        };
      }
      if (!(await bcrypt.compare(password, dbUser.password)))
        return { status: "error", message: "Incorrect password" };
      fields.password = await bcrypt.hash(newPassword, 10);
    }
    await sanityClient
      .patch(dbUser._id)
      .ifRevisionId(dbUser._rev)
      .set(fields)
      .commit();
    await unstable_update({ user: { name, link } });
    revalidatePath("/settings");
    return { status: "success", message: "Account information updated" };
  } catch {
    return { status: "error", message: "Could not update account settings" };
  }
}
