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
- Permission-aware dashboard with recent orders, forecast programs, and claims for sections the signed-in user can read. Create order and Create claim shortcuts beside the greeting appear only when the user's effective permissions allow them. Eligible orders are surfaced as direct program-creation actions only for users who can read orders and create programs. Admin also gets account-state totals, report-backed order activity/status/customer/product charts, and permission-appropriate management links. Report insights use the API's existing per-user/customer scope; Admin gains no operational-list permissions.
- Personal settings for five themes, six font choices, three text sizes, and reduced motion, with compact previews for themes, layouts, fonts, text sizes, and motion. Preferences sync per user through `user_preferences` with a browser-local fallback. Profile updates and password changes are included. The interface uses an ONCF-inspired orange and warm-neutral palette; no official full hex palette was located.
- Guided multi-step flows for longer create forms and selected edit forms, with step validation, first-invalid-field focus, back navigation, preserved values, subtle motion, and reduced-motion support.
- Admin reference-data management for units, goods types, goods, accessory operations, and rejection reasons, including add/edit/archive/restore rules; custom permission profiles are assignable by `roleId`, built-in roles are protected, and at least one active Admin account must remain.
- Claim details and forecast program details can be edited from their existing edit routes. Workflow status remains controlled through transition actions.
- Orders, forecast programs, and claims now use their persisted random document codes in web detail/edit links and API detail/workflow routes. Order attachment and tracking routes use the order number too. Database IDs remain in internal relations; ownership and permission guards still check access after resolving each code.
- Order create/list/detail/edit, status workflow, access rules/history, attachment endpoints, and web UI.
- Eligible orders can be sent directly from the dashboard or order details into program creation. The selector excludes orders with an existing program, and the API rejects duplicate program creation.
- Forecast program create/list/detail and lifecycle transitions, plus its API update endpoint.
- Claim create/list/detail, lifecycle transitions, comments, and first-agent-response transition to in-progress.
- In-app notification inbox, unread badge, and read actions. Workflow status changes and claim comments write their in-app notification rows in the same database transaction as the state/history/comment changes; self-actions are quiet. Claim-comment recipients are the claim creator and active users with `claims:read` assigned to that customer's portfolio.
- HTTP exception responses now use stable API error codes, status codes, and optional structured field details; the web maps API failures to English catalog entries rather than displaying backend English strings.
- Workflow-generated system notifications use stable message codes and parameters; the API omits the legacy English title/body columns, and the web resolves titles, bodies, and workflow statuses from the English catalog. The OpenAPI client has been regenerated from this contract.
- Order reports summarize accessible orders by status, customer, product, and month, with optional date bounds. The web report offers permission-gated CSV download and browser print/save-to-PDF without a paid service or schema change. CSV text is escaped and formula-like cells are neutralized for spreadsheet safety.
- Claim comments include the author’s display name in list and creation responses.
- Tracking API structures exist; the SDF treats full tracking as a separate lot.

## Local preview verification — 2026-09-27

- The signup/review flow was exercised through the running Next API proxy: an invalid customer code was rejected, valid requests remained pending until reviewed, the user detail page returned the administrator actions, approved accounts could sign in, and rejected accounts could not. Disposable applicants were deactivated after the check.
- The order-to-program flow was exercised through the same proxy: eligible before creation, removed from the eligible selector after creation, duplicate creation rejected with 409, and restored after the temporary draft was removed.
- The latest source passed the full pre-commit gate: 53 API suites / 390 tests, web checks (including dashboard action visibility for all default roles), all typechecks, and production builds. This does not replace the still-pending browser screenshot pass for the updated dashboard and auth screens.

## Current verification — 2026-10-02

- `bun run verify` passed after the Admin dashboard and query-test updates: Biome checked 607 files, all workspace typechecks passed, 72 API unit suites / 600 tests passed, web contract and behavior checks passed, and all workspace builds completed.
- The current API Jest coverage run reports 75.93% statements, 72.84% branches, 57.66% functions, and 76.06% lines. Focused `ClaimsQuery` coverage is 100% for statements, lines, and functions, and 92.59% for branches. Other query and framework-wiring paths remain less exercised; this does not establish full endpoint/workflow coverage.
- The isolated API E2E suite passed 2 suites / 27 tests, and all eight browser workflows passed through a dedicated Chrome CDP session. These cover Admin access and registration review, custom profile assignment, reference-data lifecycle, agent claim/program work, client order submission, and client authorization denial. The disposable E2E database was removed after the run.
- The host's Playwright-managed Chromium could not start because `libnspr4.so` is missing. The browser workflows passed through the documented `PLAYWRIGHT_CDP_ENDPOINT` path using the available system Chromium; no system packages were installed.
- The access-profile screen was captured and inspected at all ten documented widths from 320px to 3840px. It had no horizontal overflow; desktop uses the shared table component and smaller containers use the responsive card list. No change was warranted by this pass. The full route/state/theme/role visual matrix remains incomplete.

