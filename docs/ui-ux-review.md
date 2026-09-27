# UI/UX review and work list

## Review evidence

This is primarily a source-based review, not a full screenshot review. I inspected the ONCF raster asset directly, but this execution environment has no browser automation tool or installed browser binary, so I could not capture rendered route screenshots. Findings marked source-confirmed come from the current route and component code; page composition, clipping, contrast, and responsive behavior still need browser confirmation. Do not treat this document as claiming those checks passed. The shared interface rules are recorded in [design-system.md](./design-system.md).

The review covers all user-facing route families:

- Public: /login, /signup, /forgot-password, /reset-password.
- Dashboard: overview, orders (list/create/detail/edit), programs (list/create/detail/edit), claims (list/create/detail/edit), customers (list/create/detail/edit), and users (list/create/detail/edit).
- Other dashboard pages: reports, notifications, settings.
- Shared shell: responsive header, expanded/collapsed sidebar, account menu, notification popover, dialogs, tables, form controls, loading and empty states.

## Assessment round 1: visual hierarchy and reading comfort

**Source-confirmed findings**

- Shared semantic color and surface tokens exist for light and dark modes. They are intentionally unchanged in this pass, following the request to keep the current palette.
- The shared TableCell used 8px padding on all sides and the header was 40px high. That is too tight for the documented table-row spacing and conflicts with the request for visible cell insets. Shared table cells now use 16px padding and the header uses a 48px height.
- The ONCF asset is a square transparent PNG with a horizontal wordmark. Rendering it in a square image box preserved excess transparent space and made the mark appear too small. The sidebar now crops the source to its horizontal mark proportions inside the existing tile; the logo still needs a browser screenshot check at expanded and collapsed widths.
- The shared record summary uses a clear small-label/value hierarchy, but several page-specific rows and cards still need a visual pass for wrapping, alignment, and dense values.
- The shared page wrapper used 32px between every route's top-level sections and a fixed 16px gutter at all widths. It now uses 24px section rhythm, 16px mobile gutters, and 24px tablet/desktop gutters within a 1536px reading width.
- Ghost buttons and sidebar rows used fully opaque muted/accent hover fills. Their hover fills are now softer; collapsed sidebar items keep the full 44px target but no longer paint the entire icon button on hover. Button transitions are limited to color instead of animating every property.
- Inputs and textareas now use 12px horizontal padding from the 4px grid. Scrollable tables can receive keyboard focus and expose a named region; table row hover is subdued.

**Self-critique**

These measurements identify likely density and hover issues, but cannot prove that the rendered layouts look balanced at real viewport sizes. A 16px table inset may also make wide data tables scroll sooner on mobile; inspect each table at 320px, 390px, tablet, and desktop widths.

## Assessment round 2: task flow and next actions

**Source-confirmed findings**

- Order details show forecast-program counts, while program creation previously required returning to Programs and selecting the order again.
- The eligible-program API allows orders in APPROVED, SENT_TO_DTM, and IN_PROGRESS; it is permission protected. The order detail now offers Create program only when the user has programs:create, can manage other orders or owns this order, the order has no forecast programs, and its status is eligible. This mirrors the eligible-orders API ownership filter. The route carries the order ID and number search; the create form preselects the order only while it remains in the eligible query. Cancel returns to the originating order detail.
- The create/edit flows use shared guided progress/actions. Cancel routes are stable, and navigation actions are disabled during an in-flight submit.

**Self-critique**

The action is implemented from current API rules, but role/status combinations need runtime interaction checks. Confirm that a stale or no-longer-eligible order clears from the selector and cannot advance with an invisible selection. Check the CTA on both detail and list/dashboard contexts to ensure its placement does not overwhelm primary status actions.

## Assessment round 3: consistency, responsiveness, and maintainability

**Source-confirmed findings**

