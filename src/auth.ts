import authConfig from "@/auth.config";
import { getAccountByUserId } from "@/data/account";
import { getUserById } from "@/data/user";
import { sanityClient } from "@/sanity/lib/private-client";
import { SanityAdapter } from "@/sanity/sanity-adapter";
import type { UserRole } from "@/types/user-role";
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  pages: { signIn: "/auth/login", error: "/auth/error" },
  adapter: SanityAdapter(sanityClient),
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      return !!(await getUserById(user.id))?.emailVerified;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const user = await getUserById(token.sub);
      if (!user) return null;
      token.isOAuth = !!(await getAccountByUserId(user._id));
      token.name = user.name;
      token.email = user.email;
      token.link = user.link;
      token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.link =
          typeof token.link === "string" ? token.link : undefined;
        session.user.role = token.role as UserRole;
        session.user.isOAuth = token.isOAuth === true;
      }
      return session;
    },
  },
});
