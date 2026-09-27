# Architecture

## Technology

- **Workspace:** Bun workspaces with Turborepo.
- **Web:** Next.js 16 App Router and React 19 in `apps/web`.
- **API:** NestJS 11 in `apps/api`.
- **Database:** PostgreSQL accessed with Drizzle ORM.
- **Files:** MinIO-compatible object storage, configured through API environment variables.
- **Shared domain code:** `packages/shared`.

The repository is the implementation source of truth. Reference PDFs include an older Java/Spring design; do not treat those technologies or service boundaries as implemented here.

## API structure

API features are grouped under `apps/api/src` (`auth`, `orders`, `programs`, `claims`, `customers`, `users`, `notifications`, `catalog`, `tracking`, `attachments`, and others). A typical request follows this path:

1. A controller binds the route, request DTO, and current authenticated user.
2. DTO decorators validate input through the global NestJS validation pipe.
3. Passport authentication and permission/ownership guards authorize the request.
4. The feature service enforces business rules and workflow transitions.
5. A query class reads or writes through the injected Drizzle service.
6. The controller returns a response DTO; NestJS Swagger exposes the OpenAPI contract. Custom route-parameter decorators must declare the parameter in OpenAPI through the shared `ApiPathParam` decorator.

Keep new feature behavior in the matching module. Avoid putting business logic in controllers or direct database access in controllers/services when the feature has a query class.

## Database layout

- Schemas and relations: `apps/api/drizzle/schemas` and `apps/api/drizzle/relations`.
- Reference data and seeders: `apps/api/src/database/reference-data` and `apps/api/drizzle/seed`.
- Runtime database access: `apps/api/src/database`.

Drizzle schemas and relations are changing; database migrations are intentionally deferred. See the [database workflow](../development/workflow.md#database-workflow) before changing the schema.

## Web structure

- Routes and layouts: `apps/web/src/app`.
- Feature components: `apps/web/src/components/<feature>`.
- Shared UI primitives: `apps/web/src/components/ui`.
- Authentication/profile context: `apps/web/src/providers`.
- Generated API hooks and DTOs: `apps/web/src/lib/api`.

The web API client is generated from the NestJS OpenAPI JSON endpoint with Orval. Change the API contract first, then regenerate the client; avoid maintaining separate handwritten copies of API DTOs.

## Cross-cutting behavior

- Shared roles, permissions, enums, and catalog definitions live in `packages/shared`.
- API configuration is accessed through `@nestjs/config`; examples are in `apps/api/.env.example`.
- Attachments use the storage service and configured object-storage backend.
- Password reset uses SMTP when `SMTP_HOST` and `SMTP_FROM` are configured. Without complete provider settings, development messages are saved as `.eml` files in the local mailbox path.
- DTM/status fields currently represent local workflow state. They do not prove that a remote ONCF system accepted a request.

- In-app notifications are stored as delivered immediately. Workflow services notify owners of changes made by another user; the inbox and unread badge use the authenticated recipient. Notification failures are logged independently of the saved workflow.
