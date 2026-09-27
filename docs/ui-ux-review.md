# UI/UX review and work list

## Review evidence

This review combines source inspection with a live browser screenshot pass. On 2026-09-27, I captured all 24 protected route paths and the four public authentication routes in light and dark themes at 390px and 1440px. The protected routes used the existing signed-in admin test session; public routes used an isolated browser context with no cookies. I also captured all five table pages and five create forms at 320px and 768px in both themes. Long mobile details and Settings were captured full-page, and I separately inspected the collapsed sidebar, its hover tooltip, the account menu, and the notifications popover. The Next.js development overlay was removed from captures so it would not obscure application controls. Screenshots and manifests are included in the review artifact generated for this session. No business records were changed. The shared interface rules are recorded in [design-system.md](./design-system.md).

The route captures settled before inspection: no route errors or loading placeholders remained, and `document.documentElement.scrollWidth` matched the viewport for each tested route. The first pass exposed a real mobile table issue despite the absence of page-level overflow; the correction and its recheck are recorded below.

The review covers all user-facing route families:

- Public: /login, /signup, /forgot-password, /reset-password.
- Dashboard: overview, orders (list/create/detail/edit), programs (list/create/detail/edit), claims (list/create/detail/edit), customers (list/create/detail/edit), and users (list/create/detail/edit).
- Other dashboard pages: reports, notifications, settings.
- Shared shell: responsive header, expanded/collapsed sidebar, account menu, notification popover, dialogs, tables, form controls, loading and empty states.

## Assessment round 1: visual hierarchy and reading comfort

**Source-confirmed findings**

- Shared semantic color and surface tokens exist for light and dark modes. They are intentionally unchanged in this pass, following the request to keep the current palette.
- The shared TableCell used 8px padding on all sides and the header was 40px high. That is too tight for the documented table-row spacing and conflicts with the request for visible cell insets. Shared table cells now use 16px padding and the header uses a 48px height.
- The ONCF asset is a square transparent PNG with a horizontal wordmark. Rendering it in a square image box preserved excess transparent space and made the mark appear too small. The sidebar now crops the source to its horizontal mark proportions inside the existing tile; screenshots confirm the mark remains centered and uncropped in expanded and collapsed widths.
- The shared record summary uses a clear small-label/value hierarchy, but several page-specific rows and cards still need a visual pass for wrapping, alignment, and dense values.
- The shared page wrapper used 32px between every route's top-level sections and a fixed 16px gutter at all widths. It now uses 24px section rhythm, 16px mobile gutters, and 24px tablet/desktop gutters within a 1536px reading width.
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
- The previous order detail guard allowed same-customer access while order lists and reports only filtered by creator. List and report queries now use the same assigned-customer scope, and program list/detail access follows the related order's customer. The exact role and schema mapping is recorded in [authorization-matrix.md](./authorization-matrix.md).
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
- [x] Align input/textarea horizontal padding to the 4px spacing grid; make table scroll regions keyboard reachable.
- [x] Crop the ONCF horizontal wordmark to its content proportions in the sidebar tile.
- [x] Add a permission- and status-aware Create program action to eligible order details and carry the selected order into the guided create flow.
- [x] Put Create order and Create claim shortcuts beside the dashboard greeting when the signed-in user has the matching create permission; keep program creation contextual to eligible order details.
- [x] Focus the first invalid guided-form control after validation and keep custom selector IDs aligned with field names.
- [x] Give order reports an explicit retry action and accessible pending feedback when their query fails.
- [x] Give the goods selector an explicit retry action when its catalog query fails, keeping order forms recoverable.
- [x] Hide customer/user/program overflow triggers when the current role and record state provide no menu action; cover default roles and program status in frontend checks.
- [x] Require a customer assignment for client representatives in user management and the API; align order, program, and report reads with the existing customer ownership relation; assign the development client fixture to a seeded customer.
- [x] Capture all protected and public route paths in light/dark at 390px and 1440px after loading settles; inspect the route contact sheets for page-level overflow and rendering errors.
- [x] Capture all table pages and create forms in light/dark at 320px and 768px; constrain the shared dashboard grid and add a conditional mobile table-scroll hint after the screenshots exposed clipping.
- [x] Capture full-page mobile Settings and representative order/program/claim/customer/user detail pages; inspect collapsed sidebar spacing, the small tooltip, account menu, and notification popover.
- [x] Keep the existing palette and confirm the warm light surfaces and charcoal dark surfaces remain consistent across the route set.