- Dashboard list/detail/form pages share common table, record-summary, page-header, and guided-form primitives. Changes to these primitives have broad impact, so the complete route family must be checked after shared style edits.
- The default commercial-agent role can edit customers but cannot deactivate them. The customer detail previously rendered a More actions trigger with no menu items; the trigger is now shown only when deactivation is permitted. Program overflow actions also now account for the Draft-only delete rule before rendering the trigger.
- Client representatives had an existing `users.customer_id` field but no customer assignment control in the user forms. Their seeded account also had no customer, so order creation could not supply the hidden customer field. User create/edit now require and expose the assignment, the development fixture links the client to `CLI009`, and order/program/report list scope now follows the matching customer relation. The user edit form now reads the role name rather than the role UUID.
- The previous order detail guard allowed same-customer access while order lists and reports only filtered by creator. List and report queries now use the same assigned-customer scope, and program list/detail access follows the related order's customer. The exact role and schema mapping is recorded in [authorization-matrix.md](./authorization-matrix.md).
- The 24 dashboard route files cover the core operational pages; four public authentication routes are separate. A source-reference scan found no clearly orphaned web modules. Dependency-name scanning produced framework/runtime false positives, so no dependencies were removed without stronger evidence.
- Existing reduced-motion handling is present. It should be retained for every new transition.

**Self-critique**

Shared primitives reduce drift but do not make all page content consistent. Copy, empty/loading/error states, image sizing, shadow use, and action placement remain page-specific. Static checks cannot detect clipped text, awkward wrapping, poor visual balance, or confusing hover areas.

## Prioritized work list

### Done in this pass; needs visual confirmation

- [x] Soften ghost and sidebar hover fills without reducing 44px interaction targets or changing palette tokens; collapsed icon hover no longer fills the full target.
- [x] Limit shared button transitions to color properties.
- [x] Increase shared table cell insets and header height.
- [x] Set a responsive shared page gutter and 24px route-section rhythm.
- [x] Align input/textarea horizontal padding to the 4px spacing grid; make table scroll regions keyboard reachable.
- [x] Crop the ONCF horizontal wordmark to its content proportions in the sidebar tile.
- [x] Add a permission- and status-aware Create program action to eligible order details and carry the selected order into the guided create flow.
- [x] Hide customer/user/program overflow triggers when the current role and record state provide no menu action; cover default roles and program status in frontend checks.
- [x] Require a customer assignment for client representatives in user management and the API; align order, program, and report reads with the existing customer ownership relation; assign the development client fixture to a seeded customer.

### Next visual review

- [ ] Capture screenshots for every route family in light and dark at 390px and desktop width; include expanded and collapsed sidebar, settings, all tables, every guided-form step, and open notification/account menus.
- [ ] Inspect the screenshot set for clipping, alignment, line wrapping, type hierarchy, card/surface contrast, image crop/aspect, shadow strength, and hover footprint; record per-route corrections.
- [ ] Verify the order-to-program CTA for admin, commercial agent, and client representative, and for each eligible/ineligible order status and existing-program state.
- [ ] Inspect all tables at 320px, 390px, tablet, and desktop; decide where horizontal scroll is acceptable and where a mobile row/card layout is needed.
- [ ] Audit empty/loading/error/success states across each list, detail, and form route; make wording and action placement consistent.
- [ ] Compare form labels/help/errors, page titles/subtitles, record rows, and action bars against the design-system type and spacing scale.
- [ ] Keep color tokens fixed unless the user requests another palette change; visually confirm light/dark surface hierarchy and text contrast.
- [ ] Add screenshot or visual-regression coverage after a browser runner is available.
- [ ] Decide whether public signup is part of this MVP; `/signup` currently renders the shared Under Construction view and there is no public registration API route.

## Screenshot limitation

The screenshot checklist remains open because the current environment does not expose browser control and does not contain Chromium, Chrome, Firefox, Playwright, or Puppeteer. A later review needs a browser-capable session or a browser installed in the development environment. The app is reachable at http://localhost:3000; endpoint availability is not evidence of visual correctness.
