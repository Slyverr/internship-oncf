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

The default `bun run dev` watches both API and web source and keeps the web TypeScript watcher running alongside Next.js, so type errors appear during development. These watchers use substantial memory. For a lighter session, run `bun run dev:light`: Next.js still hot-reloads, but the API compiles and starts once without NestJS watch mode. Both commands wait up to 60 seconds for the API `/health` endpoint before starting Next.js, so the web app does not open into avoidable backend-fetch errors during initial startup. The health check uses `BACKEND_API_URL` from `apps/web/.env` (default `http://localhost:8000`). If the API stops after Next.js has started, transient requests retry and the open web app checks API health every five seconds while an API failure remains; failed active requests are retried automatically after the API returns. Opening a protected route during an outage preserves the session and shows a temporary error with a retry action instead of treating the user as signed out. Restart the command after API source edits in light mode. Run `bun run typecheck` for a one-time check, or start `bun run --filter ecommand-web typecheck:watch` separately when continuous web type feedback is useful.

**Known Next.js development-only issue:** with the current Next.js/React versions, an aborted Server Component render can make React's development performance tracker call `Performance.measure()` with a negative end time. The browser may show a red Next.js “Issue” badge and a `flushComponentPerformance` stack even though the route finishes rendering and its application requests succeed. This matches [React issue #37561](https://github.com/facebook/react/issues/37561); its [proposed fix](https://github.com/facebook/react/pull/37572) is still upstream work. Check the stack and failed network requests separately from this tracker error. Do not hide the dev overlay or patch the global Performance API to work around it. The repository's production build passes, but that is not a separate production-runtime test.

For a repeatable responsive screenshot pass, start `bun run dev` and open the app in a Chrome session with the DevTools endpoint enabled at `http://localhost:9235`. Then run:

```sh
bun run ui:review -- --url /dashboard/orders --label orders
bun run ui:review -- --url /login --fresh-context --label login
```

The Bun script captures 320, 375, 390, 640, 768, 1024, 1440, 1920, 2560, and 3840px viewports into `/tmp/ecommand-ui-review`, reports document overflow and the route actually rendered, and restores the browser's original route afterward. Protected routes use the current authenticated browser session. Public auth routes should use `--fresh-context` to avoid the signed-in session redirecting away; that option creates and closes an isolated temporary browser profile. `--then-url '<url>'` navigates after the supplied fill/click actions, which supports capturing a protected route after a successful login in the isolated profile. Use `--click-after-url '<selector>'` or `--click-text-after-url '<text>'` to exercise a safe UI state after that navigation, such as selecting a tab or category. For route-intercepted dialogs that intentionally change the URL, set `--expect-route '<path>'` to the final route so the route assertion checks the dialog state rather than the underlying page. The tool adds no dependency. Use `--click '<selector>'` for visible controls, `--fill '<selector>=<value>'` for temporary form state, and `--wait-for '<selector>'` for the resulting state. Because clicks are real UI actions, use only known safe actions such as login or a reviewed client-side step transition; do not click a consequential final submit or confirmation action. `--help` lists all options. These captures are evidence for visual review, not pixel-diff tests; inspect the images and exercise stateful workflows separately.

When Chrome has multiple signed-in tabs (for example, one tab per role), use `--target-id '<id>'` to choose the intended tab instead of whichever matching route Chrome lists first. Get the current IDs from `http://localhost:9235/json/list`; the capture manifest still confirms the final URL, route, and viewport for each image.

For faster responsive sweeps, add `--reuse-page`. It loads the route once, resizes the same page for later captures, and runs click/fill actions only on the first viewport. Without this option, each viewport still gets a fresh route load and its actions run independently. The script waits for paint after resizing and applies `--settle-ms` only once per navigation rather than twice.

## Isolated E2E workflows

Run the isolated API and browser journey suites from the repository root with:
- bun scripts/run-api-e2e.ts
- bun scripts/run-api-e2e.ts --browser

The browser option runs the API suite first, resets and reseeds the disposable `ecommand_e2e` database, then runs browser workflows through the Chrome CDP endpoint configured by `PLAYWRIGHT_CDP_ENDPOINT`. The reset helper checks the exact database name and refuses to reset another database. The runner starts both the API and Next.js browser-test server with the configured real Node.js runtime; this avoids the Next development Server Action mismatch observed when the isolated web server was launched through Bun. These flows cover role grants, reference-data lifecycle, order submission, claim/program creation, report export, and registration review through the Dashboard pending-registration link. The runner tears down its Compose services when complete. The standalone browser workflow runner defaults to `http://localhost:3100`; set `PLAYWRIGHT_BASE_URL` to review another running web app without changing the test flows.

Set `E2E_BROWSER_WORKFLOWS` to a comma-separated list of workflow names from `apps/web/e2e/run-cdp.ts` to run a focused subset. The browser report-export journey verifies that the CSV download starts with the expected filename; CSV content and spreadsheet-safety rules are covered by `apps/web/test/report-export.test.ts` because a remote Chromium download's temporary path may not be available to the Node container.

