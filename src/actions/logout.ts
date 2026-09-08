"use server";

import type { signOut } from "@/auth";

export const logout = async () => {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
};