### Next visual review

- [ ] Capture every remaining guided-form step, open select/menu/dialog state, and full-page section in both themes; current captures include the initial create steps, second edit steps for orders/customers/users, and validation states for user and claim creation.
- [ ] Review route-specific copy, alignment, wrapping, shadow use, success/error states, and action placement below the fold; the first-viewport route pass and representative full-page details are complete.
- [x] Verify the approved, unprogrammed order shortcut for admin and commercial-agent accounts; confirm the client representative can read the order but cannot see the action.
- [ ] Use browser interaction to confirm the order is selected on program creation, remains eligible through submission, and Cancel returns to its order detail.
- [x] Inspect table/form screens at 320px, 390px, 768px, and 1440px. Keep horizontal scrolling for wide tables, with a visible hint on phones, unless realistic data reveals a table-specific card layout is clearer.
- [ ] Capture dashboard, table, detail, and form screens at 1920px, 2560px, and 3840px in both themes; verify the 2400px content cap, table width, and action alignment.
- [ ] Audit empty/loading/error/success states across each list, detail, and form route; make wording and action placement consistent. Recheck all guided-form fields when backend error messages arrive, since this browser pass exercised client-side validation.
- [ ] Compare form labels/help/errors, page titles/subtitles, record rows, and action bars against the design-system type and spacing scale.
- [x] Keep color tokens fixed and visually compare light/dark surface hierarchy across captured routes.
- [ ] Add repeatable screenshot or visual-regression coverage to the repository; this pass used the live Chrome debugging session and generated a review bundle, not a checked-in browser test runner.
- [ ] Visually review the updated login and signup layouts, then exercise a pending signup through both administrator approval and rejection at mobile and desktop widths.

## Current review limits

The screenshot pass verified rendered route screens through 1440px, but it does not replace keyboard/screen-reader testing or a complete interaction-state matrix. A final-submit validation bug discovered during the form pass was fixed and verified in live user and claim flows; its screenshots are included in the review artifact. The current preview contains a synthetic eligible order and a pending signup request; other seeded/local detail content is sparse. The current workbench has no browser automation, so the new dashboard shortcuts, auth routes, and order-to-program states have source/HTTP verification but still need screenshot review. The public-route captures predate the authentication updates below.

## Authentication follow-up — 2026-09-27

- `/signup` now contains the client-registration form. It validates customer code and ICE against a locally maintained active customer record, submits a pending client-representative account, and explains that administrator approval is required before sign-in.
- The login page uses a compact, centered layout. The web API client and Next.js proxy both default to `http://localhost:8000` when `BACKEND_API_URL` is unset, so local sign-in works without a provider-specific environment variable.
- The live HTTP check returned 200 for `/login` and `/signup`; a valid test login through the Next.js proxy returned 201, and an invalid password returned 401.
- These auth changes were made after the screenshot bundle above. Browser screenshot automation is unavailable in the current workbench, so the updated login/signup appearance still needs visual confirmation at mobile and desktop widths. The older public-route captures show the earlier UI and should not be used to sign off the new screens.
- Administrator review now appears in the user list and user detail for pending registrations. The page describes the customer-code/ICE match, and only users with `users:update` can approve or reject. The preview contains a pending local demo request; screenshot review of that state remains outstanding.
- A live Next-proxy smoke check rejected an invalid customer code with 400, accepted two valid requests as pending, returned the review actions on both user-detail routes, allowed sign-in after approval (201), and denied sign-in after rejection (401). The temporary applicants were deactivated afterward; the pending demo request remains available for visual review.
