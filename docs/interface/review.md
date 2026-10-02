# UI/UX review and work list

## Mobile dashboard insight spacing — 2026-10-02

- A fresh Admin/Agent/Client report capture exposed an oversized empty strip under the Agent's eligible-order card on phones. The order-activity chart was the offscreen second slide and set the horizontal flex rail's height.
- Replaced the mobile insight carousel with a vertical stack. The eligible-order card now stays at its natural height and is followed by the activity chart; the two cards return to a balanced two-column layout from `@4xl/workspace` upward. Removed the carousel-only scroll cue and its now-unused message entry. Updated the shared rule in `system.md` to document the observed behavior.
- Inspected fresh Agent dashboard captures at 320×568, 390×844, 768×1024, and 1920×1080. The mobile cards stack without the blank band; the wide layouts remain balanced; all captures report no horizontal overflow. Images: `/tmp/ecommand-final-pass/dashboard-agent-stacked-*`.
- Refreshed the Agent dashboard report images at 390×844 and 1920×1080 in `/tmp/ecommand-report-final-20261002`; the full report selection now contains six distinct pages with desktop/phone pairs.
- `bun run verify` passed after the layout and message-catalog changes: Biome, workspace typechecks, 69 API suites / 527 tests, web checks, and all builds.

## User detail row alignment — 2026-10-02

- A screenshot review caught the role badge floating beside the label in the User detail “Role and access” card. The role row used a two-column grid whose second column was left-aligned, while all subsequent detail values were right-aligned. It now uses the shared label/value flex alignment and constrains long role names to the value side.
- Reopened the actual pending user from the Admin dashboard (`/dashboard/users/6`; the displayed `7` is its Customer ID) and captured current screenshots at 390×844 and 1920×1080. Inspected both images: the role badge shares the right value edge with Account type, IDs, active state, and registration status. Both captures report no horizontal overflow. Files: `/tmp/ecommand-final-ui-review/user-detail-role-alignment-390x844.png` and `/tmp/ecommand-final-ui-review/user-detail-role-alignment-1920x1080.png`.
- The first recapture attempt used a guessed nonexistent user ID and showed the route error boundary; those invalid images were discarded. This is now covered by the required screenshot evidence checks: verify the role and real route/record from the browser/manifest, inspect the rendered pixels, then recheck after the fix.

## Admin user portfolio creation — 2026-10-02

- The Admin New User flow exposed a real `403 ACCESS_DENIED` on `GET /customers`: Admin could create agent accounts and the form asked for customer portfolio assignments, but its default grants omitted customer read access. Granting `customers:manage:other` would also widen order/program/claim scope through the shared customer-scope policy, so that broad permission was rejected.
- Added `customers:action:assign-portfolio`, an explicit action permission, alongside `customers:read` in the default Admin grants. Only the customer-list scope recognizes this action; it does not alter the shared scope used for orders, programs, claims, or reports. Admin still cannot update customer records. Updated the permission matrix and API E2E regression to assert Admin gets the customer choices but receives 403 on customer updates.
- Ran `bun run seed:ref` against the approved disposable `ecommand_preview` DB. The live Admin list API now returns 7 customer choices. The user form was taken through its Credentials step into Profile without submitting; fresh 390×844 and 1920×1080 screenshots show real portfolio choices and no error state or horizontal overflow. Files: `/tmp/ecommand-report-screens/admin-user-create-390x844.png` and `/tmp/ecommand-report-screens/admin-user-create-1920x1080.png`.
- Curated report screenshots also include the Agent Orders and Client Claims pages at the same two viewport sizes. Each image is one page; the report bundle contains only these six PNGs.

> **Screenshot freshness:** The source-only observations from earlier passes are historical. The review evidence below includes fresh captures from the running application on 2026-09-27; use those captures and the follow-up checks recorded in the checklist rather than the older bundle when reviewing current UI.

## Settings follow-up — 2026-09-28

