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

### Automated checks

- API unit tests: 54 suites and 405 tests passed.
- Web checks: 9 checks passed, including default-role action visibility.
- Workspace typecheck passed for shared, API, and web packages.
- Responsive dashboard screenshots were captured at the documented ten viewport sizes (320px through 3840px). The browser helper reported no horizontal overflow. The 320px and 1440px agent captures showed the new Create claim action; the 1440px recent-activity cards showed separated rows with no divider. The first agent login capture had to be isolated because successful login redirects from `/login` to `/dashboard`.
- API end-to-end Jest config now points at the API root and maps the `@/`, `src/`, and `drizzle/` aliases. After that correction, Bun failed inside `depd` (`callSite.getFileName is not a function`) before tests ran. Node is not installed in this environment, so this suite remains unverified under a Node runtime.

### QA data retained in the preview database

These records were created by the live workflow check and are clearly labeled for local QA:

- Order `3` (`ORD-A8AV3T6VKN`), submitted and agent-approved.
- Program `7` (`PRG-X8FVKFWS25`), sent to the local DTM status; no external DTM request was made.
- Claims `2`, `3`, and `4`, all QA-labeled. Claim `2` was resolved and closed during the first check; claim `4` was closed by its client owner after the permission update; claim `3` records agent claim creation.
- User `13` (`qa.workflow.20260928@example.test`), approved and active.

The order/program/claim are preserved so their resulting workflow state can be inspected. The test user should be deactivated or removed before reusing this preview database for a clean demonstration.

## Prioritized continuation

### P0 — Enforce operational access scope

1. Review agent customer scope. The SDF rule R-16 says commercial agents see only orders belonging to their customers. The checked agent saw orders for two customers, while its profile had no `customerId`. Users can be assigned an `agencyId`, but customers have no agency relation; `order_shares` is the only current agency-to-order link. Confirm whether shared orders define an agent's customer portfolio, then apply that scope consistently to lists, ID routes, reports, program eligibility, and claim creation.
2. Review admin scope. The SDF role matrix grants administrators reporting and user administration, and marks order, planning-program, and claim operations unavailable. The current default admin grant is `ALL`, and the live program approval succeeded. This is a broad authorization mismatch; confirm whether the SDF matrix is authoritative for administrators before replacing `ALL` with explicit grants and adjusting admin screens/tests.

### P1 — Complete workflow identifiers and useful dashboard insights

1. Replace numeric-only row labels with stable human-readable record codes where the SDF and workflows expect them. Start with claims using `CLM-` plus a unique ten-character suffix, matching the order/program code pattern; audit every table/detail/dashboard that currently renders `#<id>`, and define safe backfill, collision handling, search, DTO, and display behavior. Schema changes remain subject to the existing schema-stabilization guidance; do not add migrations prematurely.
2. Add role-aware dashboard insights so the home page answers what needs attention and what changed, with meaningful metrics/charts, useful empty states, and links to the next action. Reuse existing scoped report/workflow data where appropriate; do not duplicate or leak cross-customer data.
3. Completed: sign-in accepts either email or employee/matricule identifier. Email and employee-code matching are case-insensitive, and the schema enforces case-insensitive employee-code uniqueness. Apply the evolving schema with `bun run db:push` only against a disposable development database, per repository policy.

### P1 — Complete integration and test readiness

1. API end-to-end Jest config now resolves the project aliases, but Bun fails inside a dependency before tests run. Rerun with a supported Node runtime, then add HTTP integration cases for auth, ownership, role denials, and order/program/claim transitions.
2. Treat DTM/GSCWF handoff, durable notification retry, and external email activation as integrations that need ONCF/provider contracts. The current local `Send to DTM` action is only a status change; do not report it as an external handoff.

### P2 — Branding, internationalization, and pilot operations

1. Review the app's centered brand wording and page metadata. Replace any remaining generic Vercel favicon with approved ONCF/ECommand artwork, and make browser titles consistent across every route.
2. Plan i18n before translating piecemeal: select initial locales with the product owner, centralize all UI copy, validation/API error labels, status and enum labels, date/number/plural formatting, and public/auth pages, then migrate every route and shared component. Keep business identifiers and stored enum values language-neutral.
3. Confirm who maintains customer ICE values and how signup verifies them against an authoritative source.
4. Run and inspect the complete route screenshot pass across desktop and phone sizes after shared layout or branding changes; the dashboard-specific pass does not cover every page.

### Dashboard polish completed

- Recent order, program, and claim records now use 16px vertical spacing without a full-width divider.
- The redundant “Showing the latest two records…” note was removed.
- Recent-row secondary text now uses the shared metadata type size, matching the date; the welcome description refers to the workspace rather than repeating the product name.

## Continuation notes

- Read this file with `docs/security/authorization.md` and `docs/project/readiness.md` before continuing the role audit.
- The approved claim-role changes are in `packages/shared/src/auth/roles.ts`; role-permission reference seeding adds the new grants to the existing preview database. Keep the authorization guide and API/web role tests aligned with those grants.
- Agent-to-customer assignment remains an unresolved domain-model gap: `users.agency_id` and `order_shares.agency_id` exist, but `customers` has no agency link. Do not infer that every shared order means an assigned customer without confirming the intended rule.
- API end-to-end tests resolve project aliases after the Jest config correction, but Bun currently fails in a dependency before test execution. Unit tests passing do not replace HTTP integration coverage; rerun with a supported Node runtime when available.
