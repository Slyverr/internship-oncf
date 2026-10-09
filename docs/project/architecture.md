# Architecture

## Technology

- **Workspace:** Bun workspaces with Turborepo.
- **Web:** Next.js 16 App Router and React 19 in `apps/web`.
- **API:** NestJS 11 in `apps/api`.
- **Database:** PostgreSQL accessed with Drizzle ORM.
- **Files:** SeaweedFS object storage through its S3-compatible API, configured through provider-neutral API environment variables.
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
- Authenticated server-to-browser updates use a generic Server-Sent Events stream at `/realtime/events`, proxied through the web app so the existing HTTP-only session cookie stays private. `RealtimeEventsService` carries named event envelopes with user or permission targeting. Current publishers cover notifications, DTM activity, orders, programs, claims, tracking, catalog data, customers, users, role profiles, integration credentials, and profile preferences. API instances share events through PostgreSQL `LISTEN/NOTIFY`, using the existing database and no additional broker. Clients invalidate active query data and refresh affected server-rendered lists; notification and pending DTM events can also show in-app toasts. If SSE disconnects, clients poll selected operational views as a fallback and refresh canonical data on reconnect. Role/profile changes reopen the stream so the API applies current session permissions. Events are transient (not a durable queue or history); keep payloads small, and add a dedicated broker/queue behind the same service boundary if durable replay or very high event volume becomes a requirement.
- Attachments use the storage service and configured object-storage backend.
- Password reset uses SMTP when `SMTP_HOST` and `SMTP_FROM` are configured. Without complete provider settings, development messages are saved as `.eml` files in the local mailbox path.
- Order and forecast-program workflows use the stable `DTM_GATEWAY` token exported by `DtmModule`. The module selects a local simulator when `DTM_MODE=simulator`; otherwise it selects a no-op adapter. The simulator records a mock request and never contacts ONCF. Its response behavior is configured with `DTM_SIMULATOR_RESPONSE_MODE`: `manual` leaves requests pending for admin review (the default), while `auto` applies a delayed acknowledgement using the configured delay and result. Users with `INTEGRATIONS_MANAGE` can review the latest 100 requests at `/dashboard/integrations/dtm` and manually resolve pending simulator requests. Manual decisions and the acting admin are recorded in the response payload, and the database update prevents a scheduled response from replacing a manual decision. Replacing the simulator with a real transport should only require a new adapter and provider selection in this module. Neither simulator nor no-op mode proves a remote ONCF system accepted a request.

- In-app notifications are stored as delivered immediately. Workflow services prepare notification records and persist them in the same database transaction as the associated state, history, or comment change. A notification write failure rolls back that workflow action. The inbox and unread badge use the authenticated recipient; external delivery and retry queues are not implemented.
