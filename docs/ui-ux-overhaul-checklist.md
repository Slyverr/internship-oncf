# UI/UX overhaul checklist

This is the running review list for the application-wide usability and visual overhaul. Check an item only after reviewing its current implementation at relevant screen sizes, making the change, and verifying the rendered result. Keep changes focused and preserve the existing ECommand stack and business rules.

## Review matrix

| # | Area | Required review and acceptance evidence | Status |
| --- | --- | --- | --- |
| 1 | Login and registration | Remove redundant nested surfaces and unnecessary explanation; fix the registration form's field layout and logo fit. Review phone, laptop, 2K, and 4K captures. | Complete |
| 2 | Order creation | Check the form's usable width, grouping, step navigation, validation, and action placement at phone, tablet, laptop, and wide widths. | Complete |
| 3 | Menus | Review account and other dropdown hover/focus shapes, item insets, active state, keyboard use, and touch behavior. | To review |
| 4 | Button surfaces | Find light-theme buttons that look like unbounded white text; set a consistent semantic surface, border, or restrained elevation. Check every button variant in both themes. | To review |
| 5 | Settings controls | Apply the button/surface review to settings, including close, tabs, selected preferences, and save/discard actions. | In progress |
| 6 | Sidebar alignment | Compare expanded and collapsed logo, nav, and account alignment; keep header/footer padding and navigation centers consistent. | To review |
| 7 | Sidebar motion | Add restrained, reduced-motion-aware transitions for collapse/expand and content state changes; verify no abrupt layout shift. | To review |
| 8 | Dashboard content | Replace the sparse three-panel impression with useful role- and permission-aware metrics, trends, and prioritized next actions based on available data. | To review |
| 9 | Workspace width consistency | Compare dashboard and all inner routes under both shell layouts at laptop through 4K widths. Use one shared content-width rule per shell and prevent unexplained route-specific centering. | To review |
| 10 | Table density | Review header, row, cell padding, wrapping, and phone overflow. Add a user-controlled density preference only if the responsive behavior still benefits from it. | To review |
| 11 | Appearance options | Keep themes, fonts, text scale, motion, and layouts extensible and understandable. Review whether a bounded text-scale control is more useful than only three presets; retain sensible defaults and database sync. | To review |
| 12 | Notifications | Review trigger, panel size, spacing, typography, empty/loading states, action reachability, and dismissal behavior on touch and desktop. Keep keyboard access; do not make hover the only way to open it. | To review |
| 13 | Sidebar inset details | Recheck collapsed-state padding and the relationship between logo, navigation, profile, and shell breadcrumbs after alignment changes. | To review |
| 14 | Shared visual styles | Inventory repeated card, control, field, table, and dialog classes. Extract stable patterns into named utilities or shared components where that improves consistency without hiding feature-specific behavior. | To review |
| 15 | Full route and state audit | Capture all routes and meaningful loading, empty, error, success, permission, and dialog states; record findings and assess the work in three passes before closing the overhaul. | In progress |

## Screenshot coverage

Review both light and dark appearances, and both workspace layouts where the route is protected. Use at least these viewport widths: 320, 390, 768, 1024, 1440, 2560, and 3840px. Check page edges, readable content width, horizontal overflow, focus targets, text wrapping, and whether key actions stay reachable. Keep captures local to the review session unless a durable visual artifact is needed.

## Completed groundwork

- Shared shell and centered-header layout rules, page-start alignment, and breadcrumb placement are documented in [the design system](design-system.md).
- Centered phone navigation now separates account actions from section links, keeps the active route visible, and reserves a stable breadcrumb slot.
- Guided form columns share a consistent maximum width and page-level headings.
- The settings dialog keeps a fixed footprint; appearance choices now fit compactly on common phone widths and avoid clipping at 320px.
- Login and registration now use a flat form surface inside the shared auth layout, with the repeated login explanation and nested form cards removed. The ONCF mark fits fully; fresh captures at 320, 390, 768, 1440, 2560, and 3840px showed no horizontal overflow. Registration keeps readable grouped fields on desktop and stacks them at phone width.
- Order creation now centers in the available workspace, filling the regular 5xl form column and expanding to 7xl only in very wide workspaces. Fresh authenticated captures at 390, 768, 1440, and 2560px had no horizontal overflow; the form measured 358px on phone, 464px on tablet, 1024px on laptop, and 1280px on the wide display.

## Working rules

- Keep the 4px spacing scale, semantic theme tokens, readable text sizes, and practical 44px interaction targets.
- Preserve current theme colors while improving component surfaces. Do not describe custom tokens as official ONCF colors.
- Follow the repository's commit scopes and run `bun run verify:commit` before every commit.
- Update this checklist with concrete evidence as each area is reviewed; do not mark the overall overhaul complete while any required item or screen state remains unverified.
