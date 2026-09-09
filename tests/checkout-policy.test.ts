import assert from "node:assert/strict";
import test from "node:test";
import {
  checkoutFailureMessage,
  checkoutIdempotencyKey,
  checkoutPaymentOptions,
} from "../src/lib/checkout-policy";

test("ordinary checkout overrides the merchant Managed Payments default", () => {
  assert.deepEqual(checkoutPaymentOptions, {
    managed_payments: { enabled: false },
  });
});

test("checkout keys version the changed request but deduplicate repeated clicks", () => {
  const key = checkoutIdempotencyKey("item", "rev", "price");
  assert.equal(key, checkoutIdempotencyKey("item", "rev", "price"));
  assert.notEqual(key, "mkdirs-checkout-item-rev-price");
  assert.notEqual(key, checkoutIdempotencyKey("item", "rev2", "price"));
});

test("checkout errors identify the failing step without exposing upstream secrets", () => {
  for (const error of [
    null,
    new Error("sk_test_PRIVATE document body"),
    { type: "StripeAuthenticationError", message: "sk_test_PRIVATE" },
  ]) {
    const message = checkoutFailureMessage("prices.retrieve", error);
    assert.match(message, /prices.retrieve/);
    assert.doesNotMatch(message, /PRIVATE|document body/);
  }
  assert.match(
    checkoutFailureMessage("checkout.sessions.create", {
      message: "the product tax code is missing",
    }),
    /Managed Payments requires a product tax code/,
  );
  assert.match(
    checkoutFailureMessage("checkout.sessions.create", {
      type: "StripeIdempotencyError",
    }),
    /conflicting checkout request/,
  );
});
