# ECommand interface design system

This document is the shared UI contract for the Next.js application. Apply it to new screens and when revisiting existing ones. The goal is a calm, readable operations workspace where the next useful action is clear.

## 1. Layout and page rhythm

- Use a 4px base spacing unit. Choose spacing values from 4, 8, 12, 16, 24, and 32px; use 0 when no inset is needed. Prefer padding for component interiors and reserve margin for intentional relationships between separate blocks. Avoid one-off measurements and unexplained spacing classes.
- Standard spacing aliases in this repo: 4px `gap-compact`, 8px `gap-control` / `px-control`, and 12px `px-field`. Larger layout gaps use the 4px-grid utilities (`gap-4`=16px, `gap-6`=24px, `gap-8`=32px). Choose by the resolved pixel value, not by a class name that looks familiar. Prefer named aliases for control insets and parent `gap` for layout rhythm.
- Use `p-control` / `px-control` for an 8px control inset and `px-field` for the 12px field inset. Use 16px (`p-4`) for mobile page gutters and 24px (`p-6`) for wider page gutters. Every new spacing choice should be deliberate and on the 4px grid.
- Dashboard content uses 16px gutters on small screens and 24px from tablet width upward, with a 1536px maximum content width. Keep page sections 24px apart. Keep related controls 8–16px apart and related sections inside a card 16–24px apart.
- Keep content width readable on ultrawide displays. Tables can use the available width, but text-heavy descriptions should have a readable maximum line length.
- Stack page headings and primary actions on narrow screens. Actions should wrap cleanly and remain easy to tap; do not shrink targets to gain density.
- Use responsive grids that start as one column. Introduce two columns only when each field/card has enough room to remain readable.

### Page composition and breakpoints

1. A page header pairs a clear title, a short supporting description, and the primary page action.
2. The next block groups related work under a visible section/card title. Avoid nested cards unless a second visual boundary is needed to separate a distinct task.
3. Below 640px, stack heading and actions, make form actions full width when it improves reach, and collapse multi-column cards/forms to one column. At tablet width, use two columns only when both remain readable.
4. Long values wrap. Buttons may wrap or stack; controls and type do not get smaller to fit. A 320px screen may scroll horizontally only inside a data-table region.
5. Form/detail text fields use a readable maximum width instead of stretching across ultrawide monitors. Data tables may use the remaining page width.

## 2. Type hierarchy

| Purpose | Treatment |
| --- | --- |
| Page title | 24px on small screens, 30px on larger screens; semibold, tight leading |
| Page description | 14px / 24px line height, muted; keep clearly subordinate to the title |
| Card/section title | 16px, semibold |
| Body and table values | 14px with comfortable line height |
| Form labels and metadata | 13–14px, medium for labels, muted for supporting values |
| Secondary descriptions | 14px, muted, with 4–8px separation from their title |

Do not make a title and its subtitle the same size or weight. Use tabular numerals for quantities and dates that users compare.

## 3. Surfaces and color roles

Keep the current palette tokens until a palette change is requested. Use the existing semantic roles consistently:

- `background` / `surface-canvas`: application canvas.
- `sidebar` / `surface-navigation`: persistent navigation surface.
- `card` / `surface-raised`: grouped content and data surfaces.
- `popover`: menus and transient overlays above the page.
- `primary`: the main action and restrained active-state cue.
- `muted` and `muted-foreground`: secondary surfaces and supporting information.
- `border`: grouping and control boundaries; prefer this over additional shadows.

Use the same semantic roles in light and dark modes. Cards should separate from the canvas through the existing surface token and a quiet border/ring, not a bright white fill or heavy shadow. Hover is a small feedback cue, not a large decorative block. Focus indicators must remain visible and stronger than hover.

## 4. Cards, tables, and data

- Cards use one consistent radius, quiet outline, and 16px interior spacing on mobile / 24px from the `sm` breakpoint upward. The 44px control size and 16px table cell insets do not shrink on mobile.
- Tables use 14px text, aligned values, a restrained header style, and at least 16px horizontal and vertical cell insets on desktop. Keep row actions and links within their own hit areas.
- On narrow screens, let wide tables scroll inside their own container; do not compress important values until they collide. Ensure the scroll area can be reached by keyboard and communicates its purpose.
- Use one label/value pattern in record details: muted 13px label, stronger 14–16px value, 8px separation, and wrapping for long values.
- A standard table row is at least 56px tall; a row with a title and supporting line is at least 64px. Give each cell its own inset and keep related values aligned by column. Use tabular numerals for comparable dates and quantities.
- Keep long values readable. Truncate only when the same record has a clear detail destination or the full value is available to assistive technology. On phones, preserve table column meaning inside the horizontal scroll area rather than squeezing text together.
- Empty, loading, error, and success states should occupy the same content region and provide the next useful action when one exists.

### Row and list patterns

- Keep a standard data row at least 56px high; use 64px or more when the row contains a title and supporting text.
- Separate row title and subtitle by 4px. Keep the title at 14–16px and the subtitle at 13–14px, muted. Do not truncate unless a detail destination or accessible full value is available.
- Keep row actions in a trailing aligned area with 44px targets. Do not make a tiny text string the only clickable area when the whole row is intended to navigate.
- At narrow widths, let metadata wrap under the title and move secondary actions to another line or a menu instead of compressing the main value.

## 5. Forms and controls

