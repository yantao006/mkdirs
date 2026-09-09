import { privateDocumentQuery } from "@/lib/private-documents";
import type { VerificationToken } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";

export const getVerificationTokenByEmail = (email: string) =>
  privateFetch<VerificationToken | null>({
    query: privateDocumentQuery("verificationToken", ["identifier"]),
    params: { value_identifier: email.trim().toLowerCase() },
  });

export const getVerificationTokenByToken = (token: string) =>
  privateFetch<VerificationToken | null>({
    query: privateDocumentQuery("verificationToken", ["token"]),
    params: { value_token: token },
  });

export const getVerificationTokenByIdentifierAndToken = (
  identifier: string,
  token: string,
) =>
  privateFetch<VerificationToken | null>({
    query: privateDocumentQuery("verificationToken", ["identifier", "token"]),
    params: {
      value_identifier: identifier.trim().toLowerCase(),
      value_token: token,
    },
  });
