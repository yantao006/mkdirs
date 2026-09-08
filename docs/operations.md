# Operations and content updates

## Production configuration

The application configuration is in `wrangler.jsonc`, `open-next.config.ts`, and `.env.example`.
The public entry point is https://mkdirs.yantao006.workers.dev .
The dedicated Worker name is `mkdirs`.
The deployed directory required no custom domain or DNS change, and no billing plan has been modified.
Validate the full-feature bundle and authenticated request CPU against the actual account limits before promoting it.
The complete feature scope also needs the product-specific external integrations tracked in [features.md](features.md).

| Variable | Source | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | The actual Worker HTTPS origin | No |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | This product's Sanity project settings | No |
| `NEXT_PUBLIC_SANITY_DATASET` | This product's public content dataset | No |
| `SANITY_API_TOKEN` | Product-scoped server-side identity/content operations and local import | Yes; Worker secret only, never client code |
| `AUTH_SECRET` | Generate cryptographically for this product; Auth.js sessions and opaque identity IDs | Yes; Worker secret only |

Public variables must agree between the Next.js build environment and Worker vars because Next.js can inline them into client bundles.
For this deployment the Sanity project ID is `it1vepjy` and the dataset is `production`.
When adapting this repository for a different product, use a separate project and update the configuration rather than reusing this content database.

Sanity may automatically grant a $0 Growth Trial to a newly created project.
The management page for this project states it will automatically return to Free after the trial ends.
Sanity storage relies only on Free-compatible root content and fixed private document-subpath rules, not paid private datasets, paid roles, Sanity AI, or trial-only features.
Do not upgrade a billing plan to resolve an implementation problem without explicit approval.

## Updating resources in Studio

1. Open https://mkdirs.yantao006.workers.dev/studio and log in with your authorized Sanity editor account.
2. Select Item, Category, Tag, Collection, Group, or Page from the content sidebar.
3. For an item, set its name, unique slug, official HTTP(S) website, short description, and optional Markdown introduction.
4. Connect category, tag, and collection references as appropriate.
5. Add images with accurate alt text; do not describe an illustration as a real screenshot.
6. Set Publish Date to a time at or before now and publish the Sanity document.
7. Check the resource's `/item/<slug>` URL and its filters on the public site.

Use Force Hidden to remove an item from public listings and details without deleting it.
Unpublished documents, future publication dates, and hidden items are excluded from public details and the sitemap.
Markdown is rendered as text markup, not executable JSX or MDX; arbitrary HTML is skipped.

Studio authenticates directly against Sanity without embedding the application's write token in its bundle.
Application accounts and submissions use a separate server-only client with the product-scoped Worker secret.
The project's CORS allow-list must include the exact production origin with credentials allowed for Studio.
Do not add wildcard credentialed origins.
Draft-preview endpoints require validated Sanity preview authorization; anonymous public content queries must never gain draft access.

## Non-destructive starter import

Edit `content/directory.json`, review each official website, and keep the public-field structure used by the existing entries.
The import supports only the documented public catalog fields and validates HTTPS URLs and unique slugs.
It does not import user accounts, orders, credentials, prices, or analytics.

Create an ignored `.env.import.local` file with `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and a project-scoped `SANITY_API_TOKEN` with content-write access.
Protect that file with `chmod 600 .env.import.local`.
Do not print, paste, or commit the token.

```sh
# Validation only, no token or network mutation required:
pnpm content:import

# Explicitly confirm the destination, then create missing documents:
CONTENT_ENV_FILE=.env.import.local CONFIRM_SANITY_PROJECT=it1vepjy \
  pnpm content:import --apply