- Freshly inspected the Settings modal at 390×844 and 1440×1000 in warm light and charcoal dark. The repeated generic description under the dialog title used vertical space without adding context, so the title strip now contains only “Settings” and the close control; section descriptions remain with their content.
- Profile and Security fields were transparent in light mode and blended into the dialog surface. The shared input now uses the semantic background surface; dark mode retains its existing input token. The Appearance option group spacing is 16px from legend to selector.
- The phone section tabs fit without clipping, and the desktop section rail is readable. The fixed 1120×768 desktop / viewport-bounded phone footprint is preserved. Monochrome, keyboard/focus, and field error states remain open review items.

## Auth phone alignment — 2026-09-28

- A new login capture pass at 320×568, 360×740, and 390×844 showed that centering the shared auth shell created a 203px empty band above the brand on the 390px phone. Auth content now starts near the top on phone widths and returns to centered positioning from `sm`; large-screen positioning is unchanged. Verify both login and signup at these phone widths after the update.

## Table density follow-up — 2026-09-28

- Re-captured Orders, Claims, Programs, Customers, and Users at phone, tablet, laptop, 2K, and 4K widths. Horizontal overflow stays inside the table region on phone widths, with no page overflow; the table and workspace remain aligned to the 1536px content cap on 2K/4K screens.
- Linked table cells were producing 61px rows from a 44px target plus 8px vertical inset on each side. The shared cell inset is now 4px, preserving touch size and horizontal padding while reducing linked rows to 52.5–53px. Empty-state copy previously centered beyond the visible phone scroll area; it now starts within the viewport, wraps, and centers at wider sizes with a preserved 16px vertical inset. Verify empty and populated lists after refresh.

## Current shell source review — 2026-09-27

This is a source-level check of the current sidebar and centered-header layouts, not a rendered visual review.

- **Sidebar:** the collapsed rail defines 44px menu controls and 16px vertical padding for its header and footer groups. Logo and account controls use the shared centered menu-button behavior. The workspace switches to a mobile navigation sheet below the desktop breakpoint. Their actual alignment, clipping, hover, and focus appearance still need fresh screenshots.
- **Centered header:** the header is sticky, its surface is capped at the same 1536px width as its content, and it uses square upper corners with 16px lower corner radii. At widths below 1024px, brand/actions and navigation occupy two rows; below 768px the icon row can scroll horizontally. The rendered balance, breadcrumb spacing, and keyboard/touch overflow behavior still need browser review.
- **Shared content:** sidebar workspace content can use up to 2400px while centered-header content uses 1536px. Both keep 16px small-screen and 24px wider-screen page gutters in the shell.
- The local preview responds on port 3000 (`/login` 200; protected dashboard and settings routes redirect to sign-in without an authenticated browser session). HTTP responses do not verify visual layout.

## Review evidence

This review combines source inspection with a live browser screenshot pass. On 2026-09-27, I captured all 24 protected route paths and the four public authentication routes in light and dark themes at 390px and 1440px. The protected routes used the existing signed-in admin test session; public routes used an isolated browser context with no cookies. I also captured all five table pages and five create forms at 320px and 768px in both themes. Long mobile details and Settings were captured full-page, and I separately inspected the collapsed sidebar, its hover tooltip, the account menu, and the notifications popover. The Next.js development overlay was removed from captures so it would not obscure application controls. Screenshots and manifests are included in the review artifact generated for this session. No business records were changed. The shared interface rules are recorded in [system.md](./system.md).

The route captures settled before inspection: no route errors or loading placeholders remained, and `document.documentElement.scrollWidth` matched the viewport for each tested route. The first pass exposed a real mobile table issue despite the absence of page-level overflow; the correction and its recheck are recorded below.

The review covers all user-facing route families:

- Public: /login, /signup, /forgot-password, /reset-password.
- Dashboard: overview, orders (list/create/detail/edit), programs (list/create/detail/edit), claims (list/create/detail/edit), customers (list/create/detail/edit), and users (list/create/detail/edit).
- Other dashboard pages: reports, notifications, settings.
- Shared shell: responsive header, expanded/collapsed sidebar, account menu, notification popover, dialogs, tables, form controls, loading and empty states.

