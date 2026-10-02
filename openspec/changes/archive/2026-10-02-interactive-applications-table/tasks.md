# Tasks: Interactive Applications Table View

## 1. Table Presentation, Sorting & In-Line Stage Switcher

- [x] 1.1 Create `ApplicationsTable` (`src/components/applications-table.tsx`) rendering columns (Role/Title, Company, Stage, Compensation, Location, Skills, Actions) with multi-column sorting (Title, Company, Stage, Compensation) and sort direction indicators; verify component renders cleanly with zero lint errors.
- [x] 1.2 Implement accessible in-row stage dropdown selector pill with stage dot accents, allowing instant stage transitions with toast feedback; verify stage updates save to `useJobStore()`.

## 2. Multi-Row Selection, Mobile Adaptation & Detail Sheet

- [x] 2.1 Implement row checkboxes, "Select All" header toggle, and floating bottom batch action dock for mass stage transitions (e.g. bulk-moving to Archived or Applied); verify batch update execution.
- [x] 2.2 Add responsive mobile card-list layout for viewports under 768px, preserving full in-line stage switcher functionality with touch targets >= 44px; verify mobile responsiveness.
- [x] 2.3 Mount `ApplicationsTable` inside `AdminShell` (`src/components/admin-shell.tsx`) and wire row clicks to open the slide-over `JobDetailSheet`; verify clicking a row opens the detail sheet.

## 3. Automated Verification & E2E Tests

- [x] 3.1 Create `tests/applications-table.spec.ts` testing sorting, in-line stage updates, multi-selection batch progression, row detail sheet opening, and mobile list adaptation; verify all new tests pass.
- [x] 3.2 Run full Playwright test suite (`npx playwright test`) and ESLint (`npm run lint`) to confirm zero regressions across Kanban board, Admin navigation, theme, and safeguards.
