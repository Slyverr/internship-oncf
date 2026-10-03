# Agent progress

This is the milestone journal for finishing the ECommand MVP. Read it with [workflow verification](project/workflows.md), [MVP readiness](project/readiness.md), and [authorization](security/authorization.md) before continuing. Update this journal after a major chapter, not after every task; use commit history and test output for task-level detail.

## Current position

- **Completed chapters:** 1–23 — API/browser workflows, permission/ownership enforcement, Admin reference data and custom profiles, English i18n/API message contracts, UX/print work, notification transactions, and transactional user assignments.
- **Active chapter:** 24 — finish role-aware product review and the highest-impact workflow/UI gaps. French rollout remains deferred. See [MVP readiness](project/readiness.md) for the ranked continuation plan.
- **Current checkout:** `develop`; product changes are committed locally and have not been pushed. Do not rewrite published commits.
- **Local app:** `bun run dev` is running at `http://localhost:3000`; web `/login` and API `http://localhost:8000/health` return HTTP 200. The ignored API `.env` points to the isolated `ecommand_preview` database. The pre-existing `ecommand` database was left untouched.

## Completed chapter 1 — API E2E and core workflows

The API E2E runner uses a disposable Compose PostgreSQL database, applies the current Drizzle schema, seeds reference and deterministic E2E data, invokes Jest with Node, and tears down the isolated database. Never point it at the development database. Set `ECOMMAND_E2E_NODE` when Node is not on `PATH`.

Coverage includes:

- Customer, order, claim, program, and report scopes for assigned, outside, and unassigned agents and client ownership.
- Client order draft creation/edit/submission and agent approval.
- Client claim creation, agent reply/treatment/resolution, client close, and duplicate-close rejection.
- Program eligibility, create/submit/approve/confirm lifecycle, and invalid-scope/state denials.
- Admin portfolio assignment/removal, verified by signing in as the affected agent.

**Verification:** 2 E2E suites / 21 tests passed on 2026-09-29.

## Completed chapter 2 — Admin portfolio management

- Commercial agents can be assigned customer portfolios in user create/edit forms. Existing assignments are selected on edit; an empty portfolio is described as having no customer-scoped records.
- The existing `user_customers` relation and API `customerIds` DTO/service support are reused; no database schema change was needed.
- Fresh screenshots reviewed create forms at phone, tablet, laptop, 2K, and 4K widths. The screenshot helper selected matching routes and reported no horizontal overflow.

## Completed chapter 3 — SDF-aligned role authorization

- Replaced the administrator's unrestricted `ALL` grant with account administration, role/access permissions, reports, and profile permissions, matching the SDF. Admins are denied orders, programs, claims, customers, catalog, and tracking.
- Admin reports have full report scope without granting order API access.
- Reference seeding removes old extra grants from the default admin role. The existing local database was not reseeded during this work; use `seed:ref` only against the intended disposable development database before expecting its stored grants to reflect this policy.
- API and web permission checks cover the allowed/denied boundary. The role/access management API and screens remain unimplemented; the corresponding grants are reserved for that SDF capability.
- Claim records now expose stable `CLM-` identifiers in tables, search, details, dashboard, and related views while numeric IDs remain internal route keys.
- Dashboard recent sections share consistent card/list spacing; lone insight cards fill the available row. Browser captures confirmed the behavior at phone, desktop, and 4K sizes.

**Verification:** `bun run verify` passed on 2026-09-29: Biome, all workspace typechecks, web checks, 58 API suites / 440 tests, and production builds. Isolated API E2E also passed 2 suites / 21 tests after the authorization change.

## Completed chapter 4 — Role-aware preview review

- Created the previously approved, isolated `ecommand_preview` database, applied the evolving Drizzle schema, and ran `seed:ref` plus `seed:dev`. The provided admin, client, and commercial-agent test accounts can sign in. The existing `ecommand` database was not modified.
- Browser review confirmed admin sees Home, Reports, and Users only; client and agent see their expected role-specific dashboard and operational navigation. Dashboard captures at 390px and 1440px had no horizontal overflow.
- The admin dashboard previously ended with an access-denied placeholder despite having Reports and Users. It now offers permission-filtered “View reports” and “Manage users” links.
- Recent order/program/claim lists use a 16px row gap and no divider. Fresh captures at 390, 768, 1440, and 3840px showed no cramped separator or horizontal overflow.
- The freshly seeded preview has reference/master data and the three demo users, but no orders/programs/claims. Create sample workflow records before expecting populated recent cards there.

**Verification:** `bun run verify` passed again after the dashboard change. Fresh route-matched screenshots are under `/tmp/ecommand-ui-review` and are temporary.

## Completed chapter 5 — browser workflow verification