## Fresh auth and settings visual pass — 2026-09-27

- Public login and signup were rendered in a clean browser session at 320, 390, 768, 1440, 2560, and 3840px. Every route stayed within the viewport. The form width remains 448px on desktop; the branded shell remains 1152px wide, and phone forms stay centered without clipping.
- Signup’s second step was exercised with valid temporary input. The browser blocked an empty first step; after entering the required company details, Continue reached sign-in details. Back retained all four company values. Valid password and confirmation feedback appeared. The registration request was not submitted.
- Login was visually reviewed at 390px and 1440px in Warm light, Charcoal dark, Monochrome light, and Monochrome dark. The surfaces and ONCF mark remain legible across all four.
- The in-app Settings dialog was captured at 320, 390, 768, 1440, 2560, and 3840px. It remains 1120×768px on desktop and fits within the viewport on phones; the Appearance panel scrolls internally at 320px, while Profile and Security stay reachable in the section navigation. No horizontal overflow appeared.
- This pass validates the dialog layout and login/signup rendering only. Theme selection persistence, profile-save feedback, security submission states, reset-password pages, centered-header mode, and dark/monochrome Settings captures still need direct interaction and visual review.

## Appearance save ordering correction — 2026-09-27

- Rechecking after a full reload exposed that quickly changed appearance fields could save full preference records concurrently; an earlier response could overwrite a newer shell selection. Preference updates are now queued and each queued request reads the latest selected values when it runs.
- A rapid Sidebar + Charcoal dark selection was synced as one consistent combination. I then restored Warm light + Sidebar, read those values back from the account API, and confirmed them again after a full reload. No business data changed.

## Fresh appearance preference interaction pass — 2026-09-27

- Starting from the saved Warm light + Sidebar preference, I selected Charcoal dark and Centered icon bar in the Settings dialog. The active theme and shell updated immediately, and the persisted local preference plus “synced to your account” state matched those selections after navigation.
- Centered-header screenshots at 390, 768, 1440, 2560, and 3840px show a sticky 64px header on desktop, a 117px two-row header at phone/tablet widths, and no horizontal page overflow. Its surface uses bottom-only rounding; the upper edge stays flat. Content remains in the centered 1536px column at 2K/4K.
- I restored Warm light + Sidebar after the interaction pass and confirmed those values were synced; no profile, password, or business data was changed. Font, text-size, and motion preference persistence still need individual interaction checks.

## Notification item interaction pass — 2026-09-27

- Fresh populated captures at 390px and 1440px show mixed read/unread rows inside the anchored popover, with no page-level horizontal overflow. Row titles align even when the unread marker is absent, and message previews clamp to two lines. Each unread action keeps a 44px target.
- With browser-only mock responses, marking one item read removed its unread marker and updated the bell count; Mark all read removed both unread actions and set the count to zero. Escape closed the menu and returned focus to the bell. Mock mutation requests were intercepted before reaching the API; no database records changed.
- This verifies the client interaction contract and visuals. A populated API-backed notification record and backend mutation test remain unverified.

## Assessment round 1: visual hierarchy and reading comfort

**Source-confirmed findings**

