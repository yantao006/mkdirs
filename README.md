# mkdirs

An independent directory of useful developer tools and web resources, built from the open-source [Mkdirs template](https://github.com/MkThingsHQ/mkdirs).

**Website:** https://mkdirs.yantao006.workers.dev

## Directory capabilities

- Browse a curated starter catalog, search names and descriptions, and combine category and tag filters.
- Explore categories, tags, collections, resource details, official external links, and paginated results.
- Use the responsive navigation and light/dark themes.
- Edit public content in Sanity Studio at `/studio`, or import reviewed entries from `content/directory.json`.

The starter catalog contains 16 resources checked against their official websites.
Its reference-card artwork is created for this directory, not copied product logos or website screenshots.
Listings do not claim paid placement, traffic, ratings, endorsements, or current prices.

The product scope includes the template's accounts, OAuth, dashboard, submission/review/publishing, Stripe payments and sponsorship, email/newsletter, AI assistance, blog, and Studio preview capabilities.
These original routes and service actions are being restored and connected on this branch; the current public deployment remains the verified directory release until the full feature checks pass.
See the [feature and integration matrix](docs/features.md) for implementation and configuration status rather than assuming a visible button means a service is connected.
Sanity Studio uses the editor's own Sanity login directly, not a browser-embedded application API token.

## Development and checks

Use Node.js 22 and pnpm 9.14.3.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm test
pnpm lint:check
pnpm typecheck
pnpm build:cloudflare
```

`pnpm lint:check` is read-only.
The inherited `pnpm lint` and `pnpm format` commands write files; do not use unsafe fixes.
Sanity types are generated using `pnpm typegen` after changes to the schema or named queries, never edited manually.

The runtime is Next.js 15 / React 19 with the OpenNext Cloudflare adapter, retaining the template's Tailwind and shadcn design.
Studio is loaded client-side to keep its editor dependencies out of the public Worker server bundle.
The Cloudflare adapter needs no D1, R2, queue, or Cloudflare Images binding.
Payments use Stripe, email/newsletter use Resend, and OAuth/AI use the product-specific providers listed in the integration matrix.

See [operations and content updates](docs/operations.md) for importing content, deploying, rolling back, and validating the site.
CI runs lint, type checking, regression tests, and the production Cloudflare build without secrets.

## Content and access boundaries

This product uses its own Sanity Free public dataset with two distinct document access paths.
Public content has ordinary root IDs and is read anonymously; identity, account, verification/reset-token, and order records must use the private `mkdirsPrivate.<type>.<opaque-id>` subpaths.
Sanity's [fixed access rules](https://www.sanity.io/docs/content-lake/ids) require authentication for all subpath IDs, including when the dataset is public.
Never create sensitive records with root IDs or put personal data in an ID.
Authenticated reads and writes use the server-only client; the Sanity token must never reach browser bundles, public responses, or logs.
The import command requires explicit target-project confirmation and never overwrites existing editor changes.

## Source and license

The original Mkdirs template is by [MkThingsHQ](https://github.com/MkThingsHQ/mkdirs).
This deployment is independently operated and is not the template author's demo or official service.
The template author's contact details and commercial policies do not apply to this directory.

Code is licensed under [Apache License 2.0](LICENSE), with the original license and attribution preserved.
The license does **not** grant permission to use the Mkdirs name, logo, or other trademarks to identify or promote derived products.
The project name `mkdirs` is retained at the project owner's direction; no trademark authorization is claimed, and the upstream logo is not used.
Names of listed resources identify those resources and do not imply affiliation or endorsement.
