# Web design system

This document defines how current ECommand screens should be laid out and how shared interaction details should behave. Apply it screen by screen. Preserve the existing semantic color tokens in apps/web/src/app/globals.css unless a separate, explicitly requested theme review is approved.

## Design goals

- Make the next action obvious and easy to hit.
- Give information a clear reading order: page title, supporting description, section heading, row title, then secondary detail.
- Use consistent alignment and spacing so related screens feel like one product.
- Let layouts reflow at narrow widths instead of shrinking controls or text until they feel cramped.
- Keep keyboard use, focus visibility, reduced motion, and touch use as normal states of the interface.

## Tokens and primitives

### Color

Use the current role-based tokens: background, foreground, card, muted, muted-foreground, border, primary, destructive, and their existing dark variants. This work does not change token values, chart colors, or the ONCF-inspired accent. Components should not introduce one-off palette values.

### Spacing

Use multiples of 4px. Prefer padding and parent gap over individual margins. Token names are aliases, not utility suffixes: for example, p-control is 8px while p-4 is 16px.

| Token intent | Value | Use |
| --- | ---: | --- |
| compact (gap-compact) | 4px | icon-to-label or tightly grouped metadata only |
| control (p-control, gap-control) | 8px | standard control inset and navigation item content |
| inset | 12px | use only when a component needs a between-step inset |
| inline | 16px | related controls, row content, and card inner gap |
| section | 24px | separation between content groups |
| page | 32px | desktop page section separation |
| page-wide | 40px | major desktop page breathing room when the content calls for it |

On small screens, page gutters are 16px; at medium widths use 24px; at wide widths use 32px. Narrow gutters do not mean tighter content gaps. A layout must not use a smaller font, padding, or control height as a substitute for reflow.

### Type hierarchy

Use the existing typeface and semantic foreground tokens. Keep hierarchy consistent:

| Element | Desktop | Small screens | Weight |
| --- | --- | --- | --- |
| Page title | 28px / 36px | 24px / 32px | semibold |
| Page description | 16px / 24px | 14px / 20px | regular, muted |
| Section title | 18px / 28px | 16px / 24px | semibold |
| Row/card title | 16px / 24px | 16px / 24px | medium or semibold |
| Body/value | 14px / 20px | 14px / 20px | regular |
| Supporting metadata | 13px / 20px | 13px / 20px | regular, muted |
| Label | 14px / 20px | 14px / 20px | medium |

Do not give a title and subtitle the same visual weight. Keep supporting copy readable; do not push it below 13px for ordinary interface content. Use the text-meta utility for 13px / 20px supporting metadata.

### Controls, hit areas, and focus

- Standard buttons, icon buttons, inputs, selects, and actionable list rows should provide a 44px minimum hit area. A 40px minimum is acceptable only for secondary controls inside a clearly bounded dense menu or table toolbar.
- Primary actions use at least 12px horizontal and 8px vertical internal padding. Secondary actions should retain a similarly comfortable target.
- Icon glyphs are usually 16px or 20px; the clickable button is larger than the glyph.
- Show the existing focus ring on keyboard focus. Never remove an outline without an equally visible replacement.
- Avoid hover-only instructions or actions. Tooltips supplement accessible names; they do not replace them.

### Surfaces and shape

Use the existing semantic border, radius, and shadow tokens. Keep related content in one card when it forms one task or information group. Avoid nesting cards without a clear boundary need. Use separators for divisions within one surface; use whitespace before adding another border.

## Page structure and responsive rules

### Standard page frame

1. A page header pairs one clear title with a short description and the primary page action.
2. Below it, content is grouped into sections with explicit headings or clear card titles.
3. The page uses a consistent 16/24/32px responsive gutter and a readable maximum content width. Forms and detail views should not stretch text fields across unnecessarily wide monitors.
4. Section spacing is 24px on mobile and 32px on desktop; card padding is 16px on mobile and 24px on desktop.
5. Long values wrap. Buttons may wrap or stack. No page may require horizontal scrolling at 320px except a data table with an explicit, usable scroll region.

