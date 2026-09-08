import "server-only";

// This public, read-only application never receives an editor token.
// SANITY_API_TOKEN is reserved for the local content import command.
export const token: string | undefined = undefined;
