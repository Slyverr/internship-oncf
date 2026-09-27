# ECommand interface design system

This document is the shared UI contract for the Next.js application. Apply it to new screens and when revisiting existing ones. The goal is a calm, readable operations workspace where the next useful action is clear.

## 1. Layout and page rhythm

- Use a 4px base spacing unit. Choose spacing values from 4, 8, 12, 16, 24, and 32px; use 0 when no inset is needed. Prefer padding for component interiors and reserve margin for intentional relationships between separate blocks. Avoid one-off measurements and unexplained spacing classes.
- Every padding, gap, and margin must resolve to a multiple of 4px. Use the named spacing utilities where available (`gap-compact`, `gap-control`, `p-control`, `px-field`) and check the resolved pixels rather than judging by a Tailwind class number.
- Standard spacing aliases in this repo: 4px `gap-compact`, 8px `gap-control` / `px-control`, and 12px `px-field`. Larger layout gaps use the 4px-grid utilities (`gap-4`=16px, `gap-6`=24px, `gap-8`=32px). Choose by the resolved pixel value, not by a class name that looks familiar. Prefer named aliases for control insets and parent `gap` for layout rhythm.
- Use `p-control` / `px-control` for an 8px control inset and `px-field` for the 12px field inset. Use 16px (`p-4`) for mobile page gutters and 24px (`p-6`) for wider page gutters. Every new spacing choice should be deliberate and on the 4px grid.
- Dashboard content uses 16px gutters on small screens and 24px from tablet width upward, with a 2400px maximum content width for large 2K/4K displays. Keep page sections 24px apart. Keep related controls 8–16px apart and related sections inside a card 16–24px apart.
- The dashboard content grid has one shrinkable column (`minmax(0, 1fr)`) so wide child content cannot expand the page past the viewport. Give grid/flex children that contain wide data `min-w-0`; constrain overflow to the specific table region.
- Keep content width readable on ultrawide displays. Tables can use the available width, but text-heavy descriptions should have a readable maximum line length.
- Stack page headings and primary actions on narrow screens. Actions should wrap cleanly and remain easy to tap; do not shrink targets to gain density.
- Use responsive grids that start as one column. Introduce two columns only when each field/card has enough room to remain readable.

### Page composition and breakpoints

1. A page header pairs a clear title, a short supporting description, and the primary page action.
2. The next block groups related work under a visible section/card title. Avoid nested cards unless a second visual boundary is needed to separate a distinct task.
3. Below 640px, stack heading and actions, make form actions full width when it improves reach, and collapse multi-column cards/forms to one column. At tablet width, use two columns only when both remain readable.
4. Long values wrap. Buttons may wrap or stack; controls and type do not get smaller to fit. A 320px screen may scroll horizontally only inside a data-table region.
5. Form/detail text fields use a readable maximum width instead of stretching across ultrawide monitors. Data tables may use the remaining page width.
6. Public authentication routes share the ONCF-branded shell. Keep the form compact and centered below extra-large width; use a balanced brand-and-form split on wide screens. Reuse the existing transparent mark and semantic theme surfaces, and keep the form width readable.

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

Keep the existing warm light and charcoal dark palettes as the default themes. Appearance choices may also include monochrome light and monochrome dark themes. Keep these theme values separate behind the same semantic roles so components never branch on a theme name:

- `background` / `surface-canvas`: application canvas.
- `sidebar` / `surface-navigation`: persistent navigation surface.
- `card` / `surface-raised`: grouped content and data surfaces.
- `popover`: menus and transient overlays above the page.
- `primary`: the main action and restrained active-state cue.
- `muted` and `muted-foreground`: secondary surfaces and supporting information.
- `border`: grouping and control boundaries; prefer this over additional shadows.

Use the same semantic roles in all themes. Cards should separate from the canvas through the raised-surface token and a quiet border/ring, not an unexpectedly bright fill or heavy shadow. Hover is a small feedback cue, not a large decorative block. Focus indicators must remain visible and stronger than hover.

