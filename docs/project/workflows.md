# Workflow verification

> **Historical record:** the 2026-09-28 checks below were interpreted against the SFD then in use. Safa’s internship report is now the current requirements baseline. Current policy allows agents to close resolved claims; clients can read and comment on their own claims but cannot close them. See the current [authorization matrix](../security/authorization.md) and [MVP readiness](readiness.md).

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
- The isolated API E2E runner starts a disposable PostgreSQL database, applies the schema, seeds reference and deterministic E2E data, runs Jest with Node, and removes the Compose project afterward. On 2026-10-01, all 2 suites and 24 tests passed, covering customer/order/claim/program/report scope, order and claim workflows, program eligibility and lifecycle, custom permission-profile creation/assignment and enforcement, administrator route denials, portfolio management, and concurrent last-Admin deactivation protection.
- On 2026-09-29, fresh headless Chrome captures successfully matched requested routes. Dashboard and create forms were reviewed at phone, tablet, laptop, 2K, and 4K widths; the helper reported no horizontal overflow. Review images are under `/tmp/ecommand-ui-review` and are temporary, not repository assets.
- Current repository verification passed on 2026-09-29: Biome, all workspace typechecks, web checks, 58 API suites / 440 tests, and production builds.

### Program history — 2026-09-30

- Program creation, edits, execution records, lifecycle transitions, and draft deletion now write matching audit events atomically with the program change. Focused tests cover initial state, quantity/date/status/execution events, and conditional update races.
- The isolated API E2E lifecycle verifies the returned persisted `CREATED` event and all three status-change events, including actor identity; 2 suites / 21 tests passed using real Node.
- Program details show recorded events with actor and timestamp. Existing programs are not retroactively backfilled; their timeline fills as subsequent changes occur.
- `bun run verify:commit` now delegates to the full repository verification command. It passed on 2026-09-30 with Biome, workspace typechecks, web checks, 58 API suites / 443 tests, and production builds.
- Turbo build tasks now declare `dist/**` as an output alongside Next.js build files, ensuring shared and API compiled artifacts are restored on cache hits. A stale shared artifact caused the API watcher to fail at runtime; rebuilding it and restarting the development stack restored API `/health` to HTTP 200.
- The screenshot helper was attempted for the program detail route but could not connect to Chrome DevTools at `localhost:9235`; the local web and API health endpoints were still HTTP 200.

### Claim conversation browser check — 2026-09-30

- Using the supplied client and agent test accounts, the client created a QA claim and sent a message. The agent read it and replied; the first response moved the claim into progress. The agent started treatment and resolved it through the UI. The client then closed the resolved claim.
- The final client view showed `CLOSED`, the resolution summary, the closing representative, and four status-history entries. This confirms the browser conversation and client-close steps that the earlier 2026-09-29 journal listed as pending.
- Current captures are temporary under `/tmp/ecommand-ui-review-current`; final state: `client-claim-close-1440x900.png`. No screenshots were added to the repository.
- Claim display codes are currently derived from numeric IDs (`CLM-0000000002` was visible during this QA run). The public-ID checklist now requires random persisted codes and code-based detail/workflow URLs while retaining existing ownership and permission checks.
- The new GitHub Actions workflow runs `bun run verify` and isolated API E2E on pushes and pull requests. The YAML parsed locally; a hosted GitHub Actions result remains unverified until the branch is pushed.

### Historical QA records from the earlier local check

The earlier live workflow check recorded these QA records:

- Order `3` (`ORD-A8AV3T6VKN`), submitted and agent-approved.
- Program `7` (`PRG-X8FVKFWS25`), sent to the local DTM status; no external DTM request was made.
- Claims `2`, `3`, and `4`, all QA-labeled. Claim `2` was resolved and closed during the first check; claim `4` was closed by its client owner after the permission update; claim `3` records agent claim creation.
- User `13` (`qa.workflow.20260928@example.test`), approved and active.

The order/program/claim are preserved so their resulting workflow state can be inspected. The test user should be deactivated or removed before reusing this preview database for a clean demonstration.

### Client registration review — 2026-10-03

