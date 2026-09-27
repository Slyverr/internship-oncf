# ECommand repository instructions

Use these instructions for changes in this repository. The product name in human-facing text is **ECommand**. Keep user-facing copy in English. Preserve established technical identifiers such as the `ecommand` package names, database names, and import paths unless a specific migration is requested.

## Before changing code

- Read [the repository README](README.md) for setup and [the documentation index](docs/README.md) for architecture, conventions, and MVP status.
- Inspect the current implementation before assuming a feature or integration is complete. Treat generated files, the database schema, and API behavior as authoritative evidence.
- If a required business decision is missing, make progress on independent work and ask exactly one concise clarifying question for the dependent part. Record unresolved assumptions as gaps; do not invent requirements.
- Keep changes focused and compatible with the existing stack. Do not replace the stack or introduce infrastructure without a clear requirement.

## Repository map

- `apps/api` — NestJS API, organized by business feature. Controllers handle HTTP, services enforce business rules and workflows, queries use Drizzle, and request/response DTOs define the API contract.
- `apps/api/drizzle` — PostgreSQL schema, relations, reference data, and seed scripts. This is the current database source of truth.
- `apps/web` — Next.js App Router application. Routes live in `src/app`, reusable UI in `src/components`, and API calls use the generated client in `src/lib/api`.
- `packages/shared` — enums, permissions, catalog definitions, and types shared by the API and web app.
- `docker-compose.yml` — local PostgreSQL and MinIO services.
- `docs/project` — architecture and MVP readiness.
- `docs/development` — setup, workflow, coding conventions, and verification.
- `docs/security` — roles, permissions, ownership scope, and authorization mapping.
- `docs/interface` — design system, screenshot review, and the ongoing UI/UX checklist.

The current stack is Bun workspaces and Turborepo, NestJS 11, Next.js 16, React 19, PostgreSQL, Drizzle ORM, and MinIO-compatible object storage. Do not substitute the older Java/Spring stack described in project reference material for this existing implementation.

## Implementation standards

- TypeScript strict mode; format and organize code with Biome. Use tabs and double quotes, following neighboring code.
- Use descriptive English names. File names are kebab-case; TypeScript types, classes, and React components use PascalCase; variables and functions use camelCase; enum members use UPPER_SNAKE_CASE.
- Keep domain behavior in feature services, persistence in query classes, HTTP parsing/serialization in controllers and DTOs, and shared domain values in `packages/shared`.
- Add DTO validation with `class-validator`; rely on the application's global validation pipe. Use the established Passport strategies and permission/ownership decorators or guards instead of ad hoc authentication checks.
- Use Drizzle relational queries and schema relations. Avoid raw SQL unless the query needs it and the surrounding feature already follows that pattern.
- Read secrets and runtime configuration through `@nestjs/config` or the web app's environment configuration. Never commit real credentials.
- Keep web API types generated from the NestJS OpenAPI contract. Update API DTOs first, then regenerate with `bun run generate:api` from `apps/web` when the API OpenAPI endpoint is running. Do not hand-edit generated client output unless generation is unavailable and the change is explicitly temporary.
- Prefer existing dependencies and components. For new dependencies, prefer maintained open-source options and keep the addition small.
- Follow [the interface design system](docs/interface/system.md): use semantic theme tokens, mobile-first layouts, and the defined spacing scale.
- Add or update focused tests for changed business behavior when appropriate. Run the relevant typecheck/build and tests when asked to verify or when needed to substantiate a completion claim.

## Database and migrations

The current database design needs review and is expected to change, so migrations are intentionally deferred. Do not add migration files or choose a migration framework until the domain model, ownership/lifecycle rules, constraints, and reference data have been reviewed and stabilized. This avoids preserving a design that may need substantial replacement. For disposable local development only, `bun run db:push` from `apps/api` can synchronize the evolving Drizzle schema; inspect the proposed changes and use a resettable database. Never use schema push against valuable or production data. Seed commands are also run from `apps/api`.

## Commit conventions

- Make one logical change per commit. Keep feature, bug fix, refactor, dependency, and documentation changes separate when they can be reviewed independently.
- Match the existing history: use app/domain scopes such as `feat(web/orders): add draft editing`, `fix(api/orders): validate draft updates`, and `refactor(api/auth): extract database queries`. Use `shared/auth`, `api/drizzle`, or `config/turbo` for those areas. Use an app-only scope for changes across features in one app, and omit the scope for repository-wide changes such as `docs: document project setup`.
- Use an imperative, lowercase subject with no trailing period. Valid types include `feat`, `fix`, `refactor`, `chore`, and `docs`.
- Do not commit secrets, local `.env` files, generated local mail, uploads, or database data.
- Run `bun run verify:commit` successfully before every commit. The command checks formatting/linting, workspace typechecks, API and web test suites, and production builds; it stops on the first failure.
- The tracked `.githooks/pre-commit` hook runs the same gate. Enable it for this checkout with `git config core.hooksPath .githooks` when Git hooks are available.

## Verification and reporting

- Useful root commands: `bun run typecheck`, `bun run build`, and `bun run format-and-lint`.
- Run focused API tests with `bun run test -- <pattern>` from `apps/api`; check the package script before assuming a test runner or command applies elsewhere.
- In your handoff, state what changed, what you verified, and any unresolved gaps. Do not describe a placeholder, status field, or endpoint as a completed external integration.

For web layout or UI work, read [docs/interface/system.md](docs/interface/system.md) before editing screens. Treat it as the shared spec for spacing, type hierarchy, hit areas, responsive rules, sidebar states, notifications, motion, and visual review. Preserve current theme token values unless the user explicitly asks for a palette change.
