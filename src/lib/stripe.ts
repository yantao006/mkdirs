import "server-only";
import Stripe from "stripe";

export function getStripe(): Stripe {
  if (!process.env.STRIPE_API_KEY) {
    throw new Error("Payments are awaiting this site's Stripe configuration");
  }
  return new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: "2024-04-10",
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 10000,
    maxNetworkRetries: 1,
  });
}