At widths below 640px, stack page actions beneath the title, make form actions full width when this improves reach, and collapse multi-column card grids to one column. At tablet widths, use two columns only when each column remains readable. At desktop, use available width without making content feel sparse or stretched.

### Rows and lists

- Use a minimum 56px row height for standard data rows and 64px for rows with title plus supporting text.
- Give title and supporting text a 4px vertical gap; truncate only when a deliberate detail route or accessible full value is available.
- Keep action buttons in a separate aligned trailing area with a 44px target. Do not make tiny text itself the only click target when the row is actionable.
- On narrow screens, allow metadata to wrap below the title and move secondary actions to a menu or next line rather than compressing the title column.

### Forms and guided flows

- Keep labels above controls and help/error text immediately below the associated control.
- Inputs and selects use at least 44px height; textareas preserve enough visible lines to suggest their purpose.
- Keep field groups 24px apart and paired fields in a responsive grid that stacks below tablet width.
- Multi-step flows show current step, completed steps, and the next/back actions in a stable footer area. Back preserves entered values. Advancing validates only the active step; final submit validates the complete form.
- Errors are shown beside the field and announced accessibly. Invalid submission moves focus to the first invalid field or a summary that links to fields.

## Application shell

### Header

Keep the desktop header at a consistent 64px height. Align the sidebar toggle, breadcrumb, and trailing actions vertically. At mobile width, preserve a 44px target for the menu trigger and notification trigger; breadcrumb text may truncate without pushing actions offscreen.

### Sidebar

- Expanded width: 256px. Collapsed icon rail: 48px. Mobile opens a sheet with a comfortable 288px target width, bounded by the viewport.
- Expanded menu rows are at least 44px high with a 16px icon and readable 14px label. Group labels are distinct from menu rows and may hide when collapsed.
- In collapsed mode, center each 32px logo/avatar/icon inside the available 48px rail. Collapsed menu buttons have no internal horizontal padding that displaces or clips the icon. Keep the row itself at least 44px high.
- The brand mark keeps its full aspect ratio and never clips. The account avatar stays centered; account name and secondary text hide in the rail. Provide a tooltip or accessible name for each collapsed navigation control and the account control.
- Use active styling and a focus ring to distinguish current and focused items; do not rely on color alone.
- Keep footer content anchored at the bottom while navigation scrolls independently. On mobile, close the sheet after a navigation choice.

### Notifications

- Clicking the bell opens an anchored dropdown/popup beside the bell; it does not navigate away.
- On desktop, target a panel around 360px wide and keep the whole panel at most 70vh tall. On mobile, use the available viewport width with 16px side gutters and keep it within the screen.
- The panel has a heading, unread count, scrollable recent list, and a footer link to the full notification history. The full history page remains available for search/filtering and older items.
- Each notification shows a concise title, secondary context, and relative time with title/subtitle hierarchy. Unread state is clear through more than color alone. Rows have at least a 56px hit area; row actions have a 44px target.
- Mark-one-read and mark-all-read actions give immediate feedback and maintain focus. Clicking a notification opens its relevant destination when one exists; expose the full-history link for notifications without a destination.
- The popup closes on Escape, outside click, or selection; keyboard users can reach the bell, move through the menu, and return focus to the bell when closing.
- The bell remains a button with an accessible name and unread count. Its badge must not cover the icon or reduce the hit area.

## Motion and feedback

Use the shared motion tokens for short 120–200ms transitions. Respect prefers-reduced-motion. Do not animate layout in a way that moves a target beneath a pointer or keyboard focus. Loading, empty, success, and error states should occupy a stable place so content does not jump unexpectedly.

## Review checklist

Before marking a screen change complete, inspect these viewport widths: 320, 375, 640, 768, 1024, and 1440px. Check light and dark mode without changing palette values, keyboard focus, touch target size, long user-provided text, loading/empty/error states, and the expanded/collapsed/mobile sidebar where applicable. For the notification trigger, check open/close behavior, focus return, unread actions, and the full-history route.

When a visual browser is unavailable, say so explicitly and verify layout classes, typecheck/build, and relevant interactions through code-level or HTTP checks. Do not claim a visual inspection that was not performed.
