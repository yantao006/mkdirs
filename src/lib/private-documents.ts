export const PRIVATE_DOCUMENT_ROOT = "mkdirsPrivate";

export type PrivateDocumentType =
  | "user"
  | "account"
  | "verificationToken"
  | "passwordResetToken"
  | "order";

/** IDs contain no email, token, provider account identifier, or other personal data. */
export function privateDocumentId(type: PrivateDocumentType): string {
  return `${PRIVATE_DOCUMENT_ROOT}.${type}.${crypto.randomUUID()}`;
}

/** User/account IDs are HMAC-SHA256 hex; tokens and orders use UUIDs. */
export function isPrivateDocumentId(id: string): boolean {
  return /^mkdirsPrivate\.(user|account|verificationToken|passwordResetToken|order)\.([a-f0-9]{64}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/.test(
    id,
  );
}

export function privateDocumentQuery(
  type: PrivateDocumentType,
  fields: string[],
): string {
  const allowedFields = new Set([
    "_id",
    "email",
    "identifier",
    "token",
    "userId",
    "provider",
    "providerAccountId",
  ]);
  if (fields.some((field) => !allowedFields.has(field))) {
    throw new Error("Unsupported private query field");
  }
  return `*[_type == "${type}" && _id in path("${PRIVATE_DOCUMENT_ROOT}.${type}.*")${fields.map((field) => ` && ${field} == $value_${field}`).join("")}][0]`;
}
