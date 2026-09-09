# Feature and integration matrix

This branch restores the original template's implemented capabilities, rather than reducing the product to a read-only directory.
The currently deployed directory release is not a claim that every integration below is connected.
No third-party success response is simulated when configuration is missing.

| Capability | Authoritative implementation | Current status |
| --- | --- | --- |
| Directory, filters, search, stable pagination, details | `src/data/item.ts`, `src/lib/directory-query.ts`, public routes | Verified on the Cloudflare directory release |
| Authentication, verification, reset, sessions, settings | `src/auth.ts`, `src/auth.config.ts`, auth actions and routes | Restored; private storage implemented; email/provider configuration and live account tests pending |
| User dashboard, submit, edit, review, publish/unpublish | Protected routes, submission actions, `src/lib/submission.ts` | Restored with owner/revision guards, request-idempotent submission and authenticated bounded uploads; live workflow tests pending |
| Paid and sponsored submissions, checkout, customer portal | Payment actions, `src/app/api/webhook/route.ts` | Pro test-mode checkout, cancel, payment and webhook state verified on yanbao.space; Sponsor payment and customer portal still need E2E verification; live charges not enabled by this acceptance |
| Transactional email and newsletter | `src/lib/mail.ts`, newsletter actions | Restored; verified sender, recipient and audience required |
| AI-assisted website submission | `src/actions/fetch-website.ts` | Restored; approved provider, current model, credentials and test budget required |
| Blog, categories, authors, custom pages | Public blog routes and Sanity schemas | Routes restored; initial editorial content and final verification pending |
| Studio editing, review notifications, draft preview | `sanity.config.ts`, Studio and draft/email API routes | Editor login verified; complete review/preview integration in progress |
| Discord notifications | `src/lib/discord.ts` | Requires this product's authorized channel webhook |
| Analytics adapters | `src/components/analytics/` | Retained; only the explicitly selected and configured product analytics service should collect data |
| Theme, responsive navigation, alternate demo homepages | Layout and home/home2/home3 components | Directory layout verified; restored account navigation pending final live checks |
| Import/update tools and email preview | `scripts/`, package scripts, `emails/` | Retained; never run destructive batch commands against unverified targets |

## Product-specific configuration

Use `.env.example` and `src/lib/service-config.ts` for names and readiness requirements.
Never borrow another product's keys, merchant, content database, OAuth application, sender identity, or analytics property without explicit authorization.

- Accounts: `AUTH_SECRET`, `SANITY_API_TOKEN`, `AUTH_TRUST_HOST`, and the application's real `AUTH_URL`.
- Google OAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`; callback `/api/auth/callback/google`.
- GitHub OAuth: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`; callback `/api/auth/callback/github`.
- Resend: `RESEND_API_KEY`, `RESEND_EMAIL_FROM`, `RESEND_EMAIL_ADMIN`, `RESEND_AUDIENCE_ID`.
- Stripe: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID`; webhook `/api/webhook`.
- AI: `DEFAULT_AI_PROVIDER` and the selected provider's key; OpenRouter also requires `OPENROUTER_MODEL`.
- Discord: `DISCORD_WEBHOOK_URL`.
- Analytics: the selected OpenPanel, Google Analytics, Umami, or Plausible variables from `.env.example`.

Template prices, backlink policies, review-time guarantees, promotion promises, and author contact details are not this product's operating policy.
Paid prices and service promises require explicit product approval before publication.
Use isolated Stripe test resources for integration verification; no real charges are implied by deployment authorization.

## Checkout integration

`src/lib/stripe.ts` uses the fetch HTTP client for Cloudflare Workers.
`src/lib/checkout-policy.ts` explicitly disables Managed Payments per session, preserving ordinary Checkout even when the merchant enables Managed Payments by default.
Do not invent product tax codes or change merchant-wide settings to work around that default.
The checkout idempotency key versions the request contract; bump that version when changing request parameters to avoid conflicting with Stripe's existing request records.
The action reports the failing stage and safe diagnostic categories, never raw upstream messages or private customer data.
See `docs/checkout-e2e.md` for production test-mode acceptance evidence.

## Private data within Sanity Free

`src/lib/private-documents.ts` defines private document paths, with random token IDs.
`src/lib/identity-id.ts` creates keyed opaque user/account IDs so simultaneous registration cannot create duplicate identities without exposing emails in ID history.
`src/lib/payment-policy.ts` gives each checkout session one deterministic private order ID.
`src/sanity/lib/private-client.ts` performs authenticated, uncached server-only operations.
Sanity's fixed access rules deny anonymous access to subpath IDs; public content continues to use root IDs.
The implementation must never create a user, account, token, or order with a public root ID.
Rotating `AUTH_SECRET` invalidates existing sessions; retain existing identity records and do not regenerate their IDs during rotation.
Validate authenticated reads against anonymous query, CDN query, and direct document reads before enabling an identity flow.
Keep public DTO projections in `src/sanity/lib/queries.ts` separate from owner/admin data.

## Review and publishing contract

Free submissions start as `submitting`, move to `pending` when sent to review, and may publish only after `approved`.
Rejected submissions do not become publicly listed.
Pro and Sponsor submissions may publish only after the corresponding payment state is `success`.
The server must enforce this contract and ownership even if a caller bypasses the UI.
A missing service configuration remains an incomplete integration, not a successful submission, email, payment, or AI result.
