# Project agent memory

## Product and runtime

mkdirs is an independent, read-only public directory derived from the Apache-2.0 Mkdirs template.
Keep the incumbent Tailwind/shadcn visual system; do not replace the app with a different framework or design without approval.
Supported scope, source attribution, and trademark boundaries are documented in `README.md`.

The application uses Next.js App Router, React, Sanity, and the OpenNext Cloudflare adapter.
Deployment and content maintenance are documented in `docs/operations.md`.
`wrangler.jsonc` and `.env.example` are the authoritative public configuration.
Use the actual variable names in those files, not variable names from other Next.js templates.

## Commands

- Install: `pnpm install --frozen-lockfile` with the Node/pnpm versions declared in `package.json`.
- Read-only lint: `pnpm lint:check`.
- Type check: `pnpm typecheck`.
- Regression tests: `pnpm test`.
- Cloudflare build: `pnpm build:cloudflare`.
- Deploy this product's existing Worker: `pnpm run deploy`, after confirming the account and resource.
- Schema/query types: `pnpm typegen`; never manually edit `sanity.types.ts` or `schema.json`.
- Starter content validation/import: `pnpm content:import`; see operations for the explicit write gate.

The inherited `pnpm lint`, `pnpm lint:fix`, and `pnpm format` commands write files; do not run unsafe fixes.
The generated shadcn UI primitives and generated Sanity files are excluded from Biome.

## Architecture and boundaries

- `src/app/(website)/(public)/` owns public browsing, search, taxonomies, and resource pages.
- `src/lib/directory-query.ts` owns parameter normalization, query construction, publication visibility, and safe external URLs.
- `src/sanity/lib/queries.ts` owns named GROQ projections, with regression coverage in `tests/directory.test.ts`.
- `src/sanity/lib/fetch.ts` reads published content without a write token and without persistent Next.js ISR bindings.
- `/studio` loads `src/components/studio.tsx` client-side so the editor stack does not inflate the public server bundle.
- `sanity.config.ts` exposes public content editing only; the dataset must not hold credentials, accounts, orders, or private notes.
- `src/middleware.ts` rejects application mutations, and every template action in `src/actions/` explicitly rejects direct calls.
- Removed auth/payment/mail/submission routes are not supported features; dormant template modules must not be silently re-enabled.
- `src/components/shared/custom-mdx.tsx` renders plain Markdown without executing MDX expressions or arbitrary HTML.
- `content/directory.json` is the reviewed starter catalog; its importer never overwrites editor changes.

Do not add caching databases, queues, paid plans, other products' credentials, or DNS changes as incidental deployment fixes.
Validate against the real Cloudflare entry point; a build or successful upload alone is not a functional acceptance test.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
