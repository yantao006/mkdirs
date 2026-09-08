import { privateDocumentQuery } from "@/lib/private-documents";
import type { PasswordResetToken } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";

export const getPasswordResetTokenByEmail = (email: string) =>
  privateFetch<PasswordResetToken | null>({
    query: privateDocumentQuery("passwordResetToken", ["identifier"]),
    params: { value_identifier: email.trim().toLowerCase() },
  });

export const getPasswordResetTokenByToken = (token: string) =>
  privateFetch<PasswordResetToken | null>({
    query: privateDocumentQuery("passwordResetToken", ["token"]),
    params: { value_token: token },
  });
