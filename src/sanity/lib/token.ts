import "server-only";

// Server-only credential for this product's authenticated content operations.
// Never import this module into Studio, browser components, or public DTOs.
export const token = process.env.SANITY_API_TOKEN;