- Fresh dashboard captures with two client orders show distinct row spacing and no divider in Recent orders at 390px and 1440px. Orders, programs, and claims share `RecentSection`, which uses a 16px grid gap; the reported separator was not present in current rendered cards, so no styling change was needed.
- The client submitted `ORD-H5VQA5EEQX`, and the assigned agent approved it through the API. The client then submitted `ORD-3F6L4N654Z` and the agent approved it through their rendered UI actions; both detail pages showed the updated status.
- From the second approved order, the agent used **Create program**. The order was preselected; **Continue** advanced to Execution while retaining planned date and quantity; **Create Program** created `PRG-ZXTKRDYWBG` and navigated to its detail page.
- QA signups verified against the local-only `LOCAL-REG-TEST` customer remained pending and could not sign in (401). One was approved through the API and then signed in successfully (201); a second was approved through the rendered **Approve access** action and its detail changed to Approved.
- The dashboard registration link opened `/dashboard/users?registrationStatus=PENDING&role=CLIENT_REPRESENTATIVE`; both filters were selected and the table showed only the pending QA account. Fresh 390px and 1440px captures showed no page-level horizontal overflow; the phone table displayed its horizontal-scroll hint.
- Preview-only data retained for demonstration: two approved sample orders, one program (`PRG-ZXTKRDYWBG`, currently sent to the local DTM status), one approved QA signup, and one pending QA signup (`workflow.pending.demo@example.test`). The existing `ecommand` database remains untouched. No external DTM handoff occurred.

**Verification:** Client submit → agent approval and agent program creation succeeded in the browser. Signup → pending login denial → admin UI approval → approved login succeeded through the API and browser. API `/health` and web `/login` returned HTTP 200; API and web typechecks passed. Temporary screenshots are under `/tmp/ecommand-ui-review`.

## Completed chapter 6 — program lifecycle history

- Program creation, status transitions, planned quantity/date edits, execution updates, and draft deletion now write audit events in the same PostgreSQL transaction as the corresponding program change. Failed or raced status updates do not add history.
- Program details render recorded events with concise labels, changed values where applicable, actor, and timestamp. Existing programs are not backfilled, so programs created before this change may have an empty history until a new event occurs.
- Added query tests for creation, all update event types, and conditional update races. The documented `bun run verify:commit` command now exists and runs the full `bun run verify` gate.
- The isolated API E2E lifecycle now asserts the persisted `CREATED` and three `STATUS_CHANGED` events, including actor identity. It passed with 2 suites / 21 tests using the environment's real Node runtime.
- Corrected Turbo's build output declaration to include `dist/**`. A stale shared-package build had left the API loading an old administrator permission value despite cached typecheck/build success; rebuilding shared and restarting `bun run dev` restored API startup and `/health` returned HTTP 200.
- A fresh screenshot could not run because the screenshot helper's Chrome DevTools endpoint at `localhost:9235` was unavailable. The web `/login` and API `/health` endpoints still returned HTTP 200.

**Verification:** `bun run verify:commit` passed: Biome, shared/API/web typechecks, 58 API suites / 443 tests, web checks, and API/web production builds. Isolated API E2E passed 2 suites / 21 tests, including the new persisted-history assertion.

## Prioritized remaining work

| Priority | Area | Remaining work / evidence |
| --- | --- | --- |
| P0 | Access management | Admin reference-data CRUD and custom permission profiles are implemented with guarded API/UI, fixed base personas, lockout protection, and API/browser coverage. Further work is limited to verifying edge cases as workflows change; creating arbitrary new identity roles is not part of the current schema. |
| P1 | Product UI/UX review | Shared layouts, component styles, English copy, and responsive settings previews are implemented. Finish the fresh route/state/role/theme matrix, inspect every capture, and fix any concrete alignment, field, table, dialog, or action inconsistency found. |
| P1 | Workflow verification | Isolated API E2E passes 27 tests; browser journeys cover Admin navigation and access profiles, reference-data lifecycle, client order submission, agent claim/program workflows, registration review, route access, and client denial. Extend failure-path coverage where a real uncovered path is found. |
| P1 | Dashboard | Role-aware metrics, activity chart, registration-review items, eligible-order actions, and operational links exist. Confirm their value and customer scoping for each persona using representative records. |
| P1 | Customer identity | Signup checks local customer code and ICE. Confirm who maintains ICE values and how they are refreshed; no external ONCF registry is available in this implementation. |
| P2 | Product finish | Review titles across all rendered routes, complete the final page/state visual matrix, and keep English as the sole enabled locale. French runtime support remains deferred. |
| Blocked on external contracts | Integrations | Real DTM/GSCWF handoff, durable external notification delivery, and production email provider require ONCF/provider contracts. Current local status changes and mailbox fallback are not external integrations. |

## Continuation notes

- Preserve the Bun/Turborepo, NestJS, Next.js, PostgreSQL, Drizzle, and MinIO stack; do not substitute the older Java stack from reference material.
- Agent resource scope must intersect assigned customer IDs; an empty portfolio returns no customer-scoped records. Client representatives remain within their linked customer and ownership rules.
- Keep user-facing copy in English and use **ECommand** as the product name. Preserve technical identifiers such as `ecommand` package/database names.
- Do not create migrations while the model is intentionally unstable. `db:push` is for disposable local or E2E databases only.
- Use the screenshot helper against a current browser session; old images are not evidence for current rendering. Keep captures outside the repository unless they become maintained documentation.
- At the final gate run `bun run verify`, review role workflows, and record failed/skipped checks. Keep the development server available to the user.

## Chapter 7 progress — 2026-09-30

