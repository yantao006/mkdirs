import { PricePlans } from "./submission";

const zeroDecimalCurrencies = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

/** Stripe charge amounts use two decimals except its documented zero-decimal set. */
export function stripeAmount(amount: number, currency: string): number {
  return amount / (zeroDecimalCurrencies.has(currency.toLowerCase()) ? 1 : 100);
}

export function configuredPrice(plan: string): string | undefined {
  if (plan === PricePlans.PRO)
    return process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  if (plan === PricePlans.SPONSOR)
    return process.env.NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID;
  return undefined;
}

export function allowedPrice(plan: string, priceId: string): boolean {
  const expected = configuredPrice(plan);
  return Boolean(expected && priceId && expected === priceId);
}

export function paymentOrderId(sessionId: string): string {
  if (!/^cs_[a-zA-Z0-9_]{1,150}$/.test(sessionId))
    throw new Error("Invalid checkout session ID");
  return `mkdirsPrivate.order.${sessionId}`;
}
