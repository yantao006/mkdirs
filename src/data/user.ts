import { privateDocumentQuery } from "@/lib/private-documents";
import type { User, UserWithAccountsQueryResult } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";

export const getUserByEmail = (email: string) =>
  privateFetch<User | null>({
    query: privateDocumentQuery("user", ["email"]),
    params: { value_email: email.trim().toLowerCase() },
  });

export const getUserById = (userId: string) =>
  privateFetch<User | null>({
    query: privateDocumentQuery("user", ["_id"]),
    params: { value__id: userId },
  });

export const getUserByIdWithAccounts = (userId: string) =>
  privateFetch<UserWithAccountsQueryResult>({
    query: `${privateDocumentQuery("user", ["_id"])}{..., accounts->}`,
    params: { value__id: userId },
  });
