# MVP readiness

This status describes the current repository against the project SDF and report. It distinguishes implemented local behavior from placeholders and external integrations that still need confirmation.

## Implemented

- Bun/Turborepo monorepo with a NestJS API, Next.js web app, shared TypeScript package, PostgreSQL/Drizzle, and MinIO-compatible file storage.
- Local PostgreSQL/MinIO Compose setup, environment templates, API Swagger docs, Drizzle schema push/studio scripts, and reference/demo seed scripts.
- Authentication, JWT-backed sessions, logout, password change, session revocation, account lock checks, and role/permission/ownership enforcement.
- User and customer CRUD APIs and screens. Customer records store the customer code and ICE used by client signup.
- Public client signup checks the submitted customer code and ICE against an active local customer record, creates an inactive client-representative account in `PENDING` status, and blocks sign-in until an administrator approves it. Administrators can approve or reject pending requests from the user detail screen.
- The development seed includes a synthetic customer record for exercising the signup and review flow locally; its ICE value is explicitly test-only.
- Password recovery/reset UI and API. SMTP delivery is available when configured; local development uses git-ignored `.eml` messages otherwise.
- Permission-aware dashboard with recent orders, forecast programs, and claims for sections the signed-in user can read. Create order and Create claim shortcuts beside the greeting appear only when the user's effective permissions allow them. Eligible orders are surfaced as direct program-creation actions only for users who can read orders and create programs.
- Personal settings for five themes, three font choices, three text sizes, and reduced motion, with preferences synced per user through `user_preferences` and a browser-local fallback. Profile updates and password changes are included. The interface uses an ONCF-inspired orange and warm-neutral palette; no official full hex palette was located.
- Guided multi-step flows for longer create forms and selected edit forms, with step validation, first-invalid-field focus, back navigation, preserved values, subtle motion, and reduced-motion support.
- Claim details and forecast program details can be edited from their existing edit routes. Workflow status remains controlled through transition actions.
- Orders, forecast programs, and claims now use their persisted random document codes in web detail/edit links and API detail/workflow routes. Order attachment and tracking routes use the order number too. Database IDs remain in internal relations; ownership and permission guards still check access after resolving each code.
- Order create/list/detail/edit, status workflow, access rules/history, attachment endpoints, and web UI.
- Eligible orders can be sent directly from the dashboard or order details into program creation. The selector excludes orders with an existing program, and the API rejects duplicate program creation.
- Forecast program create/list/detail and lifecycle transitions, plus its API update endpoint.
- Claim create/list/detail, lifecycle transitions, comments, and first-agent-response transition to in-progress.
- In-app notification inbox, unread badge, and read actions. Workflow transitions and claim replies notify the record owner when another user acts; self-actions are quiet.
- Order reports summarize accessible orders by status, customer, product, and month, with optional date bounds. The web report offers browser print/save-to-PDF without a paid service or schema change.
- Claim comments include the author’s display name in list and creation responses.
- Tracking API structures exist; the SDF treats full tracking as a separate lot.

## Local preview verification — 2026-09-27

- The signup/review flow was exercised through the running Next API proxy: an invalid customer code was rejected, valid requests remained pending until reviewed, the user detail page returned the administrator actions, approved accounts could sign in, and rejected accounts could not. Disposable applicants were deactivated after the check.
- The order-to-program flow was exercised through the same proxy: eligible before creation, removed from the eligible selector after creation, duplicate creation rejected with 409, and restored after the temporary draft was removed.
- The latest source passed the full pre-commit gate: 53 API suites / 390 tests, web checks (including dashboard action visibility for all default roles), all typechecks, and production builds. This does not replace the still-pending browser screenshot pass for the updated dashboard and auth screens.

## Incomplete for a usable MVP

