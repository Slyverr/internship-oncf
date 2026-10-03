# ECommand interface design system

This document is the shared UI contract for the Next.js application. Apply it to new screens and when revisiting existing ones. The goal is a calm, readable operations workspace where the next useful action is clear.

## 1. Layout and page rhythm

- Use a 4px base spacing unit. Choose spacing values from 4, 8, 12, 16, 24, and 32px; use 0 when no inset is needed. Prefer padding for component interiors and reserve margin for intentional relationships between separate blocks. Avoid one-off measurements and unexplained spacing classes.
- Every padding, gap, and margin must resolve to a multiple of 4px. Use the named spacing utilities where available (`gap-compact`, `gap-control`, `p-control`, `px-field`) and check the resolved pixels rather than judging by a Tailwind class number.
- The web test suite checks spacing utilities against the 4px grid. The claim conversation's 2px gap between adjacent bubbles is the documented exception; keep other spacing values on-grid.
- Standard spacing aliases in this repo: 4px `gap-compact` / `p-compact`, 8px `gap-control` / `px-control`, and 12px `px-field`. Larger layout gaps use the 4px-grid utilities (`gap-4`=16px, `gap-6`=24px, `gap-8`=32px). Choose by the resolved pixel value, not by a class name that looks familiar. Prefer named aliases for control insets and parent `gap` for layout rhythm.
- Use `oncf-field` for a label/control/help-text stack. It centralizes the field layout as a top-aligned grid with an 8px gap; helper or error text must not shift a sibling label or control in the same row. Do not repeat `space-y-2` or `grid gap-control` for this component pattern.
- Shared primitives in `components/ui` own the default styles for buttons, cards, tables, menus, and dialogs. `button.tsx` centralizes button variants and sizes; `control-styles.ts` centralizes Input, Textarea, and SelectTrigger surfaces; `oncf-field` and `workspace-form` centralize repeated form layouts. Reuse these instead of rebuilding their common class lists in feature screens. For shared compositions across primitives, use named utilities such as `oncf-field`, `oncf-dialog-surface`, and `menu-separator-spacing`; use existing compact spacing tokens for menu affordances. Keep one-off layout and feature variants local to their component rather than adding a utility for every repeated word or class.
- Standard buttons use a 44px hit area and 16px horizontal insets; `size="sm"` may use a tighter icon/text gap but must keep the same hit height and inset. Use `ActionLink` for button-like navigation links so they inherit the same link variant and sizing; use ordinary `Link` for content/navigation links that are not actions.
- Use `components/common/table-action-button.tsx` for text-labeled row actions such as Edit. This keeps their variant, icon placement, and hit area consistent across data tables. Icon-only table actions must keep an accessible label and tooltip. Represent reversible active/inactive state with the shared switch control in the status column. When it clarifies a compact status row, the switch may include its localized state label as a pill; keep the full control keyboard-operable with an accessible action name and confirm changes that affect record availability.
- Keep structural card media and device safe-area behavior in shared CSS rules/utilities rather than complex arbitrary Tailwind selectors; this preserves the same card image spacing and phone inset while avoiding malformed selector output during production CSS optimization.
- `Input`, `Textarea`, and `SelectTrigger` share the `controlSurfaceClasses` style from `components/ui/control-styles.ts` for borders, surfaces, shadows, focus rings, disabled state, and validation. Keep control-specific sizing and layout in each primitive.
- Use `p-control` / `px-control` for an 8px control inset and `px-field` for the 12px field inset. Use 16px (`p-4`) for mobile page gutters and 24px (`p-6`) for wider page gutters. Every new spacing choice should be deliberate and on the 4px grid.
- Dashboard content uses 16px gutters on small screens and 24px from tablet width upward. Both workspace layouts use the same 1536px page-content cap to keep reading and scanning distances consistent. Tables use the available width within that container and scroll only inside their own region when their columns need more room. Keep page sections 24px apart. Keep related controls 8–16px apart and related sections inside a card 16–24px apart.
- When both the eligible-order action and order-activity chart are visible, stack them vertically below the `@4xl/workspace` breakpoint so each card keeps its natural height and the page does not reserve space for an offscreen slide. Use two balanced columns from `@4xl/workspace` upward. Keep the order action directly available, preserve the full order identifier, and keep chart labels readable.
- Dashboard recent-activity panels use equal-height 224px cards and show up to two recent records, with single-line truncation and a View all link to the complete list. When the workspace is narrower than 448px, place the cards in a keyboard-scrollable, snap-aligned horizontal rail with an adjacent-card preview and visible scroll hint. At wider workspaces, two visible panels may use two columns from 1024px; three panels use three columns from 1280px to avoid leaving a lone panel on a second row.
- The dashboard content grid has one shrinkable column (`minmax(0, 1fr)`) so wide child content cannot expand the page past the viewport. Give grid/flex children that contain wide data `min-w-0`; constrain overflow to the specific table region.
- Keep content width readable on ultrawide displays. Tables can use the available width, but text-heavy descriptions should have a readable maximum line length. The shared workspace shell caps page content. Entity create/edit routes use `workspace-form`: the page title spans the normal workspace column, while the stepper, form card, and actions share a centered 1024px regular / 1280px wide-workspace body cap. New forms should use this shared rule rather than copy width utilities. A workspace layout preference changes only the shared application shell; page components stay the same.
- Stack page headings and primary actions on narrow screens. Actions should wrap cleanly and remain easy to tap; do not shrink targets to gain density.
- Use responsive grids that start as one column. Introduce two columns only when each field/card has enough room to remain readable.
- `DashboardShell` owns the exhaustive workspace-layout registry. Add shell variants there and in the shared appearance preference contract; keep route pages independent of the selected shell.
- The shell exposes its usable content area as the named `workspace` container. Use `@…/workspace` container queries for form, detail, and dashboard columns so a sidebar or centered content cap is included in the available-width calculation. Use viewport breakpoints for viewport-level behavior such as mobile navigation.
- On phones, the centered header keeps the brand and account actions in its first row and places section navigation in a separate, horizontally browsable row below. Hide breadcrumbs on phones, where the compact trail otherwise looks like a floating label, and reserve a 24px slot so deeper routes do not shift the page title vertically. Keep the effective gap from that slot to page content at 8px; apply the same reserved space when the trail is hidden. At wider sizes, hide the lone root `Dashboard` label and show the full trail only on deeper routes.
- Workspace content starts at the top. When a shell main area fills the viewport, align its grid tracks with `content-start` so sparse pages do not spread their sections down the page.

