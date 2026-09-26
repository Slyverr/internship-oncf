# ECommand Web

Next.js App Router frontend for ECommand. It uses the shared workspace package and the generated API client in `src/lib/api`.

## Local development

Copy `apps/web/.env.example` to `apps/web/.env`. The defaults expect the API at `http://localhost:8000`. From the repository root, run `bun run dev` to start the API and web app together.

## Commands

- `bun run typecheck`
- `bun run build`
- `bun run generate:api` (requires the API OpenAPI JSON endpoint to be available)

See the repository's [architecture guide](../../docs/architecture.md) and [development conventions](../../docs/development.md).
