# Development workflow and conventions

## Local setup

Follow the root [README](../../README.md) for installation, Compose services, environment files, schema push, seeding, and startup. The root [bunfig.toml](../../bunfig.toml) selects Bun's hoisted workspace linker; install from the repository root and keep that linker setting so Next.js can resolve packages through the workspace root node_modules. Use the sample environment files as templates and keep real `.env` files out of Git. Query devtools are off by default; set `NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS=true` in the web environment when debugging query state.

Useful root commands:

```sh
bun install
bun run dev
bun run typecheck
bun run build
bun run format-and-lint
```

The default `bun run dev` keeps the web TypeScript watcher running alongside Next.js, so type errors appear during development. This watcher can use substantial memory. For a lighter server startup, run `bun run dev:light`; it starts the same API and web servers without the TypeScript watcher. Run `bun run typecheck` for a one-time check, or start `bun run --filter ecommand-web typecheck:watch` separately when continuous feedback is useful.

For a repeatable responsive screenshot pass, start `bun run dev` and open the app in a Chrome session with the DevTools endpoint enabled at `http://localhost:9235`. Then run:

```sh
bun run ui:review -- --url /dashboard/orders --label orders
bun run ui:review -- --url /login --fresh-context --label login
```

The Bun script captures 320, 375, 390, 640, 768, 1024, 1440, 1920, 2560, and 3840px viewports into `/tmp/ecommand-ui-review`, reports document overflow and the route actually rendered, and restores the browser's original route afterward. Protected routes use the current authenticated browser session. Public auth routes should use `--fresh-context` to avoid the signed-in session redirecting away; that option creates and closes an isolated temporary browser profile. The tool adds no dependency. Use `--click '<selector>'` for visible controls, `--fill '<selector>=<value>'` for temporary form state, and `--wait-for '<selector>'` for the resulting state. Because clicks are real UI actions, use only known non-persisting actions such as a reviewed client-side step transition; do not click a final submit or confirmation action. `--help` lists all options. These captures are evidence for visual review, not pixel-diff tests; inspect the images and exercise stateful workflows separately.

API database commands run from `apps/api`:

```sh
bun run db:push
bun run seed
bun run db:studio
```

Web API client generation runs from `apps/web` with the API OpenAPI endpoint available:

```sh
bun run generate:api
```

**OpenAPI generation:** use a real Node.js runtime for the API. Bun’s Node compatibility runtime can load duplicate DTO constructors and omit their generated Swagger properties. The root `bun run dev` API may therefore expose incomplete DTO schemas even though `nest build` emits metadata. After building, start the production API from `apps/api` with `NODE_PATH=./node_modules` and `TS_NODE_PROJECT=./tsconfig.runtime.json`, then run `node -r tsconfig-paths/register dist/src/main`. `bun run generate:api` checks the live contract for paths and required DTO properties before Orval runs; if validation fails, generated files are left unchanged. Review the generated diff and run the web typecheck after generation.

For local password-recovery testing, omit SMTP settings, submit the forgot-password form for a seeded account, and open the newest `.eml` file under `apps/api/.local-mailbox` (or the configured `LOCAL_MAILBOX_PATH`). With an SMTP provider, configure `SMTP_HOST` and `SMTP_FROM`; configure `SMTP_USER` and `SMTP_PASSWORD` together when authentication is required.

For local client-registration testing, run `bun run seed` from `apps/api`, then register at `/signup` with customer code `LOCAL-REG-TEST` and ICE `000000000000000`. These belong to a synthetic development-only customer and are not real business identifiers. The request appears in Dashboard → Users; open it to approve or reject the account. This checks a match against the local customer record, not an external registry.

## Naming and language

- Use **ECommand** in human-facing product text. The hyphenated French spelling is not used in UI or documentation.
- Keep user-facing interface text and maintained documentation in English.
- Keep technical identifiers stable: package names/import scopes such as `@ecommand/shared`, workspace names such as `ecommand-api`, and database identifiers are lowercase `ecommand` for consistency with the existing repository.
- Use kebab-case file names, PascalCase classes/types/components, camelCase functions/variables/properties, and UPPER_SNAKE_CASE enum members.
- Keep database column naming consistent with the existing Drizzle schema (camelCase TypeScript properties mapped to snake_case SQL columns).
- Some French strings in `LEGACY_UNITS` are persisted legacy database values used only to deactivate old reference rows. They are compatibility identifiers, not user-facing copy; changing them can break cleanup of existing data.

## Code conventions

- Follow strict TypeScript and the repo's Biome settings (tabs, double quotes, organized imports).
- Keep NestJS code feature-oriented: controller for HTTP, DTO for input/output shape, service for business rules, query for database operations.
- Validate request DTOs with `class-validator` and the global validation pipe.
- Use Passport strategies and existing permission/ownership decorators or guards. Do not add a second authentication mechanism.
- Use `@nestjs/config` for API environment settings. Never hardcode secrets or provider credentials.
- Use Drizzle schema relations for related data. Change schemas deliberately and keep relation definitions in sync.
- Treat files marked “generated by Orval” as generated output. Edit API DTOs/OpenAPI annotations, then regenerate the web client.
- Reuse existing UI components and query/mutation hooks. Keep API errors and validation feedback visible in forms.
- Prefer small, reviewable changes that complete a whole user flow over broad refactors.

