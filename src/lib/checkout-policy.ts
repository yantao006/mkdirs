// Explicitly opt out of merchant-level Managed Payments defaults. Directory
// placements use ordinary Checkout, not the merchant-of-record digital goods flow.
export const checkoutPaymentOptions = {
  managed_payments: { enabled: false },
} as const;

export function checkoutIdempotencyKey(
  itemId: string,
  revision: string,
  priceId: string,
) {
  // Version the request contract when changing Stripe parameters. Old failed
  // requests may still have an idempotency record at Stripe.
  return `mkdirs-checkout-v2-${itemId}-${revision}-${priceId}`;
}

export function checkoutFailureMessage(stage: string, error: unknown): string {
  const failure = error as {
    type?: string;
    code?: string;
    message?: string;
  } | null;
  let reason =
    "The service could not complete this step. Please retry or contact support.";
  if (failure?.type === "StripeAuthenticationError") {
    reason =
      "Stripe rejected this site's payment credentials. Contact support.";
  } else if (failure?.type === "StripeConnectionError") {
    reason = "Stripe could not be reached. Please retry shortly.";
  } else if (failure?.type === "StripeIdempotencyError") {
    reason = "Stripe rejected a conflicting checkout request. Contact support.";
  } else if (failure?.code === "resource_missing") {
    reason =
      "The configured Stripe price or billing customer is unavailable. Contact support.";
  } else if (failure?.message?.includes("product tax code")) {
    reason =
      "Stripe Managed Payments requires a product tax code. Contact support to correct the checkout configuration.";
  }
  // Never forward upstream messages: they may contain credentials, private
  // document bodies, customer details, or checkout session URLs.
  return `Unable to open payment (${stage}): ${reason} No publication status has been changed.`;
}