- Fresh authenticated browser testing completed the claim conversation workflow: the client created a QA claim and sent a message; the agent read and replied, started treatment, and resolved the claim; the client closed it. The final state showed `CLOSED`, the resolution summary, the closing user, and four status-history entries. Screenshots are temporary under `/tmp/ecommand-ui-review-current` (`client-claim-close-1440x900.png` and the matching agent conversation/status captures).
- Recent dashboard activity was rechecked with current screenshots at 390px and 1440px. The shared `RecentSection` renders order, program, and claim rows with `gap-4` and no separator. The earlier separator issue is not present in the current source or capture.
- The public-code gap is confirmed: order/program numbers use ten random characters, but API and web detail/action URLs still use numeric IDs. Claim numbers are derived from sequential IDs. See [MVP readiness](project/readiness.md) for the required code format and full route scope; URL opacity is defense in depth and does not replace ownership checks.
- Added `.github/workflows/verify.yml`, which runs workspace verification and isolated API E2E on pushes and pull requests. YAML parsing and whitespace validation passed locally; the first hosted run is pending because these commits have not been pushed.
- Restarted `bun run dev` from the current `develop` checkout. Web `/login` and API `/health` returned HTTP 200. Keep the process running for browser review.
- Commits for this milestone: `0ee0803 docs(project): specify opaque public codes` and `79d13bf chore(config): run verification in ci`.

## Chapter 8 — claim public identifiers — 2026-09-30