### Page composition and breakpoints

1. A page header pairs a clear title, a short supporting description, and the primary page action.
2. The next block groups related work under a visible section/card title. Avoid nested cards unless a second visual boundary is needed to separate a distinct task.
3. Stack page headings and actions until their workspace container is at least 1024px wide; do not base this choice on viewport width alone because the sidebar reduces available space. Below 640px, make form actions full width when it improves reach and collapse multi-column cards/forms to one column. At tablet width, use two columns only when both remain readable.
4. Long values wrap. Buttons may wrap or stack; controls and type do not get smaller to fit. A 320px screen may scroll horizontally only inside a data-table region.
5. Form/detail text fields use a readable maximum width instead of stretching across ultrawide monitors. Data tables may use the remaining page width.
6. Contextual page sections (such as reference-data categories) use clearly labeled controls aligned with the page title and content at every breakpoint. Keep their content at the shared workspace start and width. Reserve detached icon rails for persistent application-shell navigation; a few page categories should not become unexplained floating icons. Reference-data management uses one flat, full-width table per category; create and edit forms open in the shared fixed-size form dialog. Do not render editable controls in every table row or place the table inside a second nested card.
7. Public authentication routes share the ONCF-branded shell and theme selector. Anchor auth content near the top on phones so sparse forms do not float in the middle of a tall screen; let long forms grow and scroll on short viewports. On wider screens, center the compact shell and use a balanced brand-and-form split on large displays, with one stable desktop shell height across login and signup. Keep both forms at the same readable width. Signup uses the shared two-step progress pattern to separate company details from sign-in details while preserving entered values. Password guidance comes from the shared API-enforced policy: show one short hint before entry, then only unmet requirements; report confirmation mismatch inline.

## 2. Type hierarchy

| Purpose | Treatment |
| --- | --- |
| Page title | 24px on small screens, 30px on larger screens; semibold, tight leading |
| Page description | 14px / 24px line height, muted; keep clearly subordinate to the title |
| Card/section title | 16px, semibold |
| Body and table values | 14px with comfortable line height |
| Form labels and metadata | 13–14px, medium for labels, muted for supporting values |
| Timestamps and quiet metadata | 9px micro text, muted; keep visually attached to the content it qualifies |
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

