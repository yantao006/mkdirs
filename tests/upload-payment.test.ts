import assert from "node:assert/strict";
import test from "node:test";
import {
  allowedPrice,
  paymentOrderId,
  stripeAmount,
} from "../src/lib/payment-policy";
import { PricePlans } from "../src/lib/submission";
import { readBoundedBody, validImageSignature } from "../src/lib/upload";

test("image uploads reject active content and spoofed MIME", () => {
  assert.equal(
    validImageSignature(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
    false,
  );
  assert.equal(
    validImageSignature(new TextEncoder().encode("<script>"), "image/png"),
    false,
  );
  assert.equal(
    validImageSignature(
      Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    validImageSignature(Uint8Array.from([255, 216, 255, 0]), "image/jpeg"),
    true,
  );
  assert.equal(validImageSignature(new Uint8Array(), "image/jpeg"), false);
});

test("streamed uploads have an enforced byte limit even without Content-Length", async () => {
  const request = new Request("https://example.invalid", {
    method: "POST",
    body: "12345",
  });
  await assert.rejects(() => readBoundedBody(request, 4), RangeError);
  assert.equal(
    new TextDecoder().decode(
      await readBoundedBody(
        new Request("https://example.invalid", {
          method: "POST",
          body: "1234",
        }),
        4,
      ),
    ),
    "1234",
  );
});

test("payment uses configured prices rather than client-provided plan and amount", () => {
  const old = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = "price_isolated_test";
  try {
    assert.equal(allowedPrice(PricePlans.PRO, "price_isolated_test"), true);
    assert.equal(allowedPrice(PricePlans.FREE, "price_isolated_test"), false);
    assert.equal(
      allowedPrice(PricePlans.SPONSOR, "price_isolated_test"),
      false,
    );
    assert.equal(allowedPrice(PricePlans.PRO, "price_unapproved"), false);
    assert.equal(paymentOrderId("cs_test_123"), paymentOrderId("cs_test_123"));
    assert.ok(paymentOrderId("cs_test_123").startsWith("mkdirsPrivate.order."));
    assert.throws(() => paymentOrderId("drafts.malicious"));
  } finally {
    if (old === undefined)
      Reflect.deleteProperty(process.env, "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID");
    else process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = old;
  }
});

test("Stripe zero-decimal currency prices are not divided by 100", () => {
  assert.equal(stripeAmount(1200, "usd"), 12);
  assert.equal(stripeAmount(1200, "jpy"), 1200);
  assert.equal(stripeAmount(1200, "KRW"), 1200);
  assert.equal(stripeAmount(1200, "isk"), 12);
});
