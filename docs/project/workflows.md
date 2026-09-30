# Workflow verification

## Live check — 2026-09-28

Checked the running local web/API stack against the project SDF using the seeded admin, client representative, and commercial-agent accounts. API workflows were exercised directly; browser screenshots were used to check the dashboard at representative phone and desktop sizes.

### Results

- All three supplied accounts signed in and returned the expected role in their profile.
- Client order ownership worked: the client could read its assigned customer's order and received `403` for another customer's order. Client access to user administration and program creation was denied.
- The client created a draft order, edited it, and submitted it. The agent approved it and created a program; program submission, admin approval/confirmation, and agent `Send to DTM` status transition all succeeded.
- Before the permission update, the agent could not create a claim and the client could not close its own resolved claim. Both conflicted with the SDF. The default grants now give agents `claims:create` and clients only `claims:action:close` (not the broader claim-action parent permission). The client can still close only its own resolved claims through the existing ownership guard.
- After seeding the updated reference permissions, live API checks passed: agent claim creation returned `201`; a client-owned claim completed agent reply → treatment → resolution → client close, ending in `CLOSED`.
- The agent's fresh browser session showed the new Create claim action on the dashboard.
- A QA signup remained pending and could not sign in until the administrator approved it; sign-in then succeeded.
- Reports, notifications, customer/catalog reads, and denied user-management actions returned expected responses for the checked accounts.

### SDF authorization update — 2026-09-29

- The default administrator role now matches the SDF boundary: user account administration, role/access grants, reports, and profile only. Orders, programs, claims, customers, catalog, and tracking are denied.
- Admin report queries can see the full report without granting operational order permissions. The API and web role matrices assert this boundary.
- Reference seeding removes stale extra grants from the default administrator role. The existing local database has not been reseeded as part of this isolated verification; its stored grants may still reflect the previous policy until `seed:ref` is run against the intended disposable development database.

### Isolated preview and browser review — 2026-09-29

- The previously approved `ecommand_preview` database did not exist, so it was created, synchronized with the current Drizzle schema, and seeded with reference data and demo accounts. The ignored `apps/api/.env` now points to this preview DB; the pre-existing `ecommand` database was left untouched.
- Browser sign-in and dashboard navigation were checked for `admin@oncf.ma`, `client@oncf.ma`, and `agent@oncf.ma`. Admin sees Home, Reports, and Users; client and agent see their role-appropriate operational sections. The admin dashboard links to Reports and Users instead of showing a dead-end no-access card.
- Fresh route-matched screenshots for the dashboard and recent-list layout reported no horizontal overflow at 390, 768, 1440, and 3840px. The recent rows use a 16px gap with no divider. Screenshots are temporary files under `/tmp/ecommand-ui-review`.
- At initial seeding this preview had no order/program/claim transactions. Chapter 5 below records the current preview-only workflow data; the old QA row inventory below describes an earlier local database and is not present here.

### Browser workflow checks — 2026-09-29

- Current preview data: `ORD-H5VQA5EEQX` and `ORD-3F6L4N654Z` are approved; `ORD-3F6L4N654Z` has program `PRG-ZXTKRDYWBG`, currently at the local `SENT_TO_DTM` status. The client submitted the second order in the UI; its assigned agent approved it in the UI and created the program from the order detail action. The program wizard preserved the selected order, planned date, and quantity when Continue advanced to Execution. No external DTM request was made.
- The Recent orders card was reviewed with two live records at 390px and 1440px. Rows have a 16px gap and no divider. Programs and claims use the same `RecentSection` component.
- Registration was submitted against the local-only `LOCAL-REG-TEST` customer. Pending login returned 401. One QA account was approved through the API and then signed in successfully; a second was approved through the rendered **Approve access** action and its detail changed to Approved. `workflow.pending.demo@example.test` remains pending for the dashboard demonstration.
- The dashboard request link opened the Users page with `registrationStatus=PENDING` and `role=CLIENT_REPRESENTATIVE`; only the pending QA account appeared. At 390px the table showed its scroll hint and did not cause page-level overflow.
- Screenshots are temporary under `/tmp/ecommand-ui-review`: `resumed-client-dashboard-two-orders-*`, `admin-registration-filter-*`, `admin-pending-user-detail-1440x900.png`, `agent-program-create-from-order-1440x900.png`, and `agent-program-create-cdp.png`.
- No claim conversation or program submission/approval was exercised in this browser chapter; their API lifecycle coverage remains in the isolated E2E suite. The original `ecommand` database was not modified.

### Automated checks

- Historical live check: API unit tests had 54 suites and 405 tests at the time.
- Web checks: 9 checks passed, including default-role action visibility.
- Workspace typecheck passed for shared, API, and web packages.
- Responsive dashboard screenshots were captured at the documented ten viewport sizes (320px through 3840px). The browser helper reported no horizontal overflow. The 320px and 1440px agent captures showed the new Create claim action; the 1440px recent-activity cards showed separated rows with no divider. The first agent login capture had to be isolated because successful login redirects from `/login` to `/dashboard`.
- The isolated API E2E runner starts a disposable PostgreSQL database, applies the schema, seeds reference and deterministic E2E data, runs Jest with Node, and removes the Compose project afterward. On 2026-09-29, all 2 suites and 21 tests passed, covering customer/order/claim/program/report scope, order and claim workflows, program eligibility and lifecycle, administrator route denials, and administrator assignment/removal of agent customer portfolios.
- On 2026-09-29, fresh headless Chrome captures successfully matched requested routes. Dashboard and create forms were reviewed at phone, tablet, laptop, 2K, and 4K widths; the helper reported no horizontal overflow. Review images are under `/tmp/ecommand-ui-review` and are temporary, not repository assets.
- Current repository verification passed on 2026-09-29: Biome, all workspace typechecks, web checks, 58 API suites / 440 tests, and production builds.