If Node 24 is not installed on the host but Podman is available, use the checked-in wrapper as the runtime: `ECOMMAND_E2E_NODE="$PWD/scripts/node-in-container.sh" bun scripts/run-api-e2e.ts`. It runs each Node command in the official Node 24 Alpine image, mounts the repository read/write, and forwards only the E2E settings needed by the Node process. It downloads the image on first use. Set `ECOMMAND_NODE_IMAGE` to use a mirror or another compatible Node 24 image.

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

**OpenAPI generation:** use a real Node.js runtime for the API. Bun’s Node compatibility runtime can load duplicate DTO constructors and omit their generated Swagger properties. The root `bun run dev` API may therefore expose incomplete DTO schemas even though `nest build` emits metadata. After building, start the API from `apps/api` with a real Node runtime and `NODE_PATH=./node_modules`, then run `node -r tsconfig-paths/register dist/src/main`. `bun run generate:api` checks the live contract for paths and required DTO properties before Orval runs; if validation fails, generated files are left unchanged. Review the generated diff and run the web typecheck after generation. The Node container wrapper can also run a Nest CLI/API command when invoked from the API directory, for example `scripts/node-in-container.sh /repo/node_modules/@nestjs/cli/bin/nest.js start`; set `NESTJS_PORT` in the host environment to choose the port.

For local password-recovery testing, omit SMTP settings, submit the forgot-password form for a seeded account, and open the newest `.eml` file under `apps/api/.local-mailbox` (or the configured `LOCAL_MAILBOX_PATH`). With an SMTP provider, configure `SMTP_HOST` and `SMTP_FROM`; configure `SMTP_USER` and `SMTP_PASSWORD` together when authentication is required.

For local client-registration testing, run `bun run seed` from `apps/api`, then register at `/signup` with customer code `LOCAL-REG-TEST` and ICE `000000000000000`. These belong to a synthetic development-only customer and are not real business identifiers. The request appears in Dashboard → Users; open it to approve or reject the account. This checks a match against the local customer record, not an external registry.

## Naming and language

- Use **ECommand** in human-facing product text. The hyphenated French spelling is not used in UI or documentation.
- Keep user-facing interface text and maintained documentation in English.
- Keep technical identifiers stable: package names/import scopes such as `@ecommand/shared`, workspace names such as `ecommand-api`, and database identifiers are lowercase `ecommand` for consistency with the existing repository.
- Use kebab-case file names, PascalCase classes/types/components, camelCase functions/variables/properties, and UPPER_SNAKE_CASE enum members.
- Keep database column naming consistent with the existing Drizzle schema (camelCase TypeScript properties mapped to snake_case SQL columns).
- Some French strings in `LEGACY_UNITS` are persisted legacy database values used only to deactivate old reference rows. They are compatibility identifiers, not user-facing copy; changing them can break cleanup of existing data.

## Localization

The web app currently ships English only. Keep every human-facing string in `apps/web/src/i18n/messages/en.ts`; reference it through the stable `Messages` tree in `apps/web/src/i18n/message-keys.ts` and `translate(Messages.section.message)`. The i18n test requires a one-to-one match between English catalog entries and stable message references. Do not add user-facing literals to components for labels, errors, empty states, or accessibility text.

API responses carry stable codes, not user-facing prose. Add domain error and response codes to `packages/shared/src/api-errors.ts`, return those codes from NestJS, and map each code to a `Messages.apiError…` or `Messages.apiResponse…` key in `apps/web/src/i18n/index.ts`. Validation details carry field paths and validator rule codes; keep the UI wording in the message catalog. Never display a server-supplied message directly.

When adding French, add a structurally complete catalog beside `en.ts`, add its locale to `SUPPORTED_LOCALES` and the locale catalog map, and provide any locale-specific date-fns locale in `date-utils.ts`. Keep the message-key tree derived from the canonical English catalog so keys remain stable, and run `bun run test` and `bun run typecheck` in `apps/web`. Add the language selection and persistence as a separate user-facing feature when a second complete catalog is ready; do not expose an incomplete locale.

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

- Before an important commit, run `bun run verify:commit`. It runs repository formatting/linting, workspace typechecks, all API and web tests, and production builds; it stops at the first failure. The verification build writes to `apps/web/.next-verify`, so it can run while `next dev` is open without replacing its `.next` artifacts or invalidating Server Action IDs.
- The regular `bun run build` command keeps using `.next` for normal production builds. The verification runner isolates only its build step through `NEXT_BUILD_DIST_DIR`.
- To have Git run the same gate automatically before each commit, set the repository hook path once with `git config core.hooksPath .githooks`.
- Run `bun run typecheck` after TypeScript changes.
- Run the relevant API tests for changed business behavior when tests exist and verification is requested/needed.
- Root `bun run test` uses Turborepo dependency builds. When running an app's tests directly after changing `packages/shared`, rebuild the package first with `bun run --filter @ecommand/shared build`; direct API/web test commands resolve the workspace package from its `dist` output.
- Run `bun run build` to verify production compilation when a broad UI/API change warrants it.
- Report exactly which commands passed and which checks were not run. Do not imply that a successful typecheck proves runtime integrations work.
