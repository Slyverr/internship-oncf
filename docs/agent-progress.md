# Agent progress

This is the milestone journal for finishing the ECommand MVP. Read it with [workflow verification](project/workflows.md), [MVP readiness](project/readiness.md), and [authorization](security/authorization.md) before continuing. Update this journal after a major chapter, not after every task; use commit history and test output for task-level detail.

## Current position

- **Completed chapters:** 1 — API E2E foundation and core workflows; 2 — admin portfolio management; 3 — SDF-aligned role authorization.
- **Active chapter:** 4 — MVP closure: finish role-aware browser checks, remaining workflow gaps, and verification evidence.
- **Current checkout:** `develop`; local commits remain unpublished. Review the task-focused history before any further cleanup; do not rewrite published commits.
- **Local app:** the development stack was running at `http://localhost:3000` and API `/health` returned HTTP 200 on 2026-09-29. Keep it available for user review.

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

## Prioritized remaining work

| Priority | Area | Remaining work / evidence |
| --- | --- | --- |
| P0 | Role workflows | Complete current browser checks with seeded client/agent/admin accounts. Confirm the app after default permissions are refreshed in the disposable local database; inspect role-specific visible routes and direct API denials. |
| P1 | Role/access management | Implement the admin role/permission management UI and API if required for the MVP; currently only the permission identifiers and grants are present. |
| P1 | Browser E2E and CI | Add isolated Playwright journeys for critical client/agent/admin workflows, then wire static checks, unit tests, API E2E, and browser E2E into CI. |
| P1 | Workflow reliability | Test notification failure/retry behavior, authorization failure paths, and any confirmed gaps in transition validation. Durable retry and assignment alerts need separate design. |
| P1 | Dashboard | Confirm metrics and next actions are useful for each role and scoped data does not leak. Recent cards/eligible-order and registration links already exist. |
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
