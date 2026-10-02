# Tasks

## 1. Foundation & Global Tokens Setup

- [x] 1.1 Configure Tailwind v4 `@theme` and CSS variables in `src/app/globals.css` to define Linear color tokens (`canvas`, `surface-1` through `surface-4`, `hairline`, `primary`, `ink` scale, `semantic-success`), 4px spacing scale, and border radius tokens, and verify Next.js compiles without errors
- [x] 1.2 Update base UI primitives in `src/components/ui/` (`button.tsx`, `badge.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `dialog.tsx`, `sheet.tsx`) to match Linear's button variants (`button-primary`, `button-secondary`, `button-tertiary`), input padding (8px 12px), and radius tokens (`rounded-md` 8px, `rounded-lg` 12px)

## 2. Responsive Kanban Card Component Overhaul

- [x] 2.1 Refactor `JobCard` in `src/components/job-card.tsx` to use `surface-1` background, `surface-2` on hover, 1px `hairline` border, 12px radius, zero drop-shadow, and approved typography hierarchy (`card-title`, `body-sm`, `caption`)
- [x] 2.2 Align card metadata elements (salary badge, skills tags, action menu, notes count, external link) to strictly use approved spacing (4px grid), `status-badge` (`surface-2`, `ink-muted`, `rounded-xs`), and verify card renders cleanly across desktop and mobile viewports

## 3. Board Layout & Shell Refactor

- [x] 3.1 Refactor `KanbanBoard` in `src/components/kanban-board.tsx` to remove saturated column border colors (`border-t-sky-500`, etc.) and replace with neutral hairline borders, `surface-1` column backgrounds, and approved status indicators
- [x] 3.2 Refactor header bar, search input, stats summary tiles, and action buttons to use Linear typography (`headline`, `body-sm`), dark canvas `#010102`, and `button-primary` lavender CTA
- [x] 3.3 Refactor `QuickAddModal` and `JobDetailSheet` drawers to use `surface-1`/`surface-2` surfaces, hairline dividers, 4px grid padding, and Linear button variants

## 4. Verification & Testing

- [x] 4.1 Perform an automated codebase scan to verify zero arbitrary text sizes (`text-[11px]`, `text-[10px]`), unapproved hex codes, or off-spec padding values remain
- [x] 4.2 Execute Playwright test suite (`npx playwright test`) to verify all core user flows (job lifecycle, search filtering, stage progression, detail inspection) pass with the new Linear design system
