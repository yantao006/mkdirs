# Stripe checkout acceptance

## Environment

- Origin: https://yanbao.space, Cloudflare Worker `mkdirs`.
- Verified Worker version: `f6406599-7d11-4869-9398-a44836a2c0a5`.
- Browser: ego-browser, hard-refresh of the deployed payment page, no local Next server.
- Product: Seedream 5.0 AI Image Generator, originally Free / Pending / Not published.
- Payment: mkdirs Pro, USD 19, Stripe sandbox, test card `4242 4242 4242 4242`.
- Public build environment: all `wrangler.jsonc` vars, including both price IDs and `DEFAULT_AI_PROVIDER=deepseek`.

## Diagnosis

The click was the trigger, and the generic toast was only the symptom.
The first throw was `checkout.sessions.create`, after authentication, configured-price validation, item ownership, Stripe price lookup and billing-customer persistence had passed.
Temporary stage-aware diagnostics exposed Stripe's actual rejection: `Invalid line_items[0]: the product tax code is missing` and `Product tax code is required for Managed Payments`.
The merchant had Managed Payments enabled by default, while this integration implements ordinary Checkout for directory placement.

The fix sends `managed_payments[enabled]=false` per session, without changing the merchant account, product tax codes, keys or webhook configuration.
Stripe documents this override at https://docs.stripe.com/payments/managed-payments/set-up.
Changing the request initially exposed an existing Stripe idempotency record with different parameters, so the request contract now uses a stable `mkdirs-checkout-v2` key.
Final diagnostics return safe error categories and the failed stage rather than raw upstream error messages.

## Live acceptance

1. Signed in through the site's Google button and opened the existing pending submission's payment page.
2. Clicked Pro **Pay & Publish Right Now** and reached Stripe-hosted Checkout showing `mkdirs Pro`, `US$19.00` and the sandbox indicator.
3. Used Stripe's return link and verified `/payment/<item-id>?pay=failed`, with the submission still Free / Pending / Not published.
4. Clicked Pro again and returned to Checkout successfully.
5. Paid with the specified test card, a future expiry and test CVC; no live charge was made.
6. Stripe returned to `/publish/<item-id>` showing **Review and publish product**, **Publish Now** and **Publish Later**.
7. Chose **Publish Later** and verified the dashboard showed Pro / Success / Not published, confirming persisted webhook-driven payment state rather than relying only on a success URL.

The item remains unpublished for the owner to publish deliberately.
Sponsor payment and the customer portal were not exercised in this acceptance.

## Regression checks

- `pnpm lint:check` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed all 24 tests, including Managed Payments override, versioned retry keys and error-message privacy.
- `pnpm run build:cloudflare` and `pnpm run deploy` succeeded against the confirmed account and existing Worker.

This branch also contains the supervisor-provided live-launch patch, preserving previously deployed login/private-ID, URL normalization, AI fetch, button navigation, Worker fetch transport and public configuration changes that were absent from the starting default-branch commit.
