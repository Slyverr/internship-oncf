# MVP readiness

This status describes the current repository against the project SDF and report. It distinguishes implemented local behavior from placeholders and external integrations that still need confirmation.

## Implemented

- Bun/Turborepo monorepo with a NestJS API, Next.js web app, shared TypeScript package, PostgreSQL/Drizzle, and MinIO-compatible file storage.
- Local PostgreSQL/MinIO Compose setup, environment templates, API Swagger docs, Drizzle schema push/studio scripts, and reference/demo seed scripts.
- Authentication, JWT-backed sessions, logout, password change, session revocation, account lock checks, and role/permission/ownership enforcement.
- User and customer CRUD APIs and screens.
- Password recovery/reset UI and API. SMTP delivery is available when configured; local development uses git-ignored `.eml` messages otherwise.
- Permission-aware dashboard with recent orders, forecast programs, and claims for sections the signed-in user can read.
- Claim details and forecast program details can be edited from their existing edit routes. Workflow status remains controlled through transition actions.
- Order create/list/detail/edit, status workflow, access rules/history, attachment endpoints, and web UI.
- Forecast program create/list/detail and lifecycle transitions, plus its API update endpoint.
- Claim create/list/detail, lifecycle transitions, comments, and first-agent-response transition to in-progress.
- Tracking API structures exist; the SDF treats full tracking as a separate lot.

## Incomplete for a usable MVP

- **Client signup:** the SDF requires customer code plus ICE validation. The current customer schema has no ICE field, and the source/ownership of ICE has not been decided. Keep signup blocked until that data source is confirmed.
- **Notifications:** list/read/unread-count APIs exist, but workflow transitions do not create notifications and the web app has no inbox/badge. The mapper currently creates notifications as `PENDING`, while unread counts include only `SENT` rows.
- **Reporting:** no reporting API or web screen is implemented.
- **API client generation:** the live OpenAPI document currently emits empty property schemas for many response DTOs. A successful Orval run can replace useful web types with generic `unknown` objects; fix DTO metadata before accepting regenerated output.

## External and production requirements

- **DTM/GSCWF:** “Send to DTM” currently records local status. A real handoff needs ONCF endpoint details, authentication, payload contract, and retry/error expectations.
- **Email provider:** SMTP configuration exists, but a real provider must be configured and exercised before relying on delivery.
- **Production operations:** configure production secrets, HTTPS, database/object-storage backup and restore, and monitoring before exposing the app to users.
- **Database design and migrations:** the current model needs review and is expected to change. Migrations are intentionally deferred so the unstable design is not cemented as history. Agree on the domain entities, ownership/lifecycle rules, constraints, and reference data before stabilizing the schema and selecting migrations. Until then, use `db:push` only with disposable local data.

## Recommended order

1. Confirm the ICE source and ownership, then implement signup validation against that source.
2. Complete program and claim editing screens and replace the dashboard placeholder with useful work queues.
3. Wire in-app notifications to order/program/claim workflows, fix the `PENDING` versus `SENT` behavior, and add a minimal inbox/unread indicator.
4. Include author names in the comments response and render them in the claim thread.
5. Implement basic reports required for the pilot.
6. Confirm whether DTM handoff is available for the pilot; otherwise expose its local/manual status honestly.
7. Stabilize the schema, then define migrations and production operations.

The older Java/Spring architecture in the report is not the current implementation. Continue with ECommand's existing TypeScript stack unless a deliberate rewrite is approved.