- Shared semantic color and surface tokens exist for light and dark modes. They are intentionally unchanged in this pass, following the request to keep the current palette.
- The shared TableCell used 8px padding on all sides and the header was 40px high. That is too tight for the documented table-row spacing and conflicts with the request for visible cell insets. Shared table cells now use 16px padding and the header uses a 48px height.
- The ONCF asset is a square transparent PNG with a horizontal wordmark. Rendering it in a square image box preserved excess transparent space and made the mark appear too small. The sidebar now crops the source to its horizontal mark proportions inside the existing tile; screenshots confirm the mark remains centered and uncropped in expanded and collapsed widths.
- The shared record summary uses a clear small-label/value hierarchy, but several page-specific rows and cards still need a visual pass for wrapping, alignment, and dense values.
- The shared page wrapper used 32px between every route's top-level sections and a fixed 16px gutter at all widths. It now uses 24px section rhythm, 16px mobile gutters, and 24px tablet/desktop gutters within a 1536px reading width.
- The dashboard placed three recent-activity panels in two columns, leaving the final panel alone on a second row. It now chooses a balanced grid based on the user's readable sections, caps dashboard reading width at 1536px, and aligns each record's status and date with its corresponding title and description. A fresh browser screenshot review is still required because live capture is unavailable in this workbench.
- At 390px, wide table columns expanded the dashboard's single-column CSS grid to their min-content width. That pushed the Orders status filter outside the viewport and made the table look clipped. The shared page grid now uses one shrinkable column; every tested route stayed within the viewport afterward. Wide tables scroll in their own keyboard-focusable region and now show a small mobile hint only while more columns remain.
- Ghost buttons and sidebar rows used fully opaque muted/accent hover fills. Their hover fills are now softer; collapsed sidebar items keep the full 44px target but no longer paint the entire icon button on hover. Button transitions are limited to color instead of animating every property.
- At desktop width, the collapsed sidebar measured 63px wide. Its logo/profile groups retain 16px vertical padding, with 44px controls centered in the rail. The collapsed icon tooltip was visually heavy against the page; it now uses the popover surface, a quiet border, compact padding, and an 8px gap.
- Inputs and textareas now use 12px horizontal padding from the 4px grid. Scrollable tables can receive keyboard focus and expose a named region; table row hover is subdued.

**Self-critique**

The screenshot pass verified the shared rhythm at 320px, 390px, 768px, and desktop width for the table/form routes. Horizontal table scrolling is retained because it preserves column relationships; the hint makes the gesture discoverable. Dense tables still need content review with larger real datasets, since the current seed data has only a few rows.

## Assessment round 2: task flow and next actions

**Source-confirmed findings**

- Order details show forecast-program counts, while program creation previously required returning to Programs and selecting the order again.
- The eligible-program API allows orders in APPROVED, SENT_TO_DTM, and IN_PROGRESS; it is permission protected. The order detail now offers Create program only when the user has programs:create, can manage other orders or owns this order, the order has no forecast programs, and its status is eligible. This mirrors the eligible-orders API ownership filter. The route carries the order ID and number search; the create form preselects the order only while it remains in the eligible query. Cancel returns to the originating order detail.
- The first live create-flow smoke test found that the eligible-order query still returned a linked order and the API accepted a duplicate program. Eligibility now excludes orders with any forecast program, and the create service returns 409 for a duplicate. A fresh API instance on the approved preview database verified: eligible before create, 201 on first create, ineligible afterward, 409 on duplicate, then eligible again after the temporary draft was deleted. The same sequence passed through the running Next proxy; login, signup, and authenticated Settings routes returned 200, and the temporary program was removed.
- The create/edit flows use shared guided progress/actions. Cancel routes are stable, and navigation actions are disabled during an in-flight submit. Guided forms now validate only the fields on the active step before advancing; the complete schema runs on final submit and maps errors back to the corresponding field. Browser checks confirmed New User can advance without profile errors, then shows required names after final submit, and New Claim displays its description error without submitting.
- Guided-form validation now moves focus to the first invalid field after errors are displayed. Native controls and the shared customer, order, user, and program-status selectors expose matching IDs so keyboard focus reaches the actual control.
- Live verification on 2026-09-27 created synthetic order `ORD-LHEK6J9R58` (ID 1) as a commercial agent, submitted it, and approved it as an admin. The eligible-orders API includes it. The order detail returns Create program for both the agent and admin, while the client representative can read the same customer-scoped order but does not get that action. The program-create URL carries `orderId=1` and the order-number search.
- The order detail action logic is covered for every order status, owner/manager scope, permission, and existing-program count. The browser-based form selection and completed program submission still need verification; HTTP rendering confirms the destination route responds but does not run its client-side query/hydration.
- The notifications control opens a 360px popover aligned below its trigger, with a clear empty state and a separate View all notifications destination. The collapsed profile menu opens above the avatar and keeps Profile, Settings, and Log out reachable.

