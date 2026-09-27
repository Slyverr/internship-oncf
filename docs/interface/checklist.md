# UI/UX overhaul checklist

This is the running review list for the application-wide usability and visual overhaul. Check an item only after reviewing its current implementation at relevant screen sizes, making the change, and verifying the rendered result. Keep changes focused and preserve the existing ECommand stack and business rules.

## Review matrix

| # | Area | Required review and acceptance evidence | Status |
| --- | --- | --- | --- |
| 1 | Login and registration | Remove redundant nested surfaces and unnecessary explanation; fix the registration form's field layout and logo fit. Show concise API-backed password validation, keep the desktop auth shell the same size for both routes, add a public theme selector and a soft route transition, then review phone, laptop, 2K, and 4K captures. | In progress |
| 2 | Order creation | Check the form's usable width, grouping, step navigation, validation, and action placement at phone, tablet, laptop, and wide widths. | Complete |
| 3 | Menus | Review account and other dropdown hover/focus shapes, item insets, active state, keyboard use, and touch behavior. | To review |
| 4 | Button surfaces | Find light-theme buttons that look like unbounded white text; set a consistent semantic surface, border, or restrained elevation. Check every button variant in both themes. | To review |
| 5 | Settings controls | Review dialog title area, fixed size, option density, touch targets, save state, close, tabs, and profile/security actions. | In progress |
| 6 | Sidebar alignment | Compare expanded and collapsed logo, nav, and account alignment; keep header/footer padding and navigation centers consistent. | Complete |
| 7 | Sidebar motion | Add restrained, reduced-motion-aware transitions for collapse/expand and content state changes; verify no abrupt layout shift. | Complete |
| 8 | Dashboard content | Replace the sparse three-panel impression with useful role- and permission-aware metrics, trends, and prioritized next actions based on available data. Surface eligible order-to-program actions without bypassing server rules. | In progress |
| 9 | Workspace width consistency | Compare dashboard and all inner routes under both shell layouts at laptop through 4K widths. Use one shared content-width rule per shell and prevent unexplained route-specific centering. | Complete |
| 10 | Table density | Review header, row, cell padding, wrapping, and phone overflow. Add a user-controlled density preference only if the responsive behavior still benefits from it. | To review |
| 11 | Appearance options | Keep themes, fonts, text scale, motion, and layouts extensible and understandable. Review whether a bounded text-scale control is more useful than only three presets; retain sensible defaults and database sync. | To review |
| 12 | Notifications | Review trigger, panel size, spacing, typography, empty/loading states, action reachability, and dismissal behavior on touch and desktop. Keep keyboard access; do not make hover the only way to open it. | In progress |
| 13 | Sidebar inset details | Recheck collapsed-state padding and the relationship between logo, navigation, profile, and shell breadcrumbs after alignment changes. | Complete |
| 14 | Shared visual styles | Inventory repeated card, control, field, table, and dialog classes. Extract stable patterns into named utilities or shared components where that improves consistency without hiding feature-specific behavior. | Complete |
| 15 | Full route and state audit | Capture all routes and meaningful loading, empty, error, success, permission, and dialog states. Review every form control for clear labels, useful examples/placeholders, hints, autocomplete/input modes, and validation feedback; record findings and assess the work in three passes before closing the overhaul. | In progress |
| 16 | Documentation organization | Group docs into clear topic folders, use one-word Markdown filenames when they stay clear, and keep contributor links current. | Complete |

## Screenshot coverage

Review both light and dark appearances, and both workspace layouts where the route is protected. Use at least these viewport widths: 320, 390, 768, 1024, 1440, 2560, and 3840px. Check page edges, readable content width, horizontal overflow, focus targets, text wrapping, and whether key actions stay reachable. Keep captures local to the review session unless a durable visual artifact is needed.

## Completed groundwork

