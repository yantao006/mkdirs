import "server-only";

/** Opaque keyed IDs make concurrent registrations collide without putting email addresses in ID history. */
export async function privateIdentityId(
  kind: "user" | "account",
  identity: string,
): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Account configuration is missing");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${kind}:${identity}`),
  );
  return `mkdirsPrivate.${kind}.${Buffer.from(digest).toString("hex")}`;
}