**Self-critique**

The CTA rule has exhaustive unit coverage and its eligible, unprogrammed state is verified in the current preview database for admin, commercial-agent, and client-representative access. The API smoke test now confirms one successful create removes the order from selection and a second create is rejected. Browser verification remains for preselection, stale-selection feedback, and Cancel returning to the originating detail. The CTA currently lives on eligible order details; decide whether it also belongs in an order list row or dashboard card after measuring action density with realistic data. The create forms were also checked for premature validation: a later-step required field must stay quiet until the user reaches that step and submits.

## Assessment round 3: consistency, responsiveness, and maintainability

**Source-confirmed findings**

- Dashboard list/detail/form pages share common table, record-summary, page-header, and guided-form primitives. Changes to these primitives have broad impact, so the complete route family must be checked after shared style edits.
- The default commercial-agent role can edit customers but cannot deactivate them. The customer detail previously rendered a More actions trigger with no menu items; the trigger is now shown only when deactivation is permitted. Program overflow actions also now account for the Draft-only delete rule before rendering the trigger.
- Client representatives had an existing `users.customer_id` field but no customer assignment control in the user forms. Their seeded account also had no customer, so order creation could not supply the hidden customer field. User create/edit now require and expose the assignment, the development fixture links the client to `CLI009`, and order/program/report list scope now follows the matching customer relation. The user edit form now reads the role name rather than the role UUID.
- The previous order detail guard allowed same-customer access while order lists and reports only filtered by creator. List and report queries now use the same assigned-customer scope, and program list/detail access follows the related order's customer. The exact role and schema mapping is recorded in [authorization.md](../security/authorization.md).
- The 24 dashboard route files cover the core operational pages; four public authentication routes are separate. A source-reference scan found no clearly orphaned web modules. Dependency-name scanning produced framework/runtime false positives, so no dependencies were removed without stronger evidence.
- Existing reduced-motion handling is present. It should be retained for every new transition.
- The light and dark screenshots use the same semantic surface roles; the current warm light cards separate from the canvas without changing the palette. Full-page Settings screenshots show the appearance, account, and security sections in one consistent card rhythm.
- Full-page order, program, claim, customer, and user details retain the same label/value hierarchy down the page. One local claim currently contains ad hoc test comments and description text that do not appear in committed fixtures; treat those as local data cleanup, not UI copy.

**Self-critique**

Shared primitives reduce drift but do not make all page content consistent. The route screenshots cover first-viewport layouts; below-fold details were inspected on representative long pages, not exhaustively on every route and theme. Copy, empty/loading/error/success states, and action placement still need state-by-state review. The preview has a synthetic eligible order, but the current workbench cannot visually verify its CTA or follow the hydrated create flow.

## Prioritized work list

### Done in this pass; needs visual confirmation

