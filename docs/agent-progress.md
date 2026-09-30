# Agent progress

This is the milestone journal for finishing the ECommand MVP. Read it with [workflow verification](project/workflows.md), [MVP readiness](project/readiness.md), and [authorization](security/authorization.md) before continuing. Update this journal after a major chapter, not after every task; use commit history and test output for task-level detail.

## Current position

- **Completed chapters:** 1 — API E2E foundation and core workflows; 2 — admin portfolio management; 3 — SDF-aligned role authorization; 4 — role-aware preview review and dashboard next steps; 5 — browser checks for dashboard, client orders, programs, and registration review; 6 — program lifecycle audit history and a working verification gate; 7 — claim workflow verification; 8 — random claim codes and public-code claim routes; 9 — order/program public-code routes and attachment/tracking URLs.
- **Active chapter:** 10 — close remaining explicit SDF capability gaps and production-readiness requirements.
- **Current checkout:** `develop`; local commits remain unpublished. Review the task-focused history before any further cleanup; do not rewrite published commits.
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
| P0 | Admin role/access management | Explicit SDF Story 5.2 is not implemented. Decide whether pilot admins edit grants only for the three fixed roles or can create roles; then build guarded API/UI, prevent privilege lockout/escalation, and add audit/tests. The current `Role` enum and reference-seeded role table are fixed; do not start a custom-role schema before resolving this model. |
| P1 | Browser E2E and CI | Manual browser checks now cover client order submission, agent approval, order-to-program creation, admin registration review, and claim conversation/closure. GitHub Actions now runs `bun run verify` and isolated API E2E; its first hosted run is pending. Automated browser journeys remain to be added. |
| P1 | Workflow reliability | Test notification failure/retry behavior, authorization failure paths, and confirmed gaps in transition validation. Durable retry and assignment alerts need separate design. |
| P1 | Dashboard | Confirm metrics and next actions are useful for each role and scoped data does not leak. Recent cards and next-step links already exist. |
| P1 | Data and deployment | Confirm ownership/lifecycle rules, stabilize Drizzle schema, then choose migrations and define backup/restore, secrets, HTTPS, object storage, and monitoring. |
| P2 | Product finish | Complete branding/page metadata, ICE ownership, i18n planning, and route-level visual consistency checks. |
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