- Exercised `/signup` in the running browser with the documented synthetic `LOCAL-REG-TEST` customer. A valid registration returned `201 REGISTRATION_SUBMITTED_FOR_REVIEW` and created an inactive `PENDING` Client Representative; sign-in returned `401` before review.
- Admin approved one request through the user detail screen. The API returned `200 APPROVED`, set the account active, and sign-in then returned `201` with a session token. Admin rejected a second request through the same screen; it remained inactive with `REJECTED` status and sign-in returned `401`.
- Invalid ICE and unknown customer-code submissions each returned `400 CUSTOMER_IDENTITY_INVALID`. The valid flow uses local preview data only; it does not verify identity against an external ONCF registry or send email.
- Both disposable QA accounts were deactivated through the Admin API after verification. They remain as inactive audit rows in the preview database. The browser was restored to the Admin dashboard.
- Captures: `/tmp/ecommand-registration-review/registration-result-390x844.png`, `admin-approved-1440x900.png`, and `admin-rejected-1440x900.png`.

## Prioritized continuation

### P0 — Enforce operational access scope

1. Agent portfolio scope and core order, claim, and program journeys are covered by the isolated API E2E suite (27 tests passed on 2026-10-02). Continue adding failure-path cases when workflow review identifies a concrete gap.
2. Admin reference-data management and custom permission profiles have guarded APIs and screens. Fixed base personas are protected, custom permission sets are assigned to the Commercial Agent or Client Representative persona, and tests cover privilege lockout and effective permission boundaries.

### P1 — Complete workflow identifiers and useful dashboard insights

1. Completed: claims now display and search stable `CLM-` identifiers in list/detail/dashboard and related views while numeric IDs remain internal route keys.
2. Role-aware dashboard metrics, activity chart, registration review, eligible-order actions, and operational links are implemented. Continue checking that each persona sees useful actions and customer-scoped values with representative data; do not duplicate or leak cross-customer data.
3. Completed: sign-in accepts either email or employee/matricule identifier. Email and employee-code matching are case-insensitive, and the schema enforces case-insensitive employee-code uniqueness. Apply the evolving schema with `bun run db:push` only against a disposable development database, per repository policy.

### P1 — Complete integration and test readiness

1. The API E2E runner invokes Jest and the isolated Next browser-test server with a discovered/configured real Node runtime; on 2026-10-03 both API suites passed 28 tests and all 13 browser journeys passed through a dedicated Chrome CDP session: role access, reference-data lifecycle, client order submission, agent claim and eligible-order program creation, and Admin registration review, report export, and API/UI authorization boundaries. The registration journey follows Dashboard → View all and verifies the pending and client-representative filters. On this host, Playwright's bundled Chromium cannot launch because `libnspr4.so` is missing; use the documented CDP route. Extend failure-path cases when workflow review finds a concrete uncovered behavior. See the [agent progress journal](../agent-progress.md) for milestone status and priority.
2. Treat DTM/GSCWF handoff, durable notification retry, and external email activation as integrations that need ONCF/provider contracts. The current local `Send to DTM` action is only a status change; do not report it as an external handoff.

### P2 — Branding, internationalization, and pilot operations

1. English UI copy, validation/API error labels, statuses, enum labels, date/number/plural formatting, metadata, and public/auth pages use the typed message catalog. English remains the sole enabled locale; the French draft is not part of runtime behavior.
2. Review route titles and the complete route/state screenshot matrix across roles, themes, and phone-to-ultrawide sizes after shared layout changes. The latest focused review covered settings, dashboard, header, and access profiles, not every page.
3. Confirm who maintains customer ICE values and how signup verifies them against an authoritative source.

### Dashboard polish completed

- Recent order, program, and claim records share a 16px grid gap without a full-width divider. Fresh dashboard screenshots confirm the current card layout at representative widths.
- The redundant “Showing the latest two records…” note was removed.
- Recent-row secondary text now uses the shared metadata type size, matching the date; the welcome description refers to the workspace rather than repeating the product name.

## Continuation notes

- Read this file with `docs/security/authorization.md` and `docs/project/readiness.md` before continuing the role audit.
- The default role matrix is in `packages/shared/src/auth/roles.ts`; reference seeding reconciles administrator grants and inserts the client/agent grants. Keep the authorization guide and API/web role tests aligned with those grants.
- Agent-to-customer assignment uses the existing `user_customers` many-to-many relation. `users.customer_id` remains the single-customer assignment for client representatives; commercial agents use `user_customers` for their customer portfolio.
- The isolated API E2E runner explicitly uses Node for Jest to avoid Bun-specific dependency incompatibility. Keep E2E data isolated in the disposable Compose database; unit tests do not replace endpoint integration coverage.
