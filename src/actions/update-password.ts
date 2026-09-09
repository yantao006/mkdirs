"use server";

import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { type UserPasswordData, UserPasswordSchema } from "@/lib/schemas";
import { sanityClient } from "@/sanity/lib/private-client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

export async function updateUserPassword(
  values: UserPasswordData,
): Promise<ServerActionResponse> {
  try {
    const parsed = UserPasswordSchema.safeParse(values);
    if (!parsed.success)
      return { status: "error", message: "Invalid password fields" };
    const data = parsed.data;
    const user = await currentUser();
    if (!user) {
      return { status: "error", message: "Unauthorized" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { status: "error", message: "User not found" };
    }

    // password change needs verification
    if (!user.isOAuth && data.password && data.newPassword && dbUser.password) {
      const passwordsMatch = await bcrypt.compare(
        data.password,
        dbUser.password,
      );

      if (!passwordsMatch) {
        return { status: "error", message: "Incorrect password!" };
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      const updatedUser = await sanityClient
        .patch(dbUser._id)
        .set({
          password: hashedPassword,
        })
        .commit();

      revalidatePath("/settings");
      return { status: "success", message: "User password updated!" };
    }
    return { status: "error", message: "No password provided" };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to update user password!",
    };
  }
}
