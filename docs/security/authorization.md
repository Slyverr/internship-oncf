# Authorization matrix

This guide maps default permission bundles to API permissions, ownership rules, and web surfaces. The source of truth is packages/shared/src/auth/permissions.ts and packages/shared/src/auth/roles.ts. Keep this guide and the authorization tests aligned with those files.

## Authorization model

ECommand uses a hybrid of permission checks and resource relationships:

- **Permission checks** answer whether a user may attempt an operation, such as `claims:read` or `claims:action:resolve`.
- **Resource scope** answers which records the user may access. ECommand derives this from ownership and customer relationships (`user_customers`, `users.customer_id`, and the record's customer/order links).
- **Workflow rules** answer whether the operation is valid now. A permission to resolve a claim does not bypass the claim's current status or required data.

The authenticated request receives an effective permission set. Guards and services check that set, never a role name. Default role records currently bundle permissions, so role-to-permission assignment is still an RBAC-style way to provision grants; the important boundary is that application authorization checks permissions, not `Role.ADMIN` or `Role.AGENT_COMMERCIAL`. A user's persona may still drive domain-specific onboarding or assignment behavior, but it must not silently grant access.

This is deliberately smaller than a general policy engine. In common terminology it combines permission-based checks, RBAC-style permission bundles, and ABAC/ReBAC-style scope checks: attributes such as creator, customer, portfolio, and workflow state plus relationships such as user-to-customer and claim-to-order determine the record-level decision. This matches the relational data ECommand already has. OWASP recommends deny-by-default and validating authorization on every request; NIST's ABAC model evaluates subject, object, action, and environment attributes. If policies later become too complex to keep consistent across modules, centralize the decision logic behind a policy service before considering an external engine such as OPA or a Zanzibar-style relationship service.

### What the current vocabulary means

| Permission form | Intended purpose | Guardrail |
| --- | --- | --- |
| `module:create/read/update/delete` | Base operation on a resource | Still apply record scope and lifecycle rules. |
| `module:manage:other` | Extend a base operation to records outside the user's own ownership | Treat as a scope modifier, never as a substitute for `read`, `update`, or a specific action. Keep customer portfolio boundaries explicit. |
| `module:manage:<target>` | Change a named field or management concern, such as status or ownership | Prefer a concrete target (`manage:status`) over a vague universal `manage` grant. |
| `module:action:<action>` | Perform a named business action such as submit, resolve, or export | Check the matching API endpoint and current workflow state; use parent action grants only when intentionally granting every descendant action. |

Permission inheritance is convenient, but every parent is a broad grant. In particular, `claims:action` includes comment and every claim transition, and `catalog:manage` includes each catalog management target. Assign a parent only when that full breadth is intended. Keep unrelated scope permissions (for example, `claims:manage:other`) outside the resource/action inheritance tree.

### Compared with other common approaches

| Approach | Strength | Limitation for ECommand |
| --- | --- | --- |
| Role-only checks | Easy to understand for a few fixed personas | Couples access to role names, makes exceptions/custom bundles awkward, and is the direct pattern the codebase should avoid. |
| RBAC | Permission bundles make routine access administration simple | Role membership alone does not express customer portfolios, ownership, or workflow state. ECommand may use bundles to provision permissions without checking role names in feature logic. |
| ABAC | Expresses decisions from user, record, action, and context attributes | A generic rules language adds complexity and can make policies harder to review; ECommand should keep explicit typed checks until the rules justify more. |
| Relationship-based access (ReBAC) | Models relationships such as user-to-customer and claim-to-order directly | A dedicated relationship engine is unnecessary for the current product size; Drizzle relations and scoped queries already model these links. |

Custom permission profiles are anchored to either the Commercial Agent or Client Representative operational persona. The three seeded roles are marked as system roles and their default grants cannot be edited. Administrators with the `roles:manage` permission can create, edit, archive, and restore custom profiles from `/dashboard/roles`; the API returns permission definitions with an `assignable` flag and rejects reserved user/access-management grants. User creation and editing assign a profile by `roleId`. The authenticated user receives that profile's effective permissions, while its persona only drives workflow behavior such as customer assignment and registration rules. Archiving is rejected while any user is still assigned to the profile. Keep authorization checks on effective permissions, and continue verifying privilege-escalation and administrator lockout paths as the permission catalog changes.

References: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [NIST SP 800-162 (ABAC)](https://csrc.nist.gov/pubs/sp/800/162/upd2/final), [NIST RBAC FAQ](https://csrc.nist.gov/Projects/role-based-access-control/faqs), and the [USENIX Zanzibar paper](https://www.usenix.org/conference/atc19/presentation/pang).

## Role summary

| Capability | Admin | Commercial agent | Client representative |
| --- | :---: | :---: | :---: |
| User administration and registration review | Create/read/update/deactivate accounts | — | — |
| Roles and permissions | Manage role/access definitions | — | — |
| Reference data | Read, add, rename, archive, and restore catalog values | Read | Read |
| Orders | — | Operational actions for assigned-customer records | Create/read/update/delete drafts and submit; reads use the assigned customer when present, otherwise own-created records |
| Programs | — | Create/read/update; status, ownership, and lifecycle actions | Read programs linked to orders for the assigned customer; no create/update/delete/workflow actions |
| Claims | — | Create/read/update assigned-customer claims; status and lifecycle actions, including comments | Create/read/comment on own claims and close own resolved claims |
| Customers | Select active portfolio choices in user forms | Read/update | — |
| Catalog | Read | Read | Read |
| Tracking | — | Read | — |
| Reports | Read and export across all portfolios (`reports:manage:other`) | Read and export across the assigned-customer portfolio | Read and export orders for the assigned customer when present, otherwise own-created orders |
| Profile | Update | Update | Update |

The administrator grant follows the SDF role boundary: manage accounts and access rights, consult reports, and manage reference data. Admin has no `customers:read` grant. The user-management form gets a minimal list of active customer IDs, names, and codes from `GET /customers/portfolio-options`, guarded by `users:create` or `users:update`; this does not expose customer records or expand order, program, claim, or report scope. Admin has no customer update permission. Full report scope is controlled by `reports:manage:other`, never by the role name. The `roles:manage` permission gates profile administration; permission definitions remain read-only and reserved grants cannot be assigned to custom profiles. Parent permissions imply descendants (for example, claims:action grants each claim lifecycle action). A dash means the default role has no grant. Custom database grants may change runtime access, so use effective permissions when checking actual access. Reference seeding removes stale extra grants from the default administrator role.

## API and web mapping

| Resource / action | API permission | Web surface | Additional scope |
| --- | --- | --- | --- |
| Orders list/detail/files | orders:read | Sidebar Orders; order list/detail and attachments | Commercial agents are limited to their `user_customers` portfolio even with manage-other. Client representatives use their linked customer; unscoped users fall back to creator-only unless their effective permissions explicitly allow broader access. |
| Orders create/edit/delete | orders:create/update/delete | Dashboard quick action; create form; order action menu | The dashboard action is permission-filtered; the API and web both restrict deletion to draft orders. |
| Order lifecycle | orders:action:* | OrderActions | UI and API share the same transition graph. Cancellation is available from draft, submitted, and in-progress orders; approval, rejection, and dispatch remain state-gated. |
| Programs list/detail | programs:read | Sidebar Programs; list/detail | Commercial agents follow their `user_customers` portfolio through the linked order. Client representatives follow their assigned customer; unscoped users fall back to creator scope unless their effective permissions allow broader access. |
| Programs create/edit/delete | programs:create/update/delete | Create form; program action menu | The API and web both restrict deletion to draft programs. |
| Program lifecycle | programs:action:* | ProgramActions | Valid path: draft → pending approval → approved → confirmed → sent to DTM → in progress. Cancellation is allowed before dispatch. |
| Claims list/detail/comments | claims:read; claims:action:comment; claims:manage:other; customers:manage:other | Sidebar Claims; details, comment list, and permission-gated comment form | `claims:manage:other` allows claims owned by other users; explicit customer assignments remain the scope boundary. `customers:manage:other` grants cross-customer scope when there is no assigned portfolio. |
| Claims create/edit/delete | claims:create/update/delete | Dashboard quick action; create form; claim action menu | Clients and commercial agents can submit claims. Client ownership still limits which existing claims they can access. Delete is not granted to any default role. |
| Claim lifecycle | claims:action:* | ClaimActions | Buttons use specific action permissions and supported current states. Reject is available from `NEW`, `IN_PROGRESS`, and `IN_TREATMENT`; clients can close their own resolved claims. Parent `claims:action` also grants commenting. |
| Customer portfolio choices | users:create or users:update | Commercial-agent portfolio fields in user create/edit forms | Returns only active customer ID, name, and code. Does not grant customer record reads. Commercial agents read/update customer records within their portfolio; default roles cannot create or deactivate customers. |
| Public client signup | Public `/auth/register` | `/signup` registration form | Submitted customer code and ICE must match an active local customer; new account is inactive and pending admin review. |
| Users and registration review | users:read/create/update/delete | Sidebar Users; forms, request status, approve/reject actions | Admin-only by default. Only pending client-representative requests can be reviewed; pending and rejected accounts cannot sign in. Users can filter by any built-in or custom access profile, and the selected profile remains in query-string state. |
| Catalog | catalog:read/manage:* | Admin: `/dashboard/catalog`; order and claim selectors; catalog API | Admin receives separate `catalog:read` and `catalog:manage` grants; manage inherits catalog-specific grants. The admin screen uses a responsive left-side category rail and supports add, rename, archive, and restore. Archiving a goods type is blocked while it has active goods; new or restored goods must reference an active type. Seeded catalog rows remain stable while admin-managed names and active states are preserved across reference seeding. Agents and clients receive catalog read only. |
| Tracking | tracking:read/update | Tracking API surfaces | Commercial agents read; no default role has tracking permissions. |
| Reports | reports:read; reports:manage:other; reports:action:export | Sidebar Reports and order report | `reports:manage:other` controls full data scope; export permission controls CSV export. Browser print/save PDF uses the data returned by the API. |
| Profile and notifications | profile:update; authenticated ownership routes | Settings/profile and notifications | Notifications are scoped to the authenticated user. |

## Enforcement notes

- Sidebar filtering and action visibility shape the interface; API guards, permission metadata, service scoping, and ownership guards enforce access.
- Role names never authorize a request. API guards and service-level access checks use the authenticated user’s effective permission set. Role/persona values may identify workflow or ownership data, but do not grant a capability.
- `users.customer_id` anchors client representatives to one company. Commercial-agent portfolios use the existing `user_customers` many-to-many relation; the development fixture assigns the seeded agent to `CLI009` and `CLI010`.
- An ID route may apply both permission and ownership checks; review both. Ownership guards let missing records reach the route service so callers receive its normal not-found response instead of a 500.
- Customer scope comes from `users.customer_id` or explicit `user_customers` assignments, not from role names. `customers:manage:other` grants cross-customer scope when there is no assigned portfolio; a non-empty assigned portfolio remains the boundary. Orders compare that scope with `orders.customer_id`; program reads follow `forecast_programs.order_id -> orders.customer_id`. Claims remain creator-scoped unless `claims:manage:other` is granted, and explicit customer assignments still constrain them.
- Changes to role grants, controller decorators, ownership logic, transition maps, or action buttons require corresponding matrix and test updates.

## Verification coverage

- apps/api/src/auth/guards/permissions.guard.spec.ts covers missing-user denial, any/all semantics, mixed metadata, and inherited permissions. `ownership.factory.spec.ts` covers owner access, denial, manager bypass, missing-resource pass-through, and routes without a guarded ID.
- apps/api/src/auth/roles-permissions.spec.ts checks admin, commercial-agent, and client-representative grant boundaries.
- apps/api/src/workflow-transitions.spec.ts locks down order, program, and claim transition graphs.
- Controller authorization specs for catalog, claims, notifications, orders, profile, tracking, and users verify route permission metadata or authenticated-user scoping; ownership-sensitive routes assert their ownership guard.
- Claim mapper/service/query/ownership specs check portfolio enforcement on create, update, list filters, and ID routes. Order query/access specs cover creator-only, assigned-customer, denied-customer, and manager scopes for lists, eligible orders, and ID routes. Program query/access specs cover creator, assigned-customer, and manager scope; notification query specs verify recipient scoping for lists, counts, and read updates. Order and program service specs check draft-only deletion.
- User service specs require customer assignment for client representatives; report service specs cover creator and assigned-customer scope; `apps/web/test/action-visibility.test.ts` covers frontend menu, program-delete, and order-to-program visibility rules. `apps/web/test/user-filters.test.ts` and the custom-profile browser journey cover custom profile selection and filtering.
- `apps/api/src/common/utils/route-id-pipes.spec.ts` verifies strict parsing for claim, customer, notification, program, and user route IDs; tracking pipes have equivalent coverage.
- These unit tests do not replace endpoint integration tests for database queries and full guard execution. Add integration coverage when changing those boundaries.