## Incomplete for a usable MVP

- **ICE data ownership:** signup compares the submitted customer code and ICE with the locally maintained customer record; it does not query an external ONCF registry. Confirm who maintains customer ICE values and how they are kept current before production use.
- **Report PDF quality:** browser print hides app navigation and breadcrumbs and applies a light, A4 print theme with consistent margins. A browser regression test uses 36 customer rows, 36 product rows, and 12 months, checks long-label wrapping and hidden controls, and verifies the generated A4 PDF has multiple pages. Fresh report captures at 320, 375, 390, 640, 768, 1024, 1440, 1920, 2560, and 3840px show no horizontal overflow. Captures: `/tmp/ecommand-report-layout-final`. A backend-generated PDF is only warranted if exact cross-browser output or archived documents become a requirement.
- **OpenAPI generation runtime:** the Bun development API can return incomplete DTO schemas. The web generation command now preflights representative schemas and leaves generated files unchanged on failure. Use the real Node runtime documented in the [development workflow](../development/workflow.md#local-setup), then review the generated diff and typecheck.

## External and production requirements

- **Notification reliability:** in-app workflow notifications are stored atomically with the associated status/history/comment updates. A database failure rolls back the related workflow action rather than silently losing its notification. Staff assignment alerts and external email/SMS/push delivery are not implemented; no external-delivery retry queue is needed until such a channel has a defined provider and delivery contract.

- **DTM/GSCWF:** “Send to DTM” currently records local status. A real handoff needs ONCF endpoint details, authentication, payload contract, and retry/error expectations.
- **Email provider:** SMTP configuration exists, but a real provider must be configured and exercised before relying on delivery.
- **Production operations:** configure production secrets, HTTPS, database/object-storage backup and restore, and monitoring before exposing the app to users.
- **Database design and migrations:** the current model needs review and is expected to change. Migrations are intentionally deferred so the unstable design is not cemented as history. Agree on the domain entities, ownership/lifecycle rules, constraints, and reference data before stabilizing the schema and selecting migrations. Until then, use `db:push` only with disposable local data.

## Recommended order

1. **Final product UI review (P1).** Capture every route and meaningful state by persona, theme, and phone-to-ultrawide viewport; inspect the images and fix only evidenced layout, control, copy, or workflow inconsistencies. The latest focused review covered settings, dashboard, header, and access profiles, not the full route matrix.
2. **Automated user journeys (P1).** CI runs workspace verification and isolated API E2E. The API suite passed 27 tests on 2026-10-02. Browser workflows cover Admin access/profile management, reference-data lifecycle, client order submission, agent claim and eligible-order program creation, Admin registration review, and API/UI authorization boundaries. Extend tests for failure paths identified in the final review.
3. **Workflow reliability (P1).** In-app workflow notification writes and user/customer-portfolio assignment changes are transactional; their failure paths are covered. Continue checking transition and authorization edge cases found in role workflow review. Durable external-delivery retries and assignment alerts need a defined product contract.
4. **Customer identity and signup (P1).** Name the owner and update process for ICE values. Until an authoritative registry is available, keep signup's local customer-code/ICE match explicit.
5. **English catalog maintenance (P2).** English UI copy, stable `Messages.*` references, API error/response codes, validation rules, notification codes, metadata, and fixed status labels are centralized. English is the only enabled locale. French runtime support, reviewed translations, preference storage, and localized email delivery remain deferred.
6. **Product closeout (P2).** Review route titles, dashboard metrics with representative role-scoped data, and report export/print after any related layout changes. The generic favicon uses ONCF artwork; long report print layout has browser regression coverage.
7. **External integrations (contract-dependent).** DTM/GSCWF handoff and a real SMTP provider need ONCF/provider contracts. The current local DTM status is not an external handoff, and SMTP must be configured before relying on email delivery.

The isolated API suite (27 tests) and all eight browser workflow checks passed on 2026-10-02; the current API unit suite has 72 suites / 600 tests, and the latest workspace verification and API typecheck passed. The runner confirmed that it tears down the disposable E2E containers. French remains deferred until the higher-priority product review is complete. Remaining product review is the full route/state/role visual pass, route-title consistency, representative dashboard-data review for every persona, and clarification of who maintains customer ICE values. Continue strengthening query and framework-wiring coverage alongside concrete workflow gaps. External notification delivery requires an agreed provider and contract if needed. Custom permission profiles remain anchored to the Commercial Agent or Client Representative persona; the three seeded personas and their default grants are protected. Appearance previews and synced selection behavior were verified in the browser.

The older Java/Spring architecture in the report is not the current implementation. Continue with ECommand's existing TypeScript stack unless a deliberate rewrite is approved.