Use the same semantic roles in all themes. Cards should separate from the canvas through the raised-surface token and a quiet border/ring, not an unexpectedly bright fill or heavy shadow. Hover is a small feedback cue, not a large decorative block. Focus indicators must remain visible and stronger than hover. Preserve the orange ONCF source mark in monochrome themes with the shared `oncf-brand-surface` and `oncf-brand-mark` tokens; do not invert it to white on a white tile. Keep brand treatment semantic so sidebar and centered-header logos stay consistent.

## 4. Cards, tables, and data

- Cards use one consistent radius, quiet outline, and 16px interior spacing on mobile / 24px from the `sm` breakpoint upward. The 44px control size and 16px horizontal table cell insets do not shrink on mobile.
- Tables use 14px text, aligned values, a restrained header style, 16px horizontal cell insets, and a shared 4px vertical inset. Keep row actions and links within their own 44px hit areas so rows stay comfortably clickable without excess height; let wrapped content grow naturally.
- Keep empty-state table copy visible at the initial horizontal scroll position on phones; left-align and wrap it there, then center it on wider screens. Give empty rows a deliberate inset so they remain distinct from the header and surrounding card.
- On narrow screens, let wide tables scroll inside their own container; do not compress important values until they collide. Ensure the scroll area can be reached by keyboard and communicates its purpose.
- When a table overflows, show a quiet “Scroll to see the remaining columns” hint above it while more columns remain, including at tablet widths where the workspace is narrowed by the sidebar. Hide the hint at the end of the scroll area and expose it to the scroll region through `aria-describedby` while it is visible.
- Use one label/value pattern in record details: keep the muted 13px label and stronger 14–16px value in a two-column row at all widths, with the label on the left and the value aligned right. Keep 8px column separation, use `min-w-0`, and let long values wrap within their column.
- A standard table row is at least 56px tall; a row with a title and supporting line is at least 64px. Give each cell its own inset and keep related values aligned by column. Use tabular numerals for comparable dates and quantities.
- Keep long values readable. Truncate only when the same record has a clear detail destination or the full value is available to assistive technology. On phones, preserve table column meaning inside the horizontal scroll area rather than squeezing text together.
- Empty, loading, error, and success states should occupy the same content region and provide the next useful action when one exists. In tables, distinguish a truly empty resource from a search/filter with no matches; offer the contextual create action or one-step filter reset. Anchor empty-state content to the visible scroll viewport on narrow tables, and center it only when the table region is wide enough to show its full columns.

### Dialogs

- Use the shared `DialogContent` primitive so overlay, focus behavior, close control, motion, and surface styles stay consistent. Choose a named size so repeated dialogs keep a stable footprint: default is 448px wide × 384px high, form is 512px × 576px, conversation is 672px × 640px, settings is 896px × 640px, and wide is 1120px × 768px. Confirmation dialogs use a compact size (448px × 272px on tablet/desktop; 448px × 320px on phones) and a form size (512px × 400px). Each size is capped by 16px viewport insets on shorter or narrower screens.
- Keep the dialog close icon inside the shared `DialogHeader` flex row, aligned opposite the title/description stack. Do not position it independently with absolute coordinates; keep its 44px target and use the same header alignment in every regular dialog.
- Every shared dialog is capped at the viewport height minus 32px and width minus 32px. `DialogContent` and `AlertDialogContent` provide fixed header/body/footer grid rows; use the matching header, one body, and footer primitives in that order. The body owns scrolling while the heading and actions stay visible. Add `min-h-0` to nested grid/flex children that need to shrink inside the body. Confirmation dialogs use the same viewport bounds and fixed action row.
- Keep the shared dialog surface above app chrome and fixed mobile navigation, with its backdrop directly below the surface. Apply these shared layers in both `Dialog` and `AlertDialog`; individual dialog content must not choose its own stacking level.
- Keep close and primary-action targets at least 44px. On phones, leave 16px around the dialog, prevent horizontal overflow, and keep section navigation reachable before the scrolling body.
- Use labeled dropdowns for workspace layout, color theme, font family, text size, and motion so choices stay compact and cannot overflow theme cards. Keep each select at least 44px high and show a concise description of the selected value. Keep the three settings sections in a horizontally reachable, scrollbar-free mobile tab row and preserve the dialog's fixed outer size. Implement the section switcher as keyboard-operable tabs with arrow-key and Home/End navigation.
- Organize Appearance controls as two groups once the settings pane has at least 42rem of usable width: layout and theme together, then font, text size, and motion together. Below that pane width, stack the fields in one column.
- Do not place a Card inside a dialog pane just to repeat the outer dialog surface. Use the shared Card only when it separates a genuinely distinct task or data group.