```

Imports use `createIfNotExists`, so existing editor changes are preserved, and no existing documents are deleted or replaced.
Update existing entries in Studio; changing the seed JSON does not overwrite them.
Resource IDs use hyphens rather than dots because Sanity document paths containing dots have different anonymous-read access behavior.
The initial run corrected only its own newly created seed IDs to ordinary public document IDs and verified anonymous reads.

The imported `pricePlan: free` field is an inherited template submission classification, not a claim that a listed tool is free.
The public resource card does not display that classification as the listed tool's own price.
Directory submission pricing is a separate Stripe-backed capability and requires approved product prices.
The editor retains the original submission/payment review fields and private identity management.
Sensitive document types cannot be created or duplicated as public root documents through Studio.
Only the explicitly designated website administrator may send review emails through `/api/send-email`; being signed into Studio alone is not sufficient.
Publish the final review state in Studio before using its notification action.

## Deploying

First confirm the intended Cloudflare account with `pnpm exec wrangler whoami` and check that a same-name Worker belongs to this product.
Do not deploy over a different product's Worker.
The deployment credentials belong in Wrangler's login flow or a narrowly scoped CI secret, never in the repository.

```sh
pnpm install --frozen-lockfile
pnpm typegen
pnpm lint:check
pnpm test
pnpm typecheck
pnpm build:cloudflare
pnpm exec wrangler deploy --dry-run --outdir artifacts/worker-bundle
pnpm run deploy
SMOKE_ORIGIN=https://mkdirs.yantao006.workers.dev node scripts/smoke-directory.mjs
```

Do not use automatic framework migration commands that create caching resources as a side effect.
The app deliberately reads published content on demand with a bounded upstream timeout and no persistent Next.js incremental-cache binding.
A failed content request reaches a retryable error boundary rather than being disguised as an empty directory.
No application dev server is needed for the launch verification; use the actual Worker URL.

On networks requiring the existing system proxy, prefix the smoke command with `NODE_USE_ENV_PROXY=1` (Node 22.21+).
The public layout renders on demand, and content detail routes have no early loading boundary, so missing content returns HTTP 404 rather than a streamed HTTP 200.
`htmlLimitedBots` disables streaming metadata for every client so missing-content checks run before response headers.
Wrangler `keep_names: false` is required because next-themes serializes an inline function; injected esbuild name helpers would otherwise reference a missing `__name` in the browser.
Version preview URLs are disabled in the normal release configuration.

Check current [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) and actual account limits, including uncompressed bundle size, startup CPU, per-request CPU, and memory.
Old OpenNext documentation's gzip limits are not an authoritative current platform limit.
Record the source commit, actual deployment/version ID, dry-run size, and complete HTTPS URL for every release.

## Rollback

```sh
pnpm exec wrangler deployments list --name mkdirs
pnpm exec wrangler versions list --name mkdirs
pnpm exec wrangler rollback <previous-version-id> --name mkdirs
```

Only select a known previous version of this dedicated Worker.
A Worker rollback does not change Sanity content; restore or correct content separately in Studio.
Keep source and public build variables together when rebuilding an older revision.
Do not select the temporary upstream-failure probe version as a rollback target.

## Validation

`pnpm test` covers parameter injection, malformed pagination, combined filters, page boundaries, hidden/unpublished/future items, public user-field projection, safe links, non-executable Markdown, private identity ID/query boundaries, reviewed/paid publish eligibility, starter catalog structure, upload byte/signature boundaries, Stripe price allow-listing, and currency units.
CI uses public build configuration only and never gets the editor token.
It regenerates Sanity types, rejects generated-file drift, and runs non-incremental TypeScript checks plus the production OpenNext build.
`tests/item-grid.types.ts` checks the grid's ordinary-item and sponsor-query contracts without coupling container props to a single query's inferred empty type.

For a release, verify 1440, 768, and 390 pixel viewports with real browser interactions:

- Home, search submit and Enter, category/tag combination, clear filters, sort, and pagination.
- Categories, tags, collections, detail pages, and official external links.
- Mobile navigation, refresh, direct URLs, browser back/forward, empty results, and genuine 404s.
- Upstream-failure recovery, console errors, image/font/script MIME types, and metadata/robots/sitemap.
- Anonymous or non-owner API/Server Action calls must not mutate protected content, send privileged notifications, or create unauthorized payments.
- Verify real registration, verification, login/logout, settings, submission/review/publish, and each configured external integration according to [features.md](features.md).
- Browser bundles and page/RSC responses must contain neither an editor token nor private user fields.

Do not treat an HTTP 200, successful upload, or passing unit tests as a substitute for live browser validation.