### Program history — 2026-09-29

- Program creation, edits, execution records, lifecycle transitions, and draft deletion now write matching audit events atomically with the program change. Focused tests cover initial state, quantity/date/status/execution events, and conditional update races.
- Program details show recorded events with actor and timestamp. Existing programs are not retroactively backfilled; their timeline fills as subsequent changes occur.
- `bun run verify:commit` now delegates to the full repository verification command. It passed on 2026-09-29 with Biome, workspace typechecks, web checks, 58 API suites / 443 tests, and production builds.
- Turbo build tasks now declare `dist/**` as an output alongside Next.js build files, ensuring shared and API compiled artifacts are restored on cache hits. A stale shared artifact caused the API watcher to fail at runtime; rebuilding it and restarting the development stack restored API `/health` to HTTP 200.
- The screenshot helper was attempted for the program detail route but could not connect to Chrome DevTools at `localhost:9235`; the local web and API health endpoints were still HTTP 200.

### Historical QA records from the earlier local check

The earlier live workflow check recorded these QA records:

- Order `3` (`ORD-A8AV3T6VKN`), submitted and agent-approved.
- Program `7` (`PRG-X8FVKFWS25`), sent to the local DTM status; no external DTM request was made.
- Claims `2`, `3`, and `4`, all QA-labeled. Claim `2` was resolved and closed during the first check; claim `4` was closed by its client owner after the permission update; claim `3` records agent claim creation.
- User `13` (`qa.workflow.20260928@example.test`), approved and active.

The order/program/claim are preserved so their resulting workflow state can be inspected. The test user should be deactivated or removed before reusing this preview database for a clean demonstration.

## Prioritized continuation

### P0 — Enforce operational access scope

1. Agent portfolio scope and core order, claim, and program journeys are covered by 21 isolated API E2E tests. Continue with remaining role journeys and failure-path coverage.
2. Completed: administrator grants now match the SDF; tests verify permitted account/report access and denied operational routes. Role/permission management screens and endpoints remain unimplemented even though their permissions are reserved in the matrix.

### P1 — Complete workflow identifiers and useful dashboard insights

1. Completed: claims now display and search stable `CLM-` identifiers in list/detail/dashboard and related views while numeric IDs remain internal route keys.
2. Add role-aware dashboard insights so the home page answers what needs attention and what changed, with meaningful metrics/charts, useful empty states, and links to the next action. Reuse existing scoped report/workflow data where appropriate; do not duplicate or leak cross-customer data.
3. Completed: sign-in accepts either email or employee/matricule identifier. Email and employee-code matching are case-insensitive, and the schema enforces case-insensitive employee-code uniqueness. Apply the evolving schema with `bun run db:push` only against a disposable development database, per repository policy.

### P1 — Complete integration and test readiness

1. The API E2E runner invokes Jest with a discovered/configured Node runtime; the isolated suite passed 20 tests on 2026-09-29. Core order, claim, and program journeys are covered. Add browser journeys and remaining failure-path cases. See the [agent progress journal](../agent-progress.md) for milestone status and priority.
2. Treat DTM/GSCWF handoff, durable notification retry, and external email activation as integrations that need ONCF/provider contracts. The current local `Send to DTM` action is only a status change; do not report it as an external handoff.

### P2 — Branding, internationalization, and pilot operations

1. Review the app's centered brand wording and page metadata. Replace any remaining generic Vercel favicon with approved ONCF/ECommand artwork, and make browser titles consistent across every route.
2. Plan i18n before translating piecemeal: select initial locales with the product owner, centralize all UI copy, validation/API error labels, status and enum labels, date/number/plural formatting, and public/auth pages, then migrate every route and shared component. Keep business identifiers and stored enum values language-neutral.
3. Confirm who maintains customer ICE values and how signup verifies them against an authoritative source.
4. Run and inspect the complete route screenshot pass across desktop and phone sizes after shared layout or branding changes; the dashboard-specific pass does not cover every page.

### Dashboard polish completed

- Recent order, program, and claim records share a 16px grid gap without a full-width divider. Fresh dashboard screenshots confirm the current card layout at representative widths.
- The redundant “Showing the latest two records…” note was removed.
- Recent-row secondary text now uses the shared metadata type size, matching the date; the welcome description refers to the workspace rather than repeating the product name.

## Continuation notes

- Read this file with `docs/security/authorization.md` and `docs/project/readiness.md` before continuing the role audit.
- The default role matrix is in `packages/shared/src/auth/roles.ts`; reference seeding reconciles administrator grants and inserts the client/agent grants. Keep the authorization guide and API/web role tests aligned with those grants.
- Agent-to-customer assignment uses the existing `user_customers` many-to-many relation. `users.customer_id` remains the single-customer assignment for client representatives; commercial agents use `user_customers` for their customer portfolio.
- The isolated API E2E runner explicitly uses Node for Jest to avoid Bun-specific dependency incompatibility. Keep E2E data isolated in the disposable Compose database; unit tests do not replace endpoint integration coverage.