### Row and list patterns

- Keep a standard data row at least 56px high; use 64px or more when the row contains a title and supporting text.
- Separate row title and subtitle by 4px. Keep the title at 14–16px and the subtitle at 13–14px, muted. Do not truncate unless a detail destination or accessible full value is available.
- Keep row actions in a trailing aligned area with 44px targets. Do not make a tiny text string the only clickable area when the whole row is intended to navigate.
- At narrow widths, let metadata wrap under the title and move secondary actions to another line or a menu instead of compressing the main value.

## 5. Forms and controls

- Inputs, selects, buttons, and menu items retain a 44px minimum interaction height where practical.
- Text inputs, select triggers, and searchable comboboxes use the same semantic `background` surface and border. For composed fields, apply the surface to the outer control group and keep its inner input transparent so the whole control reads as one field.
- Select option lists open beside the trigger instead of aligning the selected option over the field. Let viewport collision handling flip the list when needed; only opt into item-to-trigger alignment for a reviewed interaction that benefits from it.
- Standard primary and secondary actions keep at least 12px horizontal and 8px vertical padding. Icon glyphs are generally 16px or 20px inside a larger hit area.
- Keep the keyboard focus ring visible and distinct from hover. Give icon-only controls an accessible name; a tooltip supplements that name but does not replace it.
- Keep form label-to-control spacing at 8px. Keep related fields 16px apart. Place inline validation below its label and above the control so long errors never compete for horizontal space with labels; use the destructive semantic color.
- Keep an invalid custom selector visibly marked after focus moves away. Use `oncf-invalid-control` on its field wrapper so nested input groups and select triggers receive the destructive border.
- Put labels above controls and helper/error copy directly below them. Pair fields only when both columns remain readable; stack them below tablet width. Textareas should show enough lines to communicate that they accept longer text.
- Guided forms state the current step, the information needed at that step, and the next action. Back, Cancel, and submit placement must stay consistent between entity forms.
- Give each guided route a page-level heading and short task description aligned to the normal page content column. Keep its stepper, active form card, and actions in one centered form column so controls do not drift across wide screens; use the shared `workspace-form` body cap of 1024px, expanding to 1280px when the available workspace is wide. Let the column fill the available width on phones.
- Use one shared horizontal stepper for guided forms: numbered 32px circles, a thin connector behind them, completed steps with a check, and each short step title directly below its circle. Emphasize the current number and title with the primary token; keep upcoming steps quiet. Announce the current step and total in a polite live region. Do not make the indicator look like separate cards or shrink labels to fit; allow titles to wrap on narrow screens.
- Validate the active step before advancing, retain entered values when moving backward, and validate the whole form on final submission. Focus the first invalid control after an error; do not rely on color alone to identify it.
- Prevent duplicate submission while saving and preserve the user's context when Cancel returns to a previous record.
- Keep loading and pending feedback in the button or the form region being changed so the action does not appear to vanish or shift position.
- Async selectors distinguish loading, a successful empty result, and a failed fetch. Keep stale options usable when available, provide an inline retry for failures, and disable the control when no usable option remains.

## 6. Navigation and feedback