- [x] Soften ghost and sidebar hover fills without reducing 44px interaction targets or changing palette tokens; collapsed icon hover no longer fills the full target.
- [x] Limit shared button transitions to color properties.
- [x] Increase shared table cell insets and header height.
- [x] Set a responsive shared page gutter and 24px route-section rhythm.
- [x] Balance dashboard recent-activity panels across available permissions, cap the dashboard reading width, and improve record-row alignment.
- [x] Align input/textarea horizontal padding to the 4px spacing grid; make table scroll regions keyboard reachable.
- [x] Crop the ONCF horizontal wordmark to its content proportions in the sidebar tile.
- [x] Add a permission- and status-aware Create program action to eligible order details and carry the selected order into the guided create flow.
- [x] Put Create order and Create claim shortcuts beside the dashboard greeting when the signed-in user has the matching create permission; keep program creation contextual to eligible order details.
- [x] Focus the first invalid guided-form control after validation and keep custom selector IDs aligned with field names.
- [x] Give order reports an explicit retry action and accessible pending feedback when their query fails.
- [x] Give the goods selector an explicit retry action when its catalog query fails, keeping order forms recoverable.
- [x] Distinguish empty results from failed customer, goods, unit, order, and user option queries; keep stale choices available and provide inline retry actions.
- [x] Preserve an order-detail preselection while program eligibility is loading, refreshing, or failed; clear it only after a successful response says it is no longer eligible.
- [x] Give appearance theme choices semantic-token previews, including both device modes for System, without changing any theme colors.
- [x] Make the login password-visibility button meet the 44px target size and associate it with its password field.
- [x] Increase guided-form step titles from 12px to 14px on phones; retain the established 8px circle-to-title gap.
- [x] Add an application-level error recovery screen with a retry action and a safe sign-in route; keep the error details out of user-facing copy.
- [x] Hide customer/user/program overflow triggers when the current role and record state provide no menu action; cover default roles and program status in frontend checks.
- [x] Require a customer assignment for client representatives in user management and the API; align order, program, and report reads with the existing customer ownership relation; assign the development client fixture to a seeded customer.
- [x] Historical capture pass: protected/public routes in light/dark at 390px and 1440px; these screenshots predate later UI changes and do not verify the current rendering.
- [x] Historical capture pass: table pages and create forms in light/dark at 320px and 768px; the captured run exposed clipping that was fixed, but must be repeated against the current UI.
- [x] Historical capture pass: full-page mobile Settings and representative details, collapsed sidebar, tooltip, account menu, and notification popover; recapture current states before visual sign-off.
- [x] Historical palette check: warm light and charcoal dark roles were compared in the old route set; recapture after current shared UI changes.

### Next visual review

- [ ] Recapture both current shell layouts at 320px, 375px, 390px, 640px, 768px, 1024px, 1440px, 1920px, 2560px, and 3840px in all four concrete themes; include sidebar expanded/collapsed, centered navigation overflow, settings sections, breadcrumbs, keyboard focus, and touch states. Do not reuse the historical screenshot bundle as current evidence.
- [ ] Capture every remaining guided-form step, open select/menu/dialog state, and full-page section in both themes; current captures include the initial create steps, second edit steps for orders/customers/users, and validation states for user and claim creation.
- [ ] Review route-specific copy, alignment, wrapping, shadow use, success/error states, and action placement below the fold; the first-viewport route pass and representative full-page details are complete.
- [x] Verify the approved, unprogrammed order shortcut for admin and commercial-agent accounts; confirm the client representative can read the order but cannot see the action.
- [ ] Use browser interaction to confirm the order is selected on program creation, remains eligible through submission, and Cancel returns to its order detail.
- [x] Inspect table/form screens at 320px, 390px, 768px, and 1440px. Keep horizontal scrolling for wide tables, with a visible hint on phones, unless realistic data reveals a table-specific card layout is clearer.
- [ ] Capture dashboard, table, detail, and form screens at 1920px, 2560px, and 3840px in both themes; verify the 2400px content cap, table width, and action alignment.
- [ ] Visually verify the dashboard's one-, two-, and three-section layouts at mobile, desktop, and ultrawide widths, including long statuses and descriptions.
- [ ] Audit empty/loading/error/success states across each list, detail, and form route; make wording and action placement consistent. Recheck all guided-form fields when backend error messages arrive, since this browser pass exercised client-side validation.
- [ ] Compare form labels/help/errors, page titles/subtitles, record rows, and action bars against the design-system type and spacing scale.
- [x] Keep color tokens fixed and visually compare light/dark surface hierarchy across captured routes.
- [x] Add repeatable screenshot coverage to the repository. `bun run ui:review` uses the authenticated Chrome DevTools session to save viewport captures and report page overflow without adding a browser dependency; the notifications popover passed a live 320/390/1440px smoke run. It does not perform pixel-diff or accessibility assertions, and the full route/theme matrix is still open.
- [ ] Visually review the updated login and signup layouts, then exercise a pending signup through both administrator approval and rejection at mobile and desktop widths.

## Current review limits