- **Admin role/access management (P0):** the SDF capability has reserved permissions, but there is no management API or screen. The current role enum and seeded roles are fixed. Confirm whether the pilot should edit grants for those existing roles or create custom roles; then implement guarded management, prevent privilege escalation and administrator lockout, audit changes, and test the API/UI matrix.
- **ICE data ownership:** signup compares the submitted customer code and ICE with the locally maintained customer record; it does not query an external ONCF registry. Confirm who maintains customer ICE values and how they are kept current before production use.
- **OpenAPI generation runtime:** the Bun development API returns empty properties for DTO schemas, but the production-style API started with real Node returns typed schemas. Current Node verification found 41 properties on `OrderDetailDto` and no generic `Object` references. Generate the client from the Node runtime documented in the [development workflow](../development/workflow.md#local-setup), then review the generated diff before accepting it. This is a developer workflow constraint, not a blocked user flow.

## External and production requirements

- **Notification reliability:** current workflow notifications are best effort after the state change is saved. Delivery failures are logged; there is no durable retry queue yet. Staff assignment alerts and external email/SMS/push delivery are not implemented.

- **DTM/GSCWF:** “Send to DTM” currently records local status. A real handoff needs ONCF endpoint details, authentication, payload contract, and retry/error expectations.
- **Email provider:** SMTP configuration exists, but a real provider must be configured and exercised before relying on delivery.
- **Production operations:** configure production secrets, HTTPS, database/object-storage backup and restore, and monitoring before exposing the app to users.
- **Database design and migrations:** the current model needs review and is expected to change. Migrations are intentionally deferred so the unstable design is not cemented as history. Agree on the domain entities, ownership/lifecycle rules, constraints, and reference data before stabilizing the schema and selecting migrations. Until then, use `db:push` only with disposable local data.

## Recommended order

1. **Admin role/access management (P0).** First settle the boundary: manage grants for the three existing roles or create custom roles. The schema already has roles, permissions, and role-permission relations, but the shared `Role` enum and seeded defaults currently define the supported role set. Do not expose permission mutation until the allowed role set, protected admin grants, self-lockout prevention, and audit expectations are agreed. Then add guarded API/UI, deny privilege escalation, and cover the complete permission matrix.
2. **Automated user journeys (P1).** CI already runs workspace verification and isolated API E2E. Check its first hosted result, then add browser-level journeys for client order submission, agent approval/program and claim handling, and admin registration review. Keep test data isolated and assert both visible actions and API denials by role.
3. **Internationalization foundation (P1).** Agree on initial locales and translation ownership. Inventory and centralize UI copy, validation/API errors, status and enum labels, dates, numbers, plurals, and public/auth pages; keep persisted values and public codes language-neutral. Migrate by route family with English fallback and add locale/formatting tests before translating every screen.
4. **Workflow reliability (P1).** Test transition validation and notification failure paths. Design durable retries and assignment alerts only after ownership and assignment rules are confirmed; current notification delivery is best effort.
5. **Customer identity and signup (P1).** Name the owner and update process for ICE values. Until ONCF supplies an authoritative registry, keep signup's local customer-code/ICE match explicit and verify refresh/revocation expectations with the pilot.
6. **Data and deployment readiness (P1).** Agree on entity ownership, lifecycle, constraints, and reference data; only then stabilize the schema and select migrations. Define production secrets, HTTPS, backup/restore for PostgreSQL and object storage, and monitoring.
7. **Pilot product closeout (P2).** Confirm report metrics/export expectations, complete page metadata/favicon review, and capture the full route/role/theme/responsive screenshot matrix after shared UI changes.
8. **External integrations (contract-dependent).** Confirm DTM/GSCWF endpoints, authentication, payloads, and retry/error expectations. The current local status is not an external handoff. Configure and exercise a real SMTP provider before relying on email delivery.

The immediate next chapter is role/access management discovery and a scoped implementation proposal. While the role policy remains open, continue the independent i18n string inventory and verify the CI workflow when a hosted run is available; do not add a custom-role schema or make the seeded administrator's grants mutable by assumption.

The older Java/Spring architecture in the report is not the current implementation. Continue with ECommand's existing TypeScript stack unless a deliberate rewrite is approved.