- Expanded sidebar hover may tint the full navigation row softly. In collapsed mode, keep the 44px target but make hover feedback local and subtle around the icon.
- Keep logo and profile controls centered with the same top/bottom breathing room in both sidebar states.
- Notifications open next to their trigger as a bounded popover. The full inbox remains a separate destination for reviewing older items.
- On phones with fixed bottom navigation, cap select popups at 24rem or the available collision height, whichever is smaller. Keep long option lists scrollable inside the popup so they do not cover the navigation bar. Use the viewport's available popup height from the `md` breakpoint upward.
- Claim conversations open from the claim detail header in the named 672px × 640px dialog. Use a one-line claim-specific title, compact content-fitting bubbles with an avatar beside the last incoming message in each sender group, and date separators (Today, Yesterday, or a short date) when there are multiple days or the conversation is from an older day. In a sender group, soften only the corners where adjacent bubbles meet; keep the outer corners fully rounded. Keep message times hidden by default; desktop hover or a tap reveals a small time below the bubble, aligned to the sender's outer edge. Only one message time may be visible at a time. Keep times available to assistive technology. Enter sends a reply; Shift+Enter inserts a line break. Keep chronological replies with the newest at the bottom, and scroll to the latest reply when opened. Keep the growing reply field and send button visually joined at the bottom of the scrollable history. Show an unread dot only for unread comment notifications on that claim; opening the conversation marks those comment notifications as read. Client replies notify the commercial-agent queue; agent replies notify the claim creator.
- Leave 2px between adjacent messages in one sender group and 12px before a different sender group. The 2px group gap is a deliberate exception to the general 4px spacing grid for this chat pattern.
- Transitions should be short and limited to the property that changes. Respect `prefers-reduced-motion`.
- Tooltips use the semantic popover surface, a quiet border, and compact 8px × 4px insets. Keep icon controls at their full hit size; the tooltip should label the control without becoming a large hover panel.

### Application shell measurements

- The header is 64px high. The mobile sidebar sheet is 288px wide, bounded by the viewport; the expanded desktop sidebar is 256px.
- The collapsed desktop rail is 64px wide. Keep logo and avatar marks at 32px and center them in 44px controls. Header and footer groups stay 64px tall in both states, with the controls vertically centered; keep icon targets at 44px.
- In the collapsed rail, center every logo/avatar/menu icon. Remove internal horizontal button padding and any gap left by a hidden label when either would displace the icon; retain the full button target and the rail's outer breathing room.
- Keep the brand art inside its tile without stretching the logo to a square. If an asset includes transparent canvas, size/crop it by its visible content proportions and preserve the complete wordmark where there is room.
- Expanded navigation hover may tint its full 44px row using a low-opacity accent. Collapsed hover changes the icon/foreground gently without filling the whole target. Focus uses the visible ring and remains distinct from hover.
- Keep the footer anchored below the independently scrollable navigation. Group labels have a distinct treatment and may hide when collapsed. The collapsed logo, each nav icon, and the profile control need accessible names/tooltips; account name and role may hide in the rail.
- On mobile, open navigation in a sheet bounded by the viewport and close it after a route is selected.

### Notifications

- The bell stays a 44px button in the top bar. Clicking opens an anchored popover; it does not navigate.
- On desktop the panel is 360px wide and at most 70vh high. On phones it uses the viewport width minus 32px; give the positioning primitive 16px collision padding so it keeps an even inset when anchored near the screen edge.
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

For each route family, inspect light and dark modes at 320px, 375px, 390px, 640px, 768px, 1024px, 1440px, 1920px, 2560px, and 3840px. Check title/subtitle hierarchy, 4px-grid spacing, clipping and wrapping, table scroll, control target size, empty/loading/error/success states, hover/focus distinction, action visibility by role, keyboard/focus behavior, and the route back to the originating task. At 2K and 4K widths, confirm each workspace's content cap keeps forms and detail text readable while tables retain useful width.

Review the public login/signup/forgot/reset routes; dashboard overview; each order, program, claim, customer, and user list/detail/create/edit route; reports; settings; notifications; and the shared shell in both expanded and collapsed states. For each guided form, inspect every step, field error, submit-pending state, and cancel/back route. For the sidebar, check logo/avatar centering and padding. For the bell and account menu, capture both closed and open states. Source inspection, HTTP status, and successful builds do not replace screenshot review.

If browser capture is unavailable, state that limitation. Continue with route inventory, source inspection, tests, typecheck, production build, and local HTTP checks, but mark screenshot-dependent findings as unverified instead of inferring visual quality.

## 9. Appearance preferences and settings

