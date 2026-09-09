import { getUserByEmail } from "@/data/user";
import { verifyPassword } from "@/lib/password";
import { LoginSchema } from "@/lib/schemas";
import { serviceConfigured } from "@/lib/service-config";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
  trustHost: true,
  providers: [
    ...(serviceConfigured("github") ? [GitHub] : []),
    ...(serviceConfigured("google") ? [Google] : []),
    Credentials({
      async authorize(credentials) {
        if (!serviceConfigured("accounts")) return null;
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await getUserByEmail(parsed.data.email);
        if (!user?.password || !user.emailVerified) return null;
        if (!(await verifyPassword(parsed.data.password, user.password)))
          return null;
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
