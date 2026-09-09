import { privateDocumentQuery } from "@/lib/private-documents";
import type { Account } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";

export const getAccountByUserId = (userId: string) =>
  privateFetch<Account | null>({
    query: privateDocumentQuery("account", ["userId"]),
    params: { value_userId: userId },
  });

export const getAccountByProviderAccountId = (
  providerAccountId: string,
  provider: string,
) =>
  privateFetch<Account | null>({
    query: privateDocumentQuery("account", ["providerAccountId", "provider"]),
    params: {
      value_providerAccountId: providerAccountId,
      value_provider: provider,
    },
  });
