# Authorization matrix

This guide maps default roles to API permissions, ownership rules, and web surfaces. The source of truth is packages/shared/src/auth/permissions.ts and packages/shared/src/auth/roles.ts. Keep this guide and the authorization tests aligned with those files.

## Role summary

| Capability | Admin | Commercial agent | Client representative |
| --- | :---: | :---: | :---: |
| User administration | All user actions | — | — |
| Orders | All actions and records | Operational actions and cross-user records | Create/read/update/delete own orders; submit; read programs |
| Programs | All actions and records | Create/read/update; status, ownership, and lifecycle actions | Read only |
| Claims | All actions and records | Create/read/update; status and lifecycle actions | Create/read own claims |
| Customers | All actions | Read/update | — |
| Catalog | Read and manage | Read | Read |
| Tracking | Read and update | Read | — |
| Reports | Read and export | Read | Read |
| Profile | Update | Update | Update |

Admin receives every defined permission. Parent permissions imply descendants (for example, claims:action grants each claim lifecycle action). A dash means the default role has no grant. Custom database grants may change runtime access, so use effective permissions when checking actual access.

## API and web mapping

| Resource / action | API permission | Web surface | Additional scope |
| --- | --- | --- | --- |
| Orders list/detail | orders:read | Sidebar Orders; order list/detail | ID routes use OrderOwnershipGuard; manage-other bypasses the owner check. |
| Orders create/edit/delete | orders:create/update/delete | Create form; order action menu | The API and web both restrict deletion to draft orders. |
| Order lifecycle | orders:action:* | OrderActions | API state transitions are authoritative. |
| Programs list/detail | programs:read | Sidebar Programs; list/detail | ID routes use ProgramOwnershipGuard; manage-other bypasses the owner check. |
| Programs create/edit/delete | programs:create/update/delete | Create form; program action menu | The API and web both restrict deletion to draft programs. |
| Program lifecycle | programs:action:* | ProgramActions | Valid path: draft → pending approval → approved → confirmed → sent to DTM → in progress. Cancellation is allowed before dispatch. |
| Claims list/detail/comments | claims:read | Sidebar Claims; details and comments | ID routes use ClaimOwnershipGuard; list filters are constrained for users without manage-other. |
| Claims create/edit/delete | claims:create/update/delete | Create form; claim action menu | Delete is admin-only by default. |
| Claim lifecycle | claims:action:* | ClaimActions | Buttons use specific action permissions and supported current states. |
| Customers | customers:read/create/update/delete | Sidebar Customers; forms and action menu | Commercial agents read/update; create/deactivate are admin-only. |
| Users | users:read/create/update/delete | Sidebar Users; forms and action menu | Admin-only by default. |
| Catalog | catalog:read/manage:* | Order and claim selectors; catalog API | Admin manages catalog; both operational roles read it. |
| Tracking | tracking:read/update | Tracking API surfaces | Commercial agents read; admin reads and updates. |
| Reports | reports:read; reports:action:export | Sidebar Reports and order report | All default roles can view reports; only roles with reports:action:export see the browser print / save PDF control. The report API endpoint remains read-only. |
| Profile and notifications | profile:update; authenticated ownership routes | Settings/profile and notifications | Notifications are scoped to the authenticated user. |

## Enforcement notes

- Sidebar filtering and action visibility shape the interface; API guards, permission metadata, service scoping, and ownership guards enforce access.
- Role names alone do not authorize a request. Use the authenticated user’s effective permission set.
- An ID route may apply both permission and ownership checks; review both.
- Changes to role grants, controller decorators, ownership logic, transition maps, or action buttons require corresponding matrix and test updates.

## Verification coverage

- apps/api/src/auth/guards/permissions.guard.spec.ts covers missing-user denial, any/all semantics, mixed metadata, and inherited permissions.
- apps/api/src/auth/roles-permissions.spec.ts checks admin, commercial-agent, and client-representative grant boundaries.
- apps/api/src/workflow-transitions.spec.ts locks down order, program, and claim transition graphs.
- Controller authorization specs for catalog, claims, orders, profile, tracking, and users verify route permission metadata and service arguments; ownership-sensitive routes assert their ownership guard.
- Claim mapper/service specs check customer-scope enforcement on create/list. Order query specs verify creator-only list and eligible-order scope unless `orders:manage-other` is granted. Program query specs verify creator isolation and manager filters; order and program service specs check draft-only deletion.
- `apps/api/src/common/utils/route-id-pipes.spec.ts` verifies strict parsing for claim, customer, notification, program, and user route IDs; tracking pipes have equivalent coverage.
- These unit tests do not replace endpoint integration tests for database queries and full guard execution. Add integration coverage when changing those boundaries.