## 4. Cards, tables, and data

- Cards use one consistent radius, quiet outline, and 16px interior spacing on mobile / 24px from the `sm` breakpoint upward. The 44px control size and 16px table cell insets do not shrink on mobile.
- Tables use 14px text, aligned values, a restrained header style, and at least 16px horizontal and vertical cell insets on desktop. Keep row actions and links within their own hit areas.
- On narrow screens, let wide tables scroll inside their own container; do not compress important values until they collide. Ensure the scroll area can be reached by keyboard and communicates its purpose.
- When a table overflows on a phone, show a quiet “Scroll to see the remaining columns” hint below it while more columns remain. Hide the hint at the end of the scroll area and expose it to the scroll region through `aria-describedby` while it is visible.
- Use one label/value pattern in record details: muted 13px label, stronger 14–16px value, 8px separation, and wrapping for long values.
- A standard table row is at least 56px tall; a row with a title and supporting line is at least 64px. Give each cell its own inset and keep related values aligned by column. Use tabular numerals for comparable dates and quantities.
- Keep long values readable. Truncate only when the same record has a clear detail destination or the full value is available to assistive technology. On phones, preserve table column meaning inside the horizontal scroll area rather than squeezing text together.
- Empty, loading, error, and success states should occupy the same content region and provide the next useful action when one exists.

### Dialogs

- Use the shared `DialogContent` primitive so overlay, focus behavior, close control, motion, and surface styles stay consistent. Its default size is for focused tasks; use `size="wide"` for a bounded workspace such as Settings instead of repeating width calculations on each dialog.
- Keep a dialog title and short description visible while its body changes or scrolls. Dialogs should have one independently scrollable content area; add `min-h-0` to grid/flex children that need to shrink inside a bounded dialog.
- Keep close and primary-action targets at least 44px. On phones, leave 16px around the dialog, prevent horizontal overflow, and keep section navigation reachable before the scrolling body.
- Do not place a Card inside a dialog pane just to repeat the outer dialog surface. Use the shared Card only when it separates a genuinely distinct task or data group.

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
- Use one shared horizontal stepper for guided forms: numbered 32px circles, a thin connector behind them, completed steps with a check, and each short step title directly below its circle. Emphasize the current number and title with the primary token; keep upcoming steps quiet. Announce the current step and total in a polite live region. Do not make the indicator look like separate cards or shrink labels to fit; allow titles to wrap on narrow screens.
- Validate the active step before advancing, retain entered values when moving backward, and validate the whole form on final submission. Focus the first invalid control after an error; do not rely on color alone to identify it.
- Prevent duplicate submission while saving and preserve the user's context when Cancel returns to a previous record.
- Keep loading and pending feedback in the button or the form region being changed so the action does not appear to vanish or shift position.
- Async selectors distinguish loading, a successful empty result, and a failed fetch. Keep stale options usable when available, provide an inline retry for failures, and disable the control when no usable option remains.

## 6. Navigation and feedback

- Expanded sidebar hover may tint the full navigation row softly. In collapsed mode, keep the 44px target but make hover feedback local and subtle around the icon.
- Keep logo and profile controls centered with the same top/bottom breathing room in both sidebar states.
- Notifications open next to their trigger as a bounded popover. The full inbox remains a separate destination for reviewing older items.
- Transitions should be short and limited to the property that changes. Respect `prefers-reduced-motion`.
- Tooltips use the semantic popover surface, a quiet border, and compact 8px × 4px insets. Keep icon controls at their full hit size; the tooltip should label the control without becoming a large hover panel.

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

The dashboard may show compact Create order and Create claim actions beside its welcome heading, filtered by the user's effective create permissions. Keep program creation contextual to an eligible order so users do not start a program without a valid order.

When implementing any shortcut, map actor permission, ownership scope, resource status, and related-resource state. Keep the button hidden when any prerequisite fails; then recheck eligibility on the destination page so a stale link cannot silently select an unavailable record. Do not render an overflow trigger unless at least one action inside it is available for this user and record state.

