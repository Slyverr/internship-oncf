# Agent progress

This is the milestone journal for finishing the ECommand MVP. Read it with [workflow verification](project/workflows.md), [MVP readiness](project/readiness.md), and [authorization](security/authorization.md) before continuing. Update this journal after a major chapter, not after every task; use commit history and test output for task-level detail.

## Current position

- **Completed chapter:** 1 — Automated API E2E foundation and core workflow journeys.
- **Active chapter:** 2 — Admin portfolio management.
- **Active work:** commercial agents can now be assigned customer portfolios in user create/edit forms. The admin assignment/removal behavior is covered through the isolated API E2E suite. A live browser interaction review is still pending.
- **Current checkout:** `develop`; unpublished history was restructured locally and has not been pushed.
- **Local app:** `bun run dev` remains available at `http://localhost:3000`; web `/login` and API `/health` returned HTTP 200 on 2026-09-29. Keep it available.

## Completed chapter 1 — Automated API E2E and core workflows

The API E2E runner uses a disposable Compose PostgreSQL database, applies the current Drizzle schema, seeds reference and deterministic E2E data, invokes Jest with Node, and tears down the isolated database. Never point it at the development database. Set `ECOMMAND_E2E_NODE` when Node is not on `PATH`.

Coverage now includes:

- Customer, order, claim, program, and report customer-portfolio scopes, including assigned, outside, and unassigned agents, client ownership, query filters, and direct-ID denials.
- Client order draft creation/edit/submission and assigned-agent approval, with invalid/cross-customer transition denials.
- Client claim creation, agent response/comment and treatment/resolution, client close, and duplicate-close rejection.
- Program eligibility, assigned-agent creation, outside/unassigned/client denials, draft-order rejection, duplicate creation, and submit/approve/confirm transitions.
- Administrator changes to agent portfolios, verified by signing in as the agent and confirming assigned customer access takes effect; removing all customers returns an empty scope.

**Verification:** isolated API E2E passed 2 suites / 20 tests on 2026-09-29. The run synchronized schema, seeded fixtures, and removed the isolated Compose project successfully. API typecheck passed earlier in the same work session.

The Admin role still has broad `ALL` grants. E2E tests reflect current behavior; they do not decide whether this matches the SDF. Keep the admin-policy question unresolved until the product owner confirms the expected permissions.

## Active chapter 2 — Admin portfolio management

- A reusable customer portfolio picker now appears for commercial agents in the user create and edit forms. Edit starts with existing assignments selected; an empty selection is explicitly described as granting no customer-scoped records.
- Existing API DTO/service support for `customerIds` is reused; no backend contract or schema change was needed.
- **Verification:** web typecheck, web test suite, Biome, and isolated API E2E passed after implementation (20 E2E tests).
- **Remaining:** exercise the create/edit controls in a live browser session and visually inspect both forms, including narrow widths and role changes. A current screenshot capture failed to render the local app through the headless Chrome session; its CDP port is 9223 rather than the helper's documented default 9235. The captured Chrome error pages are invalid visual evidence and must not be treated as overflow findings.

## Prioritized remaining work

Priorities reflect pilot usability, data integrity, and workflow risk. Keep each implementation change focused and independently verifiable.

| Priority | Area | Remaining work / evidence |
| --- | --- | --- |
| P0 | Browser verification | Use the repository screenshot helper against a working Chrome session; verify current create/edit portfolio UI, dashboard recent cards, and remaining role journeys at responsive widths. |
| P1 | Claim identifiers | Replace numeric-only claim labels with stable `CLM-XXXXXXXXXX` identifiers. First audit schema generation, uniqueness/collision behavior, existing data, DTOs, search, and every table/detail/dashboard display. Migrations remain deferred until the domain schema stabilizes. |
| P1 | Browser E2E and CI | Establish Playwright with an isolated test database; cover critical client/agent/admin journeys; then wire static checks, tests, API E2E, and browser E2E into CI. |
| P1 | Dashboard | Add useful role-aware insights and next actions using scoped data. Recent order/program/claim rows already share `RecentSection` with `grid gap-4` and no separator. Eligible-order and pending-registration links are implemented. |
| P1 | Security/failure paths | Review authentication, DTO validation, transition rules, notification failures, rate limits, and retries; add tests for each confirmed gap. |
| P1 | Data and deployment | Confirm ownership/lifecycle rules, stabilize Drizzle schema, then choose migrations and define backup/restore, secrets, HTTPS, object storage, and monitoring. |
| P2 | Product finish | Complete branding/page metadata review, ICE data ownership, localization plan, and route-level visual consistency checks. |
| Blocked on external contracts | Integrations | Real DTM/GSCWF handoff, durable notification delivery, and production email provider require ONCF/provider contracts. Current local status changes and mailbox fallback are not external integrations. |
| Blocked on owner decision | Admin policy | Confirm the expected admin grants against the SDF before replacing current `ALL` grants. |

## Safety and continuation notes

- Preserve the Bun/Turborepo, NestJS, Next.js, PostgreSQL, Drizzle, and MinIO stack; do not substitute the older Java stack from reference material.
- Agent resource scope must intersect with assigned customer IDs; an empty portfolio returns no customer-scoped records. Client representatives remain within their linked customer and existing ownership rules.
- Keep user-facing copy in English and use **ECommand** as the product name. Preserve technical identifiers such as `ecommand` package/database names.
- Do not create migrations while the model is intentionally unstable. `db:push` is for disposable local or E2E databases only.
- No fresh screenshot has been verified in the latest attempt. Check the live CDP target and rendered route before drawing visual conclusions. Older screenshots are not evidence of current rendering.
- At the final gate run `bun run verify`, inspect the output, run the role workflows, and record all failed/skipped checks. Keep the development server available to the user.
