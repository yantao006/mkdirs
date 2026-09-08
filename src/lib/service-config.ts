export const serviceRequirements = {
  accounts: ["AUTH_SECRET", "SANITY_API_TOKEN"],
  email: ["RESEND_API_KEY", "RESEND_EMAIL_FROM"],
  submissionNotifications: [
    "RESEND_API_KEY",
    "RESEND_EMAIL_FROM",
    "RESEND_EMAIL_ADMIN",
  ],
  newsletter: ["RESEND_API_KEY", "RESEND_EMAIL_FROM", "RESEND_AUDIENCE_ID"],
  google: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
  github: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
  payment: [
    "STRIPE_API_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID",
  ],
} as const;

export type ServiceName = keyof typeof serviceRequirements;

/** Only names and boolean availability may be passed to the browser, never values. */
export function missingServiceVariables(service: ServiceName): string[] {
  return serviceRequirements[service].filter((name) => !process.env[name]);
}

export function serviceConfigured(service: ServiceName): boolean {
  return missingServiceVariables(service).length === 0;
}

export function requireService(service: ServiceName): void {
  if (!serviceConfigured(service)) {
    throw new Error(`${service} is awaiting this site's service configuration`);
  }
}
