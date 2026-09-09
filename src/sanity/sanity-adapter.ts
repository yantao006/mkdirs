import { getAccountByProviderAccountId } from "@/data/account";
import { getUserByEmail, getUserById } from "@/data/user";
import { getVerificationTokenByIdentifierAndToken } from "@/data/verification-token";
import { privateIdentityId } from "@/lib/identity-id";
import {
  isPrivateDocumentId,
  privateDocumentId,
} from "@/lib/private-documents";
import type { User } from "@/sanity.types";
import { UserRole } from "@/types/user-role";
import type { Adapter, AdapterUser } from "@auth/core/adapters";
import type { SanityClient } from "@sanity/client";

function adapterUser(
  user: Pick<User, "_id" | "name" | "email" | "image" | "emailVerified">,
): AdapterUser {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

/** Authentication documents are private Sanity subpaths, never root documents. */
export function SanityAdapter(client: SanityClient): Adapter {
  return {
    async createUser(user) {
      const email = user.email.trim().toLowerCase();
      const existing = await getUserByEmail(email);
      if (existing) return adapterUser(existing);
      const created = await client.create({
        _type: "user",
        _id: await privateIdentityId("user", email),
        name: user.name || "",
        email,
        image: user.image || undefined,
        role: UserRole.USER,
        emailVerified: user.emailVerified?.toISOString(),
      });
      return adapterUser(created);
    },
    async getUser(id) {
      const user = await getUserById(id);
      return user ? adapterUser(user) : null;
    },
    async getUserByEmail(email) {
      const user = await getUserByEmail(email);
      return user ? adapterUser(user) : null;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const account = await getAccountByProviderAccountId(
        providerAccountId,
        provider,
      );
      const user = account ? await getUserById(account.userId) : null;
      return user ? adapterUser(user) : null;
    },
    async updateUser(update) {
      const user = await getUserById(update.id);
      if (!user) throw new Error("Account not found");
      const fields: Record<string, string | null> = {};
      if (update.name !== undefined) fields.name = update.name;
      if (update.image !== undefined) fields.image = update.image;
      if (update.email !== undefined)
        fields.email = update.email.trim().toLowerCase();
      if (update.emailVerified !== undefined)
        fields.emailVerified = update.emailVerified?.toISOString() ?? null;
      return adapterUser(
        await client.patch(user._id).set(fields).commit<User>(),
      );
    },
    async deleteUser(id) {
      if (!isPrivateDocumentId(id)) throw new Error("Invalid account ID");
      // Do not silently orphan content; Sanity's reference integrity is enforced.
      await client.delete(id);
    },
    async linkAccount(account) {
      if (!isPrivateDocumentId(account.userId))
        throw new Error("Invalid account ID");
      const existing = await getAccountByProviderAccountId(
        account.providerAccountId,
        account.provider,
      );
      if (existing) {
        if (existing.userId !== account.userId)
          throw new Error("Account already linked");
        return account;
      }
      const id = await privateIdentityId(
        "account",
        JSON.stringify([account.provider, account.providerAccountId]),
      );
      await client
        .transaction()
        .create({
          _id: id,
          _type: "account",
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
          user: { _type: "reference", _ref: account.userId },
        })
        .patch(account.userId, {
          set: {
            emailVerified: new Date().toISOString(),
            accounts: { _type: "reference", _ref: id },
          },
        })
        .commit();
      return account;
    },
    async unlinkAccount({ provider, providerAccountId }) {
      const account = await getAccountByProviderAccountId(
        providerAccountId,
        provider,
      );
      if (!account) return;
      await client
        .transaction()
        .patch(account.userId, { unset: ["accounts"] })
        .delete(account._id)
        .commit();
    },
    async createVerificationToken({ identifier, expires, token }) {
      await client.create({
        _id: privateDocumentId("verificationToken"),
        _type: "verificationToken",
        identifier: identifier.trim().toLowerCase(),
        expires: expires.toISOString(),
        token,
      });
      return { identifier, expires, token };
    },
    async useVerificationToken({ identifier, token }) {
      const document = await getVerificationTokenByIdentifierAndToken(
        identifier,
        token,
      );
      if (!document || new Date(document.expires).getTime() <= Date.now())
        return null;
      // Revision guard makes a token single-use even under concurrent requests.
      await client
        .transaction()
        .patch(document._id, {
          ifRevisionID: document._rev,
          set: { consumed: true },
        })
        .delete(document._id)
        .commit();
      return {
        identifier: document.identifier,
        token: document.token,
        expires: new Date(document.expires),
      };
    },
  };
}
