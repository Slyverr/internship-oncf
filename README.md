# ECommand

ECommand is ONCF's freight operations workspace. Customers submit transport orders; commercial agents manage orders, forecast programs, and claims; administrators manage users, access profiles, reference data, and reports.

## What the project includes

- Permission-based access and customer ownership scopes, with administrator-managed custom access profiles.
- Client registration with administrator review, user and customer management, and reference-data management.
- Order, forecast-program, and claim workflows, including history, comments, attachments, and in-app notifications.
- Operational dashboards, filtered reports, and printable report exports.
- English interface strings centralized for translation; French is not enabled as a runtime locale yet.

**Integration boundary:** order and forecast-program workflows call the stable DTM gateway exported by the API's DTM module. `DTM_MODE=simulator` selects a local adapter; `DTM_SIMULATOR_RESPONSE_MODE=manual` keeps requests pending for an admin decision, while `auto` applies the configured delayed acknowledgement. Unset or other `DTM_MODE` values select a no-op adapter. No adapter currently contacts ONCF. Replacing the simulator with a real DTM adapter should only require configuring the DTM module provider, while preserving both workflows. The real adapter still needs the ONCF endpoint, authentication, payload, acknowledgement, and retry contract. Password recovery uses SMTP only when configured; otherwise development messages are written to a local mailbox.

Admins can also create service credentials for a future tracking feed. These credentials are hashed at rest, shown only on creation or rotation, and limited to submitting wagon positions. This is an inbound integration scaffold, not a live ONCF connection; see [integration credential setup](docs/development/integration-credentials.md).

For local simulation, set `DTM_MODE=simulator` in `apps/api/.env`. The default `DTM_SIMULATOR_RESPONSE_MODE=manual` keeps each request pending until an admin accepts or rejects it on `/dashboard/integrations/dtm`. Set it to `auto` to apply the delayed `DTM_SIMULATOR_RESULT` (`ACCEPTED` or `REJECTED`) after `DTM_SIMULATOR_DELAY_MS` (default `2000`). Automatic responses use in-process timers, so restarting the API cancels those timers; pending records remain visible and can still be resolved manually. Neither mode contacts ONCF.

## Stack

- Bun workspaces and Turborepo
- Next.js 16 and React 19 (`apps/web`)
- NestJS 11 (`apps/api`)
- PostgreSQL and Drizzle ORM
- SeaweedFS S3-compatible object storage for attachments
- Shared permissions, enums, and domain values (`packages/shared`)

The repository implementation is authoritative. The internship reference report describes an older Java/Spring design; this project uses the TypeScript stack above.

## Requirements

- Bun 1.4.2
- Podman with Compose support or Docker Compose
- Node.js 24 for the isolated browser workflow runner and reliable OpenAPI generation
- Chromium for browser workflow tests

## Local setup

1. Install workspace dependencies from the repository root:

   ```sh
   bun install
   ```

2. Start PostgreSQL and SeaweedFS:

   ```sh
   podman compose up -d postgres seaweedfs
   ```

   Use `docker compose` if Docker Compose is installed instead.

3. Create local environment files:

   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Keep `.env` files local. Replace `JWT_SECRET` with a randomly generated value. The checked-in Compose credentials are for local development only.

4. Apply the current development schema and seed reference/demo data:

   ```sh
   cd apps/api
   bun run db:push
   bun run seed
   cd ../..
   ```

   Review Drizzle's proposed schema changes before accepting them. Migrations are intentionally deferred while the domain model is still being refined; use `db:push` only with a disposable local database.
   The development seed adds clearly marked local tracking samples with varied goods, statuses, and dates. They include a multi-wagon order, a 12-wagon consist for scrollbar review, and an assigned wagon without a position report. All coordinates and reports are synthetic preview data, not live ONCF data.
   The local seed accounts are `admin@oncf.ma`, `client@oncf.ma`, and `agent@oncf.ma`; all use `password123` in a development database only.

5. Start the API and web app from the root:

   ```sh
   bun run dev
   ```

   Open the web app at <http://localhost:3000>, the API at <http://localhost:8000>, and Swagger at <http://localhost:8000/api-docs>.

The default development command watches API and web sources and runs the web TypeScript watcher. For lower memory use, run `bun run dev:light`; the API starts once and must be restarted manually after API changes. Both commands wait for API health before starting Next.js.

## Verification and development commands

Run these from the repository root:

```sh
bun run format-and-lint
bun run typecheck
bun run test
bun run build
bun run verify
```

`bun run verify` runs formatting/linting, workspace typechecks, tests, and production builds, stopping at the first failure. The web verification build uses a separate `.next-verify` output directory.

For isolated API and browser workflows, install Chromium first and run:

```sh
node node_modules/playwright/cli.js install --with-deps chromium
bun run test:e2e:browser
```

The runner uses a disposable `ecommand_e2e` database and tears down its Compose services after the run. See [development workflow](docs/development/workflow.md) for focused tests, screenshot review, generated API client updates, and runtime details.

## Repository map

- `apps/web` — user interface, route layouts, and generated API client.
- `apps/api` — feature modules, OpenAPI contract, database schema, and seed scripts.
- `packages/shared` — permissions, enums, and shared domain definitions.
- `docs` — architecture, workflows, security, interface rules, and current readiness.

Start with the [documentation index](docs/README.md) for architecture, setup, authorization, product readiness, and interface guidance.
