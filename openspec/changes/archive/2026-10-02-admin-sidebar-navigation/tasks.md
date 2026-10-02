# Tasks: Admin Sidebar Navigation & App Shell

## 1. Sidebar & Context Bar Components

- [x] 1.1 Create `Sidebar` component (`src/components/sidebar.tsx`) featuring Linear styling (`surface-1`, 1px hairlines), Clippy mascot brand header, navigation item list, and stage count pills; verify component renders cleanly with zero lint errors.
- [x] 1.2 Create `TopContextBar` component (`src/components/top-context-bar.tsx`) featuring breadcrumbs, Cmd+K search trigger, Quick Add button, and theme toggle; verify component passes lint.
- [x] 1.3 Add sidebar collapse state with hydration-safe `localStorage` synchronization and keyboard shortcut `[` / `Cmd+B`; verify transition between 240px and 56px icon rail.

## 2. Admin Shell Layout & View Switching

- [x] 2.1 Build `AdminShell` (`src/components/admin-shell.tsx`) wrapping the workspace, coordinating active views (`board`, `table`, `analytics`, `settings`), and managing mobile slide-over sheet drawer; verify responsive viewports.
- [x] 2.2 Refactor `src/app/page.tsx` and `KanbanBoard` to render seamlessly inside `AdminShell`, linking sidebar stage pills to stage focus; verify Kanban drag-and-drop and modals function without regressions.
- [x] 2.3 Implement clean Linear placeholder views for `Table`, `Analytics`, and `Settings` when selected from sidebar; verify smooth view transitions.

## 3. Automated Verification & E2E Tests

- [x] 3.1 Create `tests/admin-navigation.spec.ts` testing sidebar expansion/collapse, stage badge count accuracy, keyboard shortcut `[`, and mobile drawer toggle; verify all new tests pass.
- [x] 3.2 Run full Playwright test suite (`npx playwright test`) and ESLint (`npm run lint`) to confirm zero regressions across drag-and-drop, safeguards, theme, and visual tokens.