- Provide five theme choices: System, Warm light, Charcoal dark, Monochrome light, and Monochrome dark. System follows the device preference. The existing warm/charcoal token values remain the defaults.
- Set the root `color-scheme` from the effective theme so native scrollbars and browser controls use the matching light or dark appearance.
- Offer Inter, Geist, device system UI, Arial-compatible sans, Georgia serif, and monospace font stacks. Keep choices in the shared appearance contract, apply each family to page and component headings, and derive API validation and database constraints from the same list. Offer three text sizes (Small, Default, Large). Change type scale without shrinking 44px hit areas or removing spacing; ensure labels, table values, dialogs, and long forms still wrap cleanly.
- Offer a clear “Reduce motion” override in addition to respecting the device's reduced-motion setting. Show appearance loading/saving/synced/local-fallback feedback beside the Settings title, using a restrained spinner while loading/saving and a concise status when complete. New motion must retain the existing 120–200ms limit and must not be required to understand state.
- Store signed-in appearance preferences per user on the server so choices follow the account across devices. Mirror the small, non-sensitive preference object and user ID to a same-site browser cookie so authenticated server rendering can select the saved shell before hydration without waiting for the API. Accept that cache only when its user ID matches the access token subject. The client revalidates against the account preference endpoint after hydration, keeping server preferences authoritative across devices. Keep local storage as the immediate fallback when cookies or the API are unavailable, and apply that fallback in a browser layout effect before the first paint so a saved shell is not visibly replaced after rendering. Do not key behavior off `NODE_ENV`.
- Keep shell choices in the same workspace preference contract. The current options are Sidebar (the default) and Centered icon bar; both reuse the same permission-filtered route list and semantic theme tokens. Preserve the user's selected shell at desktop and ultrawide widths; viewport breakpoints may adapt that shell's navigation and spacing, but must not silently replace the saved layout choice. These choices describe capabilities shipped by the application, so define them in `packages/shared` and derive validation/database constraints from that list. Do not create a database reference table for code-owned UI variants; reserve reference data for business catalogs that need database-managed records. Add future shell variants through this contract and the shell registry rather than branching individual pages.
- The centered icon bar pins its header surface to the top of the viewport and aligns its base edges with the 1536px page-content cap. Keep the top corners square and use 16px rounded lower corners. Use the browser-standard border-radius shape; do not add custom outward top curves. At tablet and desktop widths, use three equal grid tracks: align the brand to the left edge of the first track, center permission-filtered 44px icon links in the middle track, and align account actions to the right edge of the last track. All three groups inherit the same header padding; do not compensate with one-sided offsets. At phone widths, hide the brand mark and wordmark and show the layout switch, notifications, and profile in a compact panel attached to the top-right edge, with square top/right edges and a rounded lower-left corner. Put permission-filtered icon navigation in a full-width fixed bottom bar, above the device safe area, and reserve page padding so it does not cover content. Keep an 8px gap and 16px side inset between phone navigation controls; center the group when it fits and allow horizontal scrolling on narrower screens. Do not add directional buttons. The icon row scrolls by touch, trackpad, or keyboard, and the active destination remains visible after route changes. Route names remain available to assistive technology and on hover/focus.
- When a user has one linked customer, show its name beside the ONCF mark in the centered desktop header and as a third muted line in the sidebar account card. Truncate long names within their shell region; hide this identity with the rest of the brand on phones and when no customer is assigned. Use the customer account ID as a fallback label only when the linked name is unavailable.
- Provide a layout-switch action in both desktop shells and in each phone header's top-right account/control group beside notifications and profile. The sidebar layout keeps its drawer trigger at the left; the centered layout keeps page navigation in its fixed bottom bar. Use the same 32px visual control size, 8px gaps, and 44px effective touch targets for the switch, bell, and avatar in both phone headers. The centered group's surface stays attached to the top-right corner; do not add one-sided offsets or duplicate fixed widths. The switch changes directly between Sidebar and Centered icon bar through the shared appearance preference setter, so the local view changes immediately and the signed-in preference sync saves it across devices. Its accessible name and tooltip describe the destination layout.
- Show theme choices with small previews using the same semantic tokens as the application. The System preview should communicate that it follows both light and dark device modes; do not duplicate or alter palette values for previews.
- Settings open as a bounded dialog from the account menu. At 1024px and wider, use a fixed-width section navigation rail and a separately scrollable content pane; below that, show a horizontally scrollable section selector above the pane. Keep title, close action, and current section clear while content scrolls.
- Make appearance choices compact, visible, and easy to hit. Use concise labels and brief supporting text rather than tall description cards; keep every choice at least 44px high and do not hide choices behind extra scrolling when the viewport has room.
- Keep Appearance, Profile, and Security as the settings sections. Profile in the account menu opens the Profile section directly; Settings opens Appearance. Each section has a stable deep link, and closing soft navigation returns to the page the user came from. A direct visit or refresh at the settings URL keeps Settings in a dialog above the Dashboard and closes to `/dashboard`.
- Show the signed-in user's linked customer name and code as read-only Profile details when a customer is assigned. The current user model has one active customer assignment; do not show a switcher until multi-customer selection is supported by account scoping and workflows.
- Target a dialog width of at most 1120px and a height of at most 768px or `100svh - 32px`, whichever is smaller. Keep its footprint stable when switching settings sections. On small screens, use the available viewport with 16px outer spacing; do not let the close button overlap content or place nested scroll regions beside one another.
- Keep the Settings dialog title strip to a short title, compact appearance sync status, and centered close control in one 56px flex row; each section owns its descriptive copy. Form fields use the semantic `background` surface so they remain distinct from cards and dialogs in every theme.