- Inputs, selects, buttons, and menu items retain a 44px minimum interaction height where practical.
- Standard primary and secondary actions keep at least 12px horizontal and 8px vertical padding. Icon glyphs are generally 16px or 20px inside a larger hit area.
- Keep the keyboard focus ring visible and distinct from hover. Give icon-only controls an accessible name; a tooltip supplements that name but does not replace it.
- Keep form label-to-control spacing at 8px. Keep related fields 16px apart. Error text sits directly below the field and uses the destructive semantic color.
- Put labels above controls and helper/error copy directly below them. Pair fields only when both columns remain readable; stack them below tablet width. Textareas should show enough lines to communicate that they accept longer text.
- Guided forms state the current step, the information needed at that step, and the next action. Back, Cancel, and submit placement must stay consistent between entity forms.
- Validate the active step before advancing, retain entered values when moving backward, and validate the whole form on final submission. Focus the first invalid control after an error; do not rely on color alone to identify it.
- Prevent duplicate submission while saving and preserve the user's context when Cancel returns to a previous record.
- Keep loading and pending feedback in the button or the form region being changed so the action does not appear to vanish or shift position.

## 6. Navigation and feedback

- Expanded sidebar hover may tint the full navigation row softly. In collapsed mode, keep the 44px target but make hover feedback local and subtle around the icon.
- Keep logo and profile controls centered with the same top/bottom breathing room in both sidebar states.
- Notifications open next to their trigger as a bounded popover. The full inbox remains a separate destination for reviewing older items.
- Transitions should be short and limited to the property that changes. Respect `prefers-reduced-motion`.

### Application shell measurements

- The header is 64px high. The mobile sidebar sheet is 288px wide, bounded by the viewport; the expanded desktop sidebar is 256px.
- The collapsed desktop rail is 64px wide. Keep logo and avatar marks at 32px and center them in 44px controls, with 16px top and bottom padding around the header/footer groups. Keep icon targets at 44px.
- In the collapsed rail, center every logo/avatar/menu icon. Remove internal horizontal button padding only where it would displace the icon; retain the full button target and the rail's outer breathing room.
- Keep the brand art inside its tile without stretching the logo to a square. If an asset includes transparent canvas, size/crop it by its visible content proportions and preserve the complete wordmark where there is room.
- Expanded navigation hover may tint its full 44px row using a low-opacity accent. Collapsed hover changes the icon/foreground gently without filling the whole target. Focus uses the visible ring and remains distinct from hover.
- Keep the footer anchored below the independently scrollable navigation. Group labels have a distinct treatment and may hide when collapsed. The collapsed logo, each nav icon, and the profile control need accessible names/tooltips; account name and role may hide in the rail.
- On mobile, open navigation in a sheet bounded by the viewport and close it after a route is selected.

### Notifications

- The bell stays a 44px button in the top bar. Clicking opens an anchored popover; it does not navigate.
- On desktop the panel is 360px wide and at most 70vh high. On phones it uses the viewport width minus 32px and remains inside the screen.
- The panel has a heading and unread count, a scrollable recent list, and a link to the full inbox. A row has a concise title, secondary context, and time; unread state has a visible non-color cue.
- Mark-one-read and mark-all-read actions update the view immediately. Escape, outside click, or item selection closes the panel. Keyboard focus can reach its controls and returns to the bell after closing.
- Selecting a notification opens its related record when a destination exists. Notifications without a destination still expose their full message in the panel or inbox.
- The bell has an accessible name and unread count. Keep its badge clear of the icon and do not let it reduce the 44px hit area.
- Keep the full Notifications route for older items and inbox actions; the popover is for a quick check.

## 7. Task flow

Place a next action next to the record that makes it relevant. Only offer it when the current role, record status, ownership, and related-record state permit the action. Reuse the same eligibility rules as the server-backed selector and revalidate the record when the destination form loads.

Current example: an order detail can link directly to program creation when the signed-in user can create programs, can access that order's creation scope, the order is in an eligible state, and it has no program yet.

When implementing any shortcut, map actor permission, ownership scope, resource status, and related-resource state. Keep the button hidden when any prerequisite fails; then recheck eligibility on the destination page so a stale link cannot silently select an unavailable record. Do not render an overflow trigger unless at least one action inside it is available for this user and record state.

## 8. Review checklist

For each route family, inspect light and dark modes at 320px, 375px, 390px, 640px, 768px, 1024px, and 1440px. Check title/subtitle hierarchy, 4px-grid spacing, clipping and wrapping, table scroll, control target size, empty/loading/error/success states, hover/focus distinction, action visibility by role, and the route back to the originating task.

Review the public login/signup/forgot/reset routes; dashboard overview; each order, program, claim, customer, and user list/detail/create/edit route; reports; settings; notifications; and the shared shell in both expanded and collapsed states. For each guided form, inspect every step, field error, submit-pending state, and cancel/back route. For the sidebar, check logo/avatar centering and padding. For the bell and account menu, capture both closed and open states. Source inspection, HTTP status, and successful builds do not replace screenshot review.

If browser capture is unavailable, state that limitation. Continue with route inventory, source inspection, tests, typecheck, production build, and local HTTP checks, but mark screenshot-dependent findings as unverified instead of inferring visual quality.

## Motion and stable feedback

- Use short 120–200ms transitions and animate only the property that changes. Do not move a control under the pointer or keyboard focus.
- Respect `prefers-reduced-motion`; reduced-motion handling is part of the shared contract and must be preserved when introducing animation.
- Loading, empty, success, and error states should occupy a stable content region so the page does not jump unexpectedly. Keep messages and actions in the region associated with the operation.
