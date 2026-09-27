# ECommand API

NestJS REST API for ECommand. It uses PostgreSQL through Drizzle ORM and MinIO for order attachments.

## Local development

From the repository root, copy `apps/api/.env.example` to `apps/api/.env`, set a private `JWT_SECRET`, and start PostgreSQL and MinIO with `podman compose up -d postgres minio` (or `docker compose`). Then run:

```sh
cd apps/api
bun run db:push
bun run seed
bun run dev
```

The API listens on port 8000 by default. OpenAPI documentation is at `/api-docs`.

The Drizzle schema under `drizzle/` is the current database source of truth. Migrations are intentionally deferred while the schema is being refined. `db:push` synchronizes a development database directly; inspect proposed changes before applying them to any database containing important data.

Set `SMTP_HOST` and `SMTP_FROM` to send password recovery through an SMTP provider. Set `SMTP_USER` and `SMTP_PASSWORD` together when the server requires authentication. If SMTP is not configured, messages are written to `LOCAL_MAILBOX_PATH` (default `.local-mailbox`) as `.eml` files. Open one to use its reset link. The mailbox directory is ignored by Git because it contains temporary reset tokens.

## Commands

- `bun run typecheck`
- `bun run build`
- `bun run seed:ref`
- `bun run seed:dev`
- `bun run db:push`
- `bun run db:studio`

See the repository's [architecture guide](../../docs/project/architecture.md) and [database workflow](../../docs/development/workflow.md#database-workflow).