## Web forms and interaction

- Use `FormFieldHeader` from `apps/web/src/components/common/form-field-header.tsx` for labels that show required and inline error states. Normalize field errors with `getFormErrorMessage` from `apps/web/src/lib/form-utils.ts` instead of adding another local copy.
- Keep short forms on one page. When a create flow has distinct groups of information, split it into guided steps with a clear current-step indicator, a way to go back without losing entered values, and validation before advancing or submitting.
- Validate each step's required fields when the user advances; keep full-form validation on final submission. Optional fields should not block progress.
- Use semantic buttons and announce validation feedback to assistive technology. Keep transitions subtle and respect `prefers-reduced-motion` through the shared styles.
- Preserve permission-specific defaults and fields when splitting a form. A step must not expose fields the current user cannot manage.
- Prefer shared components for repeated behavior, but keep step-specific business rules in the feature form. Do not turn unrelated forms into one highly configurable generic form.

Keep apps/web/src/components/ui focused on primitives used by current screens. Add a primitive from the configured shadcn registry when a feature needs it instead of keeping the full unused catalog checked in.

## Web layout and visual system

Follow the detailed [web design system](../interface/system.md) for page structure, type hierarchy, target sizes, responsive behavior, sidebar states, and notification interactions. The current theme values are the source of truth; do not change them as part of layout work.

- Treat apps/web/src/app/globals.css as the source of truth for semantic color, radius, and motion tokens. Use role-based classes such as bg-background, bg-card, text-muted-foreground, and border-border; avoid one-off palette colors in feature components.
- The orange accent is ONCF-inspired. Official material confirms the orange logo, but this repository has not verified an official complete digital palette or exact color values. Do not present custom shades as official ONCF values.
- Keep light and dark variants low in chroma. Check foreground, muted text, borders, focus rings, selected states, and charts in both modes when changing a theme token.
- Build layouts mobile first. Page titles should be visibly stronger than descriptions; labels should be quieter than values. Let long values wrap and controls wrap or stack instead of overflowing.
- Use spacing utility suffixes on the 0, 4, 8, 12, 16... scale for padding, gaps, and other spacing. Prefer container padding and grid/flex gaps over individual margins. Avoid arbitrary numeric CSS values; add or reuse a named theme token when the design needs a value outside the spacing scale.
- Keep animation brief and optional. Use shared motion styles and respect prefers-reduced-motion.

Older components may still use legacy spacing values; update them as part of a screen-level layout change rather than mass-replacing classes without checking the resulting density and responsive behavior.
## Database workflow

The current database model needs design review and is expected to change. **Do not add migration files or select a migration framework yet:** recording the current model as migration history would make it harder to replace the weak or mismatched parts cleanly. First agree on the domain entities, ownership and lifecycle rules, constraints, and reference data; then stabilize the Drizzle schema and choose a migration approach before introducing data that must be preserved.

For disposable local development only, Drizzle `db:push` can synchronize the current schema while it is being redesigned. Review its proposed changes and use a resettable database. Never use it against production or valuable data. Keep seed/reference data changes aligned with the current schema.

## Commit conventions

- One logical change per commit; split unrelated features, fixes, docs, and dependency changes.
- Follow the existing commit history with app/domain scopes: `feat(web/orders): add order filters`, `fix(api/auth): reject expired reset links`, `refactor(api/drizzle): revise schema relations`, and `fix(shared/auth): update permissions`. Use an app-only scope when several features are involved; omit the scope for repository-wide work, for example `docs: explain local setup`.
- Use imperative, lowercase subjects without a trailing period.
- Use the established types `feat`, `fix`, `refactor`, `chore`, `docs`, and `test`. For focused tests, scope to the area under test, such as `test(api/orders): cover order workflow`; use `test(api)` when a change spans several API features.
- Do not commit environment secrets, local mail messages, uploaded files, or database files.

## Verification

- Before an important commit, run `bun run verify:commit`. It runs repository formatting/linting, workspace typechecks, all API and web tests, and production builds; it stops at the first failure.
- The web production build uses the runtime configured by the app's Next.js build script. Run it separately from `next dev` if the local Next.js version shares build output between those processes.
- To have Git run the same gate automatically before each commit, set the repository hook path once with `git config core.hooksPath .githooks`.
- Run `bun run typecheck` after TypeScript changes.
- Run the relevant API tests for changed business behavior when tests exist and verification is requested/needed.
- Run `bun run build` to verify production compilation when a broad UI/API change warrants it.
- Report exactly which commands passed and which checks were not run. Do not imply that a successful typecheck proves runtime integrations work.