- Shared shell and centered-header layout rules, page-start alignment, and breadcrumb placement are documented in [the design system](system.md).
- Centered phone navigation now separates account actions from section links, keeps the active route visible, and reserves a stable breadcrumb slot.
- Guided form columns share a consistent maximum width and page-level headings.
- The order create form centers in its workspace and uses a larger cap only on ultrawide displays.
- The settings dialog keeps a fixed footprint; appearance choices now fit compactly on common phone widths and avoid clipping at 320px.
- Login and registration now use a flat form surface inside the shared auth layout, with the repeated login explanation and nested form cards removed. The ONCF mark fits fully; fresh captures at 320, 390, 768, 1440, 2560, and 3840px showed no horizontal overflow. Registration keeps readable grouped fields on desktop and stacks them at phone width; the password and confirmation controls align. Password validation now shows one compact policy hint, then only unmet requirements and confirmation feedback. The shared policy remains enforced by the API DTO. Fresh captures at 320, 390, and 1440px showed no horizontal overflow.
- The desktop auth shell now measures 1152×752 at 1440×900 and 1152×720 at 1440×768 for both login and signup. Current 390px signup capture shows the new example placeholders and no horizontal overflow; native date and password controls keep their native/label guidance instead of redundant placeholders. A soft route transition remains queued after the shared frame review.
- Order creation now centers in the available workspace, filling the regular 5xl form column and expanding to 7xl only in very wide workspaces. Fresh authenticated captures at 390, 768, 1440, and 2560px had no horizontal overflow; the form measured 358px on phone, 464px on tablet, 1024px on laptop, and 1280px on the wide display.
- Both workspace layouts now share a 1536px page-content cap. Fresh authenticated captures of dashboard, orders, programs, claims, customers, users, and reports at 1440px and 2560px show aligned content edges and no horizontal overflow. At 4K, dashboard, orders, and reports stay centered; list tables remain 1486px within the workspace instead of stretching across the display. The browser preference was restored to the sidebar layout after comparing both modes.
- Shared style inventory confirmed that card and button visuals already live in their reusable UI primitives. Repeated form-field wrappers now use the `oncf-field` Tailwind utility for one 8px grid gap; continue reviewing repeated panel, table, control, and dialog patterns before completing item 14.
- The dashboard now keeps all three recent-work panels together once the workspace reaches 1152px, avoiding a sidebar-state-dependent jump from three columns to one. Fresh 1440px screenshot shows the panels in one balanced row with shorter subtitles; smaller widths stay stacked to avoid an orphaned third panel. Actionable metrics and role-specific next steps still need review.
- Page headings now choose inline actions from the available workspace width, so the tablet sidebar does not squeeze the title into a narrow column beside stacked buttons.
- Fresh 1440×900 sidebar captures show the collapsed logo and account controls centered in 44px targets with 16px top and bottom insets; expanded and collapsed navigation icons remain on the same vertical rhythm.
- After collapsing, the first navigation item now remains at the same vertical start as the expanded state while every 44px icon target stays centered in the 64px rail; the logo and profile retain their 16px vertical inset.
- Fresh settings-dialog captures at 320px and 390px show three compact, evenly sized tabs with no horizontal overflow; the Appearance label remains fully readable at 320px and each tab retains a 48px minimum target.
- Fresh collapsed-rail measurements found that the empty label gap shifted logo, avatar, and nav icons 4px left. Removing that gap centers all nine marks at 31.5px within the 63px bordered rail; the buttons retain 44px targets.
- A fresh collapse capture measured the rail moving from 255px to 63px over 200ms while the menu labels faded out; the content moved with the rail and no horizontal overflow appeared. Setting the user's motion preference to reduced reduced transition and animation durations to 0.01ms.
- The notification popover keeps click, keyboard, and touch behavior; its empty/loading states use a tighter header, body, and footer rhythm while keeping the 44px footer action target.
- Fresh settings captures at 1440×900, 390×844, and 320×640 show a fixed 768px desktop dialog and an internally scrolling phone panel with no page-level horizontal overflow. The desktop title strip was tightened by one 4px spacing step; mobile title space was already compact.
- Auth form content now uses the shared 180ms page-entry fade and 4px rise; the existing system and user reduced-motion rules disable it.
- Public auth pages expose the same five theme choices as settings and save the choice to the existing local preference before sign-in.
- The dashboard now surfaces up to four orders returned by the server's eligible-for-programs endpoint when the user can read orders and create programs. Each link carries the selected order into the existing validated creation flow; empty recent orders/claims offer create actions only when permitted. Fresh dashboard checks at 320, 390, 768, 1024, 1280, 1440, 2560, and 3840px show no page-level horizontal overflow; the selected-order form control contains the order from the dashboard link.
- Repeated field spacing and the shared popup surface now use `oncf-field` and `oncf-dialog-surface`. The audit confirmed that Button, Card, Table, Menu, and Dialog defaults already belong in their shared UI primitives; feature-specific styles remain local.

## Working rules

- Keep the 4px spacing scale, semantic theme tokens, readable text sizes, and practical 44px interaction targets.
- Preserve current theme colors while improving component surfaces. Do not describe custom tokens as official ONCF colors.
- Follow the repository's commit scopes and run `bun run verify:commit` before every commit.
- Update this checklist with concrete evidence as each area is reviewed; do not mark the overall overhaul complete while any required item or screen state remains unverified.