### Visual review rounds

1. **Structure and hierarchy:** check page title/subtitle scale, group boundaries, whitespace, first useful action, and whether content order follows the real task.
2. **Interaction and flow:** check control size, clear next/back actions, feedback and validation, role visibility, keyboard/focus behavior, and whether users can complete common work without repeated route switching.
3. **Responsive polish and resilience:** check 320px through 3840px, all four concrete themes, text-size/font choices, long labels, empty/error/pending states, motion settings, and clipping/overflow. Record screenshot evidence after each meaningful shared-component change.

Before changing a reviewed screen, capture the full relevant route and interaction-state matrix at every required viewport. Inspect the images themselves and compare the page title, navigation, first content edge, content width, panel boundaries, control alignment, text hierarchy, scroll behavior, and key-action reachability across sizes. Zero horizontal overflow does not establish that the layout is correct. Write down the visible problems, compare plausible layout approaches, and choose the one that fits the task and workspace rules. After changes, capture the same matrix and compare each result with its before image.

### Screenshot inspection protocol (required)

Treat every screenshot as a rendered UI that must be inspected element-by-element, not as evidence that a route merely loaded. For each capture:

1. **Confirm the evidence:** verify route, signed-in role, viewport dimensions, theme, layout mode, and interaction state from the capture manifest/browser state. Reject stale, mislabeled, clipped, or loading-state images; recapture them before review.
2. **Trace the page structure:** inspect the top and bottom edges, shell/header, breadcrumbs, title and subtitle, each card/section, every visible row and column, fixed navigation, and primary actions. Inspect the full page, including scrolled regions, rather than only the first viewport. Capture scrolled regions as ordinary viewport screenshots (for example, `bun run ui:review -- --scroll-y 600`); Chrome's full-document screenshot can misplace fixed or sticky shell controls, so do not use it to assess their layout.
3. **Compare repeated patterns:** line up equivalent labels, values, badges, buttons, table headers/cells, and card titles across rows, cards, routes, roles, and viewport sizes. Labels in paired detail rows share one column; all values—including badges—share the opposite edge. A badge must not sit beside its label or float midway across the row. Check baselines, row heights, insets, gaps, and wrap/truncation behavior.
4. **Check all content, not just geometry:** read the visible text and verify hierarchy, contrast, legibility, localization key usage, icon meaning, and state/action correctness. Check long and short values, empty/loading/error/success states, and content-specific affordances.
5. **Check task and role behavior:** verify that each visible action is available to that role and state, inaccessible actions are absent, and the next useful task is obvious. Exercise relevant open/closed, hover/focus, validation, and menu states rather than inferring them from a static page.
6. **Compare the matrix:** compare the same element across required widths/themes/layouts and against related routes. Record each defect with route, role, state, viewport, exact element, and observed mismatch. Do not close an item because overflow is zero or a screenshot exists.
7. **Recheck the fix:** capture the changed route/state at the same affected viewports and inspect the same elements again. Also inspect at least one adjacent route using any changed shared component.

Do not claim a visual audit is complete while any captured image has not been looked at, any visible mismatch lacks a disposition, or a required route/state/role is represented only by source inspection. When tool/runtime limits prevent this inspection, say exactly which images or states remain unverified.

## Motion and stable feedback

- Use short 120–200ms transitions and animate only the property that changes. Do not move a control under the pointer or keyboard focus.
- Respect `prefers-reduced-motion`; reduced-motion handling is part of the shared contract and must be preserved when introducing animation.
- Loading, empty, success, and error states should occupy a stable content region so the page does not jump unexpectedly. Keep messages and actions in the region associated with the operation.