The checked-in capture utility makes responsive screenshots repeatable, but it does not replace keyboard/screen-reader testing or a complete interaction-state matrix. A final-submit validation bug discovered during the form pass was fixed and verified in live user and claim flows; its screenshots are included in the review artifact. The current preview contains a synthetic eligible order and a pending signup request; other seeded/local detail content is sparse. Dashboard shortcuts, auth routes, and order-to-program states still need fresh visual and workflow review. The older public-route captures predate the authentication updates and should not be used as current visual evidence.

## Authentication follow-up — 2026-09-27

- `/signup` now contains the client-registration form. It validates customer code and ICE against a locally maintained active customer record, submits a pending client-representative account, and explains that administrator approval is required before sign-in.
- The public auth routes share a compact centered layout below extra-large width and a two-panel ONCF-branded layout on wide screens. The sign-in password visibility control uses a 44px target. The web API client and Next.js proxy both default to `http://localhost:8000` when `BACKEND_API_URL` is unset, so local sign-in works without a provider-specific environment variable.
- The live HTTP check returned 200 for `/login` and `/signup`; a valid test login through the Next.js proxy returned 201, and an invalid password returned 401.
- These auth changes were made after the historical screenshot bundle above. The current checklist records fresh Login and Signup captures across phone, tablet, laptop, and ultrawide sizes; approval and rejection review states still need current visual confirmation. Do not use the older public-route captures to sign off the updated screens.
- Administrator review now appears in the user list and user detail for pending registrations. The page describes the customer-code/ICE match, and only users with `users:update` can approve or reject. The preview contains a pending local demo request; screenshot review of that state remains outstanding.
- A live Next-proxy smoke check rejected an invalid customer code with 400, accepted two valid requests as pending, returned the review actions on both user-detail routes, allowed sign-in after approval (201), and denied sign-in after rejection (401). The temporary applicants were deactivated afterward; the pending demo request remains available for visual review.

## Settings dialog follow-up — 2026-09-27

- Source inspection found that Appearance used tall choice cards with repeated descriptions. The Settings dialog also entered a 240px side-navigation layout at tablet width, leaving a narrow content pane.
- Appearance selections now use shorter controls with the same 48px or 56px minimum target, concise visible labels, and descriptions available to assistive technology. Theme previews remain; the palette and theme tokens are unchanged. The appearance card no longer draws a second card surface inside the dialog.
- The section rail now starts at 1024px. Below that width, section navigation remains horizontal above the scrollable settings pane.
- The shared `DialogContent` now provides a `wide` size capped at 1120px wide and 768px high, bounded by the viewport; Settings uses it instead of repeating width rules. The fixed footprint keeps section changes from moving the dialog or close control. Shared dialog focus/overlay/close behavior continues to come from the common primitive.
- Appearance now includes a per-user Sidebar / Centered icon bar option. The preference is validated by the API, stored with the existing `user_preferences` row, included in local fallback storage, and applied by the dashboard shell. Both layouts filter the shared route list by the current user's permissions.
- Layout identifiers are application capabilities: the shared `packages/shared` value list is the contract used by the UI, API validation, and the database check constraint. A separate reference-data table would allow unsupported shells to be selected and maintained independently of the code that implements them, so the database constraint is derived from the shared list instead.
- The centered header is pinned to the top and aligns with the 1536px centered content cap. The custom side curves were removed after visual review; the header now has square top corners and standard 16px rounded lower corners. The brand, centered icon navigation, and account actions use separate zones. At widths below the single-row breakpoint, the navigation moves to its own horizontally scrollable row. The sidebar workspace retains its wider 2400px cap for data-heavy pages.
- Fresh screenshots of the Settings dialog were captured on 2026-10-01 at 320px, 375px, 390px, 640px, 768px, 1024px, 1440px, 1920px, 2560px, and 3840px; the capture reported no horizontal overflow, and the 320px and 1440px images were inspected. The compact title/sync row, section navigation, and appearance selector previews remain readable at those sizes. This pass used the current light theme and Appearance section only; theme variants and other sections remain open. The centered header still needs its own fresh screenshot review at those widths, including overflow and hover/focus labels.