## 8. Review checklist

For each route family, inspect light and dark modes at 320px, 375px, 390px, 640px, 768px, 1024px, 1440px, 1920px, 2560px, and 3840px. Check title/subtitle hierarchy, 4px-grid spacing, clipping and wrapping, table scroll, control target size, empty/loading/error/success states, hover/focus distinction, action visibility by role, keyboard/focus behavior, and the route back to the originating task. At 2K and 4K widths, confirm the shared 2400px content cap keeps forms and detail text readable while tables retain useful width.

Review the public login/signup/forgot/reset routes; dashboard overview; each order, program, claim, customer, and user list/detail/create/edit route; reports; settings; notifications; and the shared shell in both expanded and collapsed states. For each guided form, inspect every step, field error, submit-pending state, and cancel/back route. For the sidebar, check logo/avatar centering and padding. For the bell and account menu, capture both closed and open states. Source inspection, HTTP status, and successful builds do not replace screenshot review.

If browser capture is unavailable, state that limitation. Continue with route inventory, source inspection, tests, typecheck, production build, and local HTTP checks, but mark screenshot-dependent findings as unverified instead of inferring visual quality.

## 9. Appearance preferences and settings

- Provide five theme choices: System, Warm light, Charcoal dark, Monochrome light, and Monochrome dark. System follows the device preference. The existing warm/charcoal token values remain the defaults.
- Offer readable font choices (Inter, Geist, and the device system font) and three text sizes (Small, Default, Large). Change type scale without shrinking 44px hit areas or removing spacing; ensure labels, table values, dialogs, and long forms still wrap cleanly.
- Offer a reduced-motion override in addition to respecting the device's reduced-motion setting. New motion must retain the existing 120–200ms limit and must not be required to understand state.
- Store signed-in appearance preferences per user on the server so choices follow the account across devices. Use browser storage only as a fast initial display and local fallback when the API is unavailable. Do not key behavior off `NODE_ENV`.
- Show theme choices with small previews using the same semantic tokens as the application. The System preview should communicate that it follows both light and dark device modes; do not duplicate or alter palette values for previews.
- Settings open as a bounded dialog from the account menu. At 1024px and wider, use a fixed-width section navigation rail and a separately scrollable content pane; below that, show a horizontally scrollable section selector above the pane. Keep title, close action, and current section clear while content scrolls.
- Make appearance choices compact, visible, and easy to hit. Use concise labels and brief supporting text rather than tall description cards; keep every choice at least 44px high and do not hide choices behind extra scrolling when the viewport has room.
- Keep Appearance, Profile, and Security as the settings sections. Profile in the account menu opens the Profile section directly; Settings opens Appearance. Each section has a stable deep link, and closing returns to the page the user came from. A direct visit to the settings URL remains usable without requiring prior navigation.
- Target a dialog width of at most 1120px and a height of at most `100svh - 32px`. On small screens, use the available viewport with 16px outer spacing; do not let the close button overlap content or place nested scroll regions beside one another.

### Visual review rounds

1. **Structure and hierarchy:** check page title/subtitle scale, group boundaries, whitespace, first useful action, and whether content order follows the real task.
2. **Interaction and flow:** check control size, clear next/back actions, feedback and validation, role visibility, keyboard/focus behavior, and whether users can complete common work without repeated route switching.
3. **Responsive polish and resilience:** check 320px through 3840px, all four concrete themes, text-size/font choices, long labels, empty/error/pending states, motion settings, and clipping/overflow. Record screenshot evidence after each meaningful shared-component change.

## Motion and stable feedback

- Use short 120–200ms transitions and animate only the property that changes. Do not move a control under the pointer or keyboard focus.
- Respect `prefers-reduced-motion`; reduced-motion handling is part of the shared contract and must be preserved when introducing animation.
- Loading, empty, success, and error states should occupy a stable content region so the page does not jump unexpectedly. Keep messages and actions in the region associated with the operation.
