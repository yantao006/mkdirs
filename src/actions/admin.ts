"use server";

import type { currentRole } from "@/lib/auth";
import type { UserRole } from "@/types/user-role";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
};

/**
 * demostrate how to use currentRole to check user's role,
 * and return different responses according to different roles.
 */
export async function admin(): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}