- Claims now store unique random `CLM-` codes with ten uppercase alphanumeric characters. The evolving Drizzle schema backfills existing preview rows with random codes and enforces uniqueness and format; no migration files were added.
- Claim detail, edit, comment, and workflow API routes now accept the public code. The ownership guard validates the code and still applies customer/creator ownership checks. Dashboard and table links use the code; numeric claim route segments return 400.
- A live check against the isolated preview app authenticated as the test client, fetched its claim list, opened a claim by `CLM-` code (200), and verified a numeric claim route is rejected (400).
- `bun run verify:commit` passed: Biome, all workspace typechecks, web checks, 58 API suites / 442 tests, and production builds. Local isolated API E2E could not run in this environment because only Bun's Node shim is available; CI uses Node 24 and should be checked on its first hosted run.
- Order/program route conversion was the next item after this chapter and is now completed in [Chapter 9](#chapter-9--order-and-program-public-routes--2026-09-30). Existing IDs remain internal for relations and notification metadata.

## Chapter 9 — order and program public routes — 2026-09-30

- Order and program detail, edit, update, lifecycle, delete, order file, and order tracking routes now use their persisted `ORD-` / `PRG-` document numbers. The create-program deep link selects an order by its public number, then submits the internal relation ID as required by the API schema.
- Route guards validate the entity-specific code format and resolve records before the existing ownership/portfolio check. Numeric order/program route segments return 400. Numeric IDs remain in API response relation fields and database joins.
- Fresh read-only smoke checks against the isolated preview verified client order detail (200), order files (200), agent order tracking (200), and agent program detail (200) by public code. Numeric order and program routes returned 400.
- Focused API tests passed: 7 suites / 80 tests. Web logic checks passed, including preselection by order number. `bun run verify:commit` passed: Biome, all workspace typechecks, web checks, 58 API suites / 447 tests, and production builds. Isolated API E2E remains unverified locally because this environment provides Bun's Node shim; CI uses Node 24 and its first hosted run is pending.

## Chapter 10 review checkpoint — 2026-09-30

- Rechecked the current Recent orders UI and the shared `RecentSection` used by orders, programs, and claims. Populated dashboard captures at 320, 375, 390, 768, 1024, 1440, 1920, 2560, and 3840px show row spacing and no separator; source has `gap-4`, `divide-y-0`, and no row border. The reported separator is not reproducible in this checkout, so no CSS change was made. All captures matched `/dashboard` and reported no page-level horizontal overflow. Images are under `/tmp/ecommand-home-recents-current`.
- Re-ranked remaining work by requirement impact and dependencies. Admin role/access management is first, but the policy boundary (fixed seeded roles versus custom roles) must be confirmed before permission writes are exposed. The existing schema includes role, permission, and role-permission tables; shared types/defaults still define only the three seeded roles.
- Began the i18n chapter with a route, dependency, enum-label, and locale-formatting inventory. There are 30 web page files and 104 TSX components; no i18n package/catalog or locale route exists, and `<html lang="en">` is fixed. Locale preference is not yet part of synced appearance preferences. See [internationalization](project/i18n.md) for evidence, open decisions, phases, and acceptance checks.
- Started the first i18n code step: shared date, time, month, and relative-time helpers now use explicit English locale formatting; dashboard and claim-conversation call sites no longer rely on the browser language. Focused web tests, typecheck, Biome, and fresh 390px/1440px dashboard captures passed. No dependency or user-facing language change was introduced.
- Coverage audit found no EmailService tests and roughly 21% statement coverage in that feature. Added ten focused SMTP/local-mailbox cases for absent and incomplete settings, SMTP port validation, authenticated and unauthenticated delivery, local message permissions, recipient-header line-break sanitization, and provider failure. EmailService is now at 100% statements/functions and 96% branches; the remaining branch counter is attributed to the constructor/decorator line rather than an uncovered delivery condition.
- Full API coverage verification now passes 59 suites / 457 tests. Aggregate coverage is 72.35% statements, 69.32% branches, 44.94% functions, and 72.11% lines. These totals include application bootstrap, modules, and persistence queries; they are not a direct measure of user-flow coverage. High-priority query files still need focused review.
- CI has a checked-in workflow, but its first hosted run is still pending publication. Once available, inspect the result before treating CI as verified.
- The next implementation decision is role/access scope and security invariants. i18n can continue with the runtime/locale contract after initial locales and translation ownership are confirmed. See [MVP readiness](project/readiness.md) for the ranked sequence.

## Chapter 11 — English message catalog expansion — 2026-09-30

- Expanded the typed English-only catalog across users: searchable/filterable table, create/edit form validation and steps, review/deactivation actions, profile details, customer portfolio, and selectors. User filters combine query state and support the pending-registration dashboard link.
- Centralized shared guided-form actions/announcements, confirmation/retry defaults, dialog/sheet/sidebar/breadcrumb/table accessibility copy, user navigation labels for both layouts, settings sections/sync status, toast close labels, and good/unit selector states.
- Improved the responsive screenshot helper with `--then-url` so a disposable authenticated browser context can sign in and capture a protected route. The actual Chrome endpoint for this checkout was 9223; captures are under `/tmp/ecommand-users-filter-review-auth`, `/tmp/ecommand-user-create-review`, and `/tmp/ecommand-settings-appearance-current`.
- Fresh authenticated user-list and create-form captures at 390px and 1440px showed no document-level horizontal overflow. Appearance selectors now preview themes, fonts, text scale, workspace layout, and motion; Inter applies through its own loaded font variable. Fresh settings captures at 390px and 1440px show no horizontal overflow.
- Added compile-time exhaustive mappings for declared API error and response codes, plus a test that checks each has English copy. Claim workflow exceptions now return codes without backend-authored display prose; missing claim comments have a dedicated code.
- Added an AST-backed test that rejects literal JSX text and hardcoded values in user-facing JSX attributes. It found and migrated root error-boundary copy, the construction placeholder, and internal/external user type options. Metadata, reference-data labels, email templates, assembled non-JSX strings, and backend internal messages remain outside this scan.
- Bounded the screenshot helper's page-load wait so same-page navigation without a load event cannot leave the capture command hanging indefinitely.
- Re-ran `bun run verify` successfully: Biome, all workspace typechecks, 60 API suites / 462 tests, web checks, and production builds. The web screenshot and copy changes are verified, but French, locale selection/persistence, reference-data label policy, and a complete hardcoded-copy audit remain.

**Next:** inventory strings assembled outside JSX, reference-data labels, email templates, and backend validation/exception details; extend specific code-based error coverage across domains; then add locale preference/persistence and reviewed French catalog entries. The JSX audit is covered, but it is not a complete copy audit. Do not mark i18n complete from route-family coverage alone.

## Chapter 12 — stable message references and authorization review — 2026-09-30

- Added a `Messages` reference object for all 1,077 English catalog entries and migrated the web app's catalog-path literals to those stable references. The alias test checks one-to-one coverage of the catalog; the AST source scan now rejects direct `translate("path")` calls.
- Compared the app's model with RBAC, ABAC, and relationship-based access. Documented the current hybrid: effective permission grants for actions, customer/owner relationships for record scope, and workflow state for valid transitions. Clarified that role rows still bundle permissions for provisioning even though feature code must check permissions, not role names.
- Added PostgreSQL-backed E2E coverage for claim-comment notification recipients by customer portfolio. Corrected two stale contract assertions (out-of-scope claim filter and stable program error code); API E2E passes 22/22.
- Full `bun run verify` now passes: Biome, all workspace typechecks, 63 API suites / 478 tests, web catalog/API contract checks, and production builds. Initial full verification exposed six unit failures caused by test users missing the effective permission set; fixtures now model the permissions the runtime hydrates.
- Inspected the report in print media and generated a real PDF from the authenticated local app. The print preview exposed the centered app header and breadcrumb wasting report space; print rules now hide both, disable the page-entry animation, and set an A4 page with 16 mm margins. The regenerated sample is one A4 page (595 × 842 pt); a screenshot is saved at `/tmp/ecommand-report-review/print-media-preview.png`. Long-report pagination still needs review. Browser printing remains the simplest free option for now; consider a backend PDF only if consistent output or archival becomes a requirement.

**Next:** finish the remaining English copy audit and locale preference/French rollout, then continue the P0 admin permission/reference-data management and automated user journeys. Validate report pagination with a large dataset during pilot closeout.

## Chapter 13 — Admin reference-data entry — 2026-09-30

- Added `/dashboard/catalog`, a permission-filtered Admin page for adding units, goods types, goods, accessory operations, and rejection reasons through the existing catalog API. All visible copy uses stable English `Messages.*` references; lists have loading, retry, empty, and mutation-error states.
- Added `catalog:read` and `catalog:manage` to the Admin default permission bundle. The screen and navigation check effective permissions. Commercial agents and client representatives retain read-only catalog access.
- A fresh isolated Admin browser session confirmed all five list requests return 200. Captured 390px and 1440px views; neither reported horizontal overflow. The 1440px screenshot with data is `/tmp/ecommand-admin-diagnostics/catalog-verified-1440x900.png`.
- Changed the Security settings password action to the shared primary button variant; a screenshot confirmed the orange button in the Settings dialog. Full `bun run verify` passes: 63 API suites / 478 tests, web checks, typechecks, and production builds.
- Seeded the confirmed disposable `ecommand_preview` database to refresh default permissions. `seed:ref` also restores its normal active state for seeded reference rows. The catalog interface is currently add-only; existing values still need reviewed edit/archive rules. Custom roles remain gated on schema/persona design.

**Next:** define and implement safe edit/archive behavior for each business catalog set, then proceed with custom permission-role management after reviewing the evolving schema and its operational persona rules.

## Chapter 14 — Admin catalog lifecycle — 2026-10-01

- Reworked `/dashboard/catalog` into a single workspace with a left-side category rail. It is vertically centered/sticky on desktop and becomes a compact, labeled icon grid on phone and tablet. The selected category replaces the panel in place; phone, tablet, and desktop captures report no horizontal overflow. Captures are in `/tmp/ecommand-admin-catalog-rail` and `/tmp/ecommand-admin-catalog-switch-final`.
- Admin can add and rename values, and archive or restore units, goods types, goods, accessory operations, and rejection reasons. Archiving a goods type with active goods returns a stable conflict code; a good cannot be created or reactivated under an inactive type. Archive remains soft and reversible.
- New admin-created catalog rows receive UUIDs, so renaming does not detach their identity from the label. Reference seeding now inserts managed base rows only when absent, preserving admin names and active states. No schema push or migration was needed.
- Added permission-guarded manage/list and update routes for each catalog type, regenerated Orval output from the built API using the documented real Node runtime, and added controller permission mapping plus service lifecycle tests. `bun run verify` passes: Biome, all workspace typechecks, 63 API suites, web checks, and production builds. API health is 200 on port 8000; the Admin category switch was captured after login.
- The screenshot helper now supports post-navigation clicks, which enables browser checks that log in and then exercise a safe page control. The Security password action remains on the shared orange primary style.

**Next:** verify custom-profile assignment and permission boundaries across user workflows, then continue the remaining English copy audit, locale persistence/French planning, and production-readiness checks.

## Chapter 15 — Admin permission profiles — 2026-10-01

- Completed the role-profile path across API, OpenAPI client, web user creation/editing, and the Admin `/dashboard/roles` screen. Administrators can create, edit, archive, and restore custom profiles; built-in profiles remain protected. Assignment uses `roleId`, effective permissions authorize API and UI actions, and the workflow persona is only used for customer/signup rules.
- The management screen is gated by `roles:manage`, presents only assignable permission definitions, localizes built-in persona names, and reports assignment conflicts from stable API error codes. User forms now load active profiles and show persona-dependent customer/portfolio fields.
- Captured route screenshots at 320, 390, 640, 768, 1024, 1440, 1920, 2560, and 3840px with no horizontal overflow. Narrow layouts use a full-width row list; wider workspaces use a table. The fixed-size create dialog was reviewed at 390 and 1440px.
- Browser-tested creating an unassigned, read-only custom profile and archiving it. The test profile is archived in the disposable preview database. Biome, web catalog/API tests, and all workspace typechecks pass. A full production build/verify has not yet been rerun after this chapter.
- Tightened shared text-button horizontal padding to the 8px control token after review of the request about excessive spacing; icon-only controls retain their target dimensions.

The security follow-up for preventing administrator lockout is completed in Chapter 16.

## Chapter 16 — active administrator protection — 2026-10-01

- User deactivation now serializes on the active Admin rows and returns the stable `LAST_ACTIVE_ADMIN` error if the requested change would remove the final active administrator. The web maps that code through the English catalog.
- Added service coverage and a PostgreSQL-backed E2E race test that sends two deactivation requests concurrently, asserts one succeeds and one receives the code, then restores the seeded Admin account before the isolated database is discarded.
- Rechecked the custom permission-profile journey in the same isolated suite: API profile creation, user assignment, effective-permission allow/deny behavior, reserved-grant rejection, and protection of built-in roles all pass.
- The first E2E attempt found port 55432 occupied, so the isolated runner was retried on port 55433. The disposable database completed and was torn down; the application and preview databases were not targeted.

**Verification:** 2 API E2E suites / 24 tests passed; focused UsersService tests (24 tests), all three workspace typechecks, the full web test set, and Biome on changed files passed.

**Next:** add browser-level role/profile and workflow journeys, finish the English copy audit, then proceed with locale preference/French readiness and report pagination. Run the full production verification gate before handoff.

## Chapter 18 — permission assignment browser workflow — 2026-10-01

- Added an isolated browser journey that creates a custom orders:read profile in the Admin interface, assigns it to a newly created account, then signs in as that account. The journey verifies the Orders route and read endpoint are allowed while user administration is hidden and order creation is denied by the API.
- The full isolated API E2E suite passes 24/24 and all five browser journeys pass, including Admin navigation, custom profile assignment, reference-data lifecycle, agent claim access, and client denial. The disposable database is torn down after the run.
- Web checks, TypeScript typecheck, and Biome pass. Live app health is 200 on ports 3000 and 8000.

**Next:** add browser coverage for client order submission, agent program/claim workflows, and Admin registration review; complete the residual English string audit and locale persistence plan; then run full workspace verification and review production readiness gaps.

## Chapter 17 — reference-data browser workflow — 2026-10-01

- Added a browser E2E workflow for an administrator creating, renaming, archiving, and restoring a reference-data unit in the isolated E2E database.
- The first run exposed that the simple reference-data dialog did not receive its edit state, so the submit action was labeled “Add” while editing. Passed `isEditing` through to the shared dialog; the same browser workflow now verifies that the action and persisted row state update correctly.
- The API E2E suite passes 24/24 tests. Four browser workflows pass through the running Chrome CDP session: Admin navigation, Admin reference-data lifecycle, agent claim creation access, and client API denial. The E2E runner tears down its disposable database afterward.
- Playwright’s bundled Chromium cannot launch in this Nix environment because `libnspr4.so` is unavailable. Running the same suite through the existing Chrome CDP endpoint avoids that host-library gap; no application or preview database was used.
- Web catalog/API tests, the web TypeScript check, Biome on changed files, and `git diff --check` pass.

**Next:** add browser workflows for role assignment, client order submission, agent approval/program creation and claim handling, and Admin registration review. Continue the residual English copy audit and run full workspace verification before handoff.

## Chapter 19 — English i18n source audit — 2026-10-01

- Audited the server-owned message paths: the NestJS exception filter returns stable error codes and structured validator-rule codes, success DTOs return response codes, and the web maps those codes to the English catalog. API-provided English exception/validation prose is stripped before it reaches the UI.
- Checked the password-reset subject/body, notification copy, toast handlers, API error handling, and shared date/number/file-size formatters. Email copy is centralized in the API English template; notifications use message codes and parameters; toast and helper flows resolve catalog messages. Developer-only provider invariant errors remain diagnostic strings.
- Classified mutable customer names, custom role-profile names, and admin-managed reference names as business data displayed verbatim. Fixed workflow states remain stable codes with catalog mappings. French rollout still needs a decision for system-seeded reference labels and the effect of admin renames.
- Confirmed Settings Appearance already previews themes, workspace layouts, fonts, text size, and motion. Updated readiness and i18n documentation to record those previews and the remaining locale gaps.
- Completed a full non-runtime French draft for all 22 English catalog sections (1,242 message keys). Focused web tests confirm key, plural-shape, and placeholder parity; web/API typechecks, the API message-contract test, and focused Biome checks pass. A French password-reset email draft is present but is not wired into delivery. French remains disabled pending copy review and locale/email integration.

**Next:** review the French draft with the ONCF glossary, complete locale-aware email delivery and synced locale preference/runtime support, and test browser/API formatting with French enabled only after review. Keep user-authored and admin-editable business names verbatim; English remains the only available locale until rollout is complete.

## Chapter 20 — complete isolated user-workflow verification — 2026-10-01

- Ran the isolated API E2E suite with Node 24 from the repository's Nix shell: 2 suites / 24 tests passed.
- Ran all eight browser workflows through the active Chrome CDP session: Admin navigation and access, registration review, custom permission assignment and enforcement, reference-data lifecycle, agent navigation and scoped claim/program creation, client order submission, and client access denial all passed.
- The first browser attempt confirmed the host's Playwright Chromium is missing `libnspr4.so`. Reusing the already-running Chrome CDP browser completed the same workflows without changing dependencies.
- The report page was freshly captured at all ten documented viewport sizes from 320px to 3840px. All routes matched, all page widths stayed within the viewport, and date filters/export controls remained visible and usable. No report UI change was warranted.
- The E2E runner tore down its disposable database after each run. It did not target the preview database. The full repository verification had passed in the preceding work chapter; no application source was changed in this verification chapter.

**Next:** keep French deferred as requested. Remaining product-closeout work is production readiness (database ownership/lifecycle review, backups, secrets, HTTPS, monitoring), an owner/process for customer ICE verification, and notification delivery reliability decisions. Check the first hosted CI result when available; the local isolated API and browser journeys now pass.

## Chapter 21 — atomic coded workflow notifications — 2026-10-01–02

- Claim-comment recipients are resolved before persistence: the claim creator and active users with `claims:read` in the claim customer's portfolio receive a coded in-app notification; the author never receives their own notification.
- The comment, any first-response status/history change, and all recipient notification rows now commit or roll back together. If notification persistence fails, the comment cannot be saved without its notification records.
- Added query coverage for the shared transaction and workflow tests for creator and customer-portfolio recipients. A new failure-path test verifies recipient lookup errors stop before comment persistence.
- Removed the unused best-effort `notifyChange` helper, which could silently lose notifications and had no production callers. Workflow code now only prepares notification records for persistence through domain transactions.
- Updated architecture/readiness docs to distinguish transactional in-app records from external delivery, which remains unimplemented.
- Verification passed for this continuation: all 6 Claims API suites / 60 tests, NotificationsService tests, API typecheck, and Biome on changed source files. Earlier chapter evidence includes isolated PostgreSQL API E2E (2 suites / 24 tests) and full `bun run verify` (Biome, workspace typechecks, 69 API suites / 518 tests, web checks, and production builds).
- The separate headless browser E2E attempt could not launch this host's Playwright Chromium because `libnspr4.so` is unavailable. No system package was installed. Earlier browser workflow evidence through Chrome CDP remains documented in Chapter 20.

**Next:** finish the product review by checking every route/state/role at representative responsive sizes, resolve any evidenced workflow/UI inconsistencies, and confirm the customer ICE maintenance process. French remains deferred per product direction.

## Chapter 22 — transactional user assignments — 2026-10-02

- User creation and customer-portfolio insertion now share one database transaction. User profile updates and portfolio replacement/removal also share one transaction, so a failed foreign-key assignment cannot leave partial account changes.
- Added isolated API E2E failure cases for both operations: invalid customer assignments leave no sign-in-capable account and do not partially update an existing user.
- The isolated E2E runner now fails a successful test run if service teardown fails, and its final check confirmed no E2E containers remained.
- Verification: API typecheck passed; all 69 API unit suites / 521 tests passed; isolated E2E passed (2 suites / 27 tests); changed-file Biome checks and `git diff --check` passed.

**Next:** improve remaining user-facing workflows and UI consistency, then run focused verification that covers each affected role and state.

## Chapter 23 — role workflows and responsive access-profile review — 2026-10-02

- Added direct query tests for case-insensitive email-existence lookup, active-role-only assignment, and user existence by internal ID. All 69 API unit suites / 527 tests pass.
- Re-ran the isolated API E2E suite: 2 suites / 27 tests passed.
- Re-ran all eight browser workflows against the isolated database using the repository's Chrome CDP path: Admin navigation and access, registration review, custom permission assignment/enforcement, reference-data lifecycle, agent claim/program creation, client order submission, and client access denial passed.
- The first browser attempt established that the host's Playwright-managed Chromium lacks `libnspr4.so`; the available system Chromium via CDP completed the suite. The runner removed the disposable E2E database and services afterward.
- Captured and inspected the Access profiles screen at ten widths (320px–3840px). There was no horizontal overflow; the small-container card view and wide-container shared table view both aligned correctly. No speculative UI change was made.
- `bun run verify` passed after the query-test additions: Biome, all workspace typechecks, 69 API suites / 527 tests, web checks, and all builds.

**Next:** continue the route-by-route visual and workflow audit, fixing only evidenced inconsistencies; return to French locale enablement after the higher-priority UI and workflow gaps are closed.

## Chapter 24 — Admin dashboard and claims query coverage — 2026-10-02

- Expanded the Admin dashboard with mutually exclusive user-account totals, an order-status chart fed by the existing report query, and shortcuts to access profiles and reference data. Each section is gated by its effective permission; no operational-record access was added to Admin.
- Captured and visually inspected the authenticated Admin dashboard at 390, 768, 1440, and 1920px. The phone page scrolls normally, the management actions remain reachable above bottom navigation, and every capture reported no horizontal overflow. Current images are under `/tmp/ecommand-admin-dashboard-final`.
- Extended `ClaimsQuery` tests across portfolio/list filters, code lookups, create/delete helpers, comment ordering, conditional status transitions, status history, and transactional notifications. Focused query coverage is 100% for statements, lines, and functions, with 92.59% branch coverage.
- Removed two stale imports from the access-profile query spec after the full lint gate exposed them.
- `bun run verify` passed: Biome checked 607 files, all workspace typechecks passed, 72 API suites / 600 tests passed, web checks passed, and all workspace builds completed. API aggregate coverage is 75.93% statements, 72.84% branches, 57.66% functions, and 76.06% lines.
- Commits: `4e960e9 feat(web/dashboard): add admin account insights`, `9298542 test(api/claims): cover query transactions`.

**Next:** complete the outstanding route/state/role visual audit, prioritizing create/edit forms, settings/dialog states, and permission-specific empty/error states; verify the documented authorization matrix against current effective permissions and E2E workflows. Then review route titles and the remaining customer ICE ownership question. French and production deployment remain out of scope for this chapter.

## Chapter 22 continuation — product consistency and verification — 2026-10-02

- Kept centered navigation on one row from tablet widths upward and aligned built-in/custom access-profile status treatment. Fresh captures across 320–3840px showed no horizontal overflow.
- Verified the theme chooser at phone, tablet, and desktop widths. Its compact palette previews remain inside a select menu; selecting Charcoal dark updates the UI and survives navigation, then the original Warm light preference was restored.
- Updated the screenshot helper's text action to include accessible listbox options, allowing browser checks to select theme options and similar controls.
- Fresh dashboard captures at 390px, 768px, and 1440px showed the Admin's registration review, six-month activity, and permission-appropriate links without page overflow.
- Full `bun run verify` passed: Biome, workspace typechecks, web checks, 69 API suites / 521 tests, and all builds. Isolated API E2E passed 2 suites / 27 tests with the configured real Node runtime; disposable containers were removed.
- Product changes were committed locally as `d9c2469` and `bbd592e`; roadmap and verification-tooling updates were committed separately as `29953f2` and `ff12f4b`.

## Chapter 25 — dashboard insights and navigation permission matrix — 2026-10-02

- Added permission-scoped order breakdowns by customer and product to the Admin dashboard using the existing report response. The dashboard still does not grant Admin direct operational-list access. English UI labels and accessible chart descriptions use the shared message catalog; the French draft retains key/placeholder parity.
- Captured and inspected the authenticated Admin dashboard at 1920×1080 and 390×844, plus normal phone viewport captures at the top, middle, and bottom. The page has no horizontal overflow; the fixed phone navigation remains attached to the viewport. Fresh evidence is in `/tmp/ecommand-admin-dashboard-1920x1080.png` and `/tmp/ecommand-admin-dashboard-phone-{top,middle,bottom}.png`.
- Sidebar and centered navigation now share one permission-filtered route helper. Unit checks cover all three default permission bundles and a custom permission set. Expanded the browser role checks for visible and hidden routes across Admin, Agent, and Client; the CDP browser run exposed and fixed duplicate responsive navigation matches in the test selector.
- Verification passed: full `bun run verify`, isolated API E2E (2 suites / 27 tests), all eight browser workflows, and focused web test/typecheck/Biome checks. The test hooks also passed during both commits.
- Commits: `7283595 feat(web/dashboard): add customer and product insights`, `eeca067 refactor(web/navigation): centralize route permissions`.

**Next:** continue the product closeout, not test-only work: review create/edit forms, settings/dialog states, role-specific empty/error states, and the permission matrix at route level. Record a defect only from inspected screenshots or a reproduced workflow, then fix and retake the affected evidence. Customer ICE ownership remains unresolved; French and production deployment remain deferred.

## Chapter 26 — responsive order creation and workflow verification — 2026-10-03

- Captured and inspected the Agent order-create first step at 390, 768, 1440, 1920, 2560, and 3840px. The title follows the shared workspace width, the form is constrained consistently on large screens, phone controls stack cleanly, and the footer actions remain reachable above the fixed navigation. No UI change was warranted; screenshots are in `/tmp/ecommand-order-create-current`.
- Ran `bun run verify` successfully against the current checkout: formatting/linting, workspace typechecks, unit suites, and production builds all passed.
- Ran the isolated browser E2E suite using temporary real Node and Chromium runtimes. Both API suites / 27 tests passed, as did all 12 browser workflows, including Admin management, Agent and Client workflows, CSV export, and the preselected order → cancel → create program path. The test runner removed its disposable database and services.
- Rechecked the live preview after the verification run: API health and web login returned 200, and temporary capture Chromium was stopped to release memory.
- Updated the readiness report and marked the program-selection/cancel checklist item complete based on the current browser workflow evidence.

**Next:** continue the route-by-route UI audit with remaining create/edit steps, settings/dialog sections, and role-specific empty/error states. Reconcile remaining checklist items against current evidence; keep French deferred until these higher-priority reviews are complete. Customer ICE ownership and external DTM/SMTP contracts remain open decisions.

## Chapter 27 — settings, field alignment, and shell hydration — 2026-10-03

- Disabled password change until the current password is present, the new password passes the shared strength rule, and confirmation matches. Password mismatch feedback now updates while editing. Replaced the two Appearance shell miniatures with clear sidebar/header icons.
- Fixed the shared `oncf-field` grid utility so helper text in one field cannot vertically distribute its label and input or offset its sibling. Inspected fresh customer-create captures at 390px and 1920px; fields align on desktop and stack on phone.
- Authenticated root renders now load the saved appearance preference through the existing session cookie before the dashboard shell renders. The server fetch times out after three seconds and falls back to browser storage on API failure. A signed-in dashboard reload rendered the saved centered-header layout without first showing the sidebar.
- Verification: web typecheck, web checks, Biome, and `git diff --check` passed. Preview web and API health endpoints both returned 200. Temporary capture Chromium was stopped; the preview servers remain running.
- Commits: `6548265 fix(web/settings): validate password changes before submit`, `cf30ba0 fix(web/forms): top-align fields inside grid rows`, `9a6256d fix(web/layout): render saved shell preference on server`, `bfcbe79 fix(web/layout): bound server preference lookup`.
- Rechecked shell hydration on an authenticated dashboard with and without the preference-cache cookie. The saved centered-header layout was present from the first sampled document state in both cases; the account API fallback restored the cache. The fresh customer-create screenshot also confirms aligned ICE/type controls at 1440px and a clean stacked layout at 390px.
- Follow-up found that returning the cached value before consulting the account API could let a stale cookie render first, then switch layouts when the client revalidated. Server rendering now prefers the current database value and uses the user-scoped cache only when no account preference exists or the API is unavailable. Regression tests cover stale-cache precedence and both fallback cases. Dashboard captures at 390px and 1440px and customer-create captures at 390px, 1335px, 1440px, 1920px, and 3840px were inspected; all matched their routes and had no horizontal overflow, and the customer fields aligned in the desktop row.
- Re-ran the isolated API E2E suite: 2 suites / 27 tests passed. All 12 browser workflows passed with a fresh temporary Chromium profile. An initial run against the long-lived screenshot browser timed out before the first workflow reached `/login`; a clean profile passed, and the runner removed its disposable database and services.
- Web catalog and API-code checks passed, including the no-inline-copy scan; direct TypeScript compilation passed. The standard package typecheck command could not resolve `tsc` in the shell PATH, so the compiler was invoked directly.

**Next:** close the remaining route/state/theme/role visual matrix and verify the current permission/user/schema workflows. External DTM handoff and production mail delivery still need endpoint/provider contracts; customer ICE data still needs a named owner and update process. Keep French deferred until the product closeout is complete.
