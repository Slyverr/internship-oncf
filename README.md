# ECommand

ECommand is an ONCF freight-order portal. This repository uses a Bun/Turborepo monorepo with a Next.js web app, a NestJS API, PostgreSQL/Drizzle, and MinIO for attachments.

## Requirements

- Bun 1.4.x
- Podman with Compose support or Docker Compose

## Local setup

1. Install packages from the repository root:

   ```sh
   bun install
   ```

2. Start PostgreSQL and MinIO:

   ```sh
   podman compose up -d postgres minio
   ```

   Use `docker compose` in place of `podman compose` if Docker Compose is installed.

3. Copy the app environment templates:

   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Keep these files local. Replace `JWT_SECRET` with a randomly generated value before running the API. The checked-in Compose credentials are for local development only.

4. Synchronize the current Drizzle schema to the local database and seed reference/demo data:

   ```sh
   cd apps/api
   bun run db:push
   bun run seed
   cd ../..
   ```

   The schema in `apps/api/drizzle` is the source of truth. Migrations are intentionally deferred while the data model is being refined. `db:push` is for the local development database; review Drizzle's proposed changes before accepting them, especially if the database contains data you need.

5. Start both apps from the repository root:

   ```sh
   bun run dev
   ```

   Web: <http://localhost:3000>
   API: <http://localhost:8000>
   Swagger: <http://localhost:8000/api-docs>

Password recovery can use any SMTP provider by setting `SMTP_HOST` and `SMTP_FROM` in `apps/api/.env`; add `SMTP_USER` and `SMTP_PASSWORD` together when authentication is required. Without complete SMTP settings, `.eml` files are written to `apps/api/.local-mailbox`. Open the newest message in a mail client or text editor and use its reset link. The directory is ignored by Git because those files contain reset tokens.

## Useful commands

Run from the repository root:

```sh
bun run build
bun run typecheck
bun run format-and-lint
```

The API also provides `bun run seed:ref`, `bun run seed:dev`, `bun run db:push`, and `bun run db:studio` from `apps/api`.

## Repository layout

- `apps/web` — Next.js App Router UI and generated API client.
- `apps/api` — NestJS feature modules and Drizzle schema/queries.
- `packages/shared` — shared roles, permissions, enums, and catalog definitions.
- `docs` — maintained architecture, development conventions, and MVP status.

The API is a modular service. Domain code is organized by feature (`orders`, `programs`, `claims`, and others); controllers handle HTTP, services enforce workflows, and query classes access PostgreSQL through Drizzle. See the [documentation index](docs/README.md) for the architecture and development conventions.
