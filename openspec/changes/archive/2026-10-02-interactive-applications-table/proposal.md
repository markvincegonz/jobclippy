# Proposal: Interactive Applications Table View

## Why

While the Kanban board offers an intuitive spatial overview of application stages, job hunters actively managing dozens of opportunities require a high-density, spreadsheet-grade view for scanning, sorting, and bulk-updating applications. Converting the current placeholder table into a full Linear-styled interactive data grid enables swift multi-column triage, immediate stage transitions via in-line dropdowns, and batch operations without losing sync with the Kanban pipeline.

## What Changes

- **High-Density Linear Data Table**: Replace the static table with a dedicated, responsive `ApplicationsTable` component with column headers, sorting indicators, monospace compensation chips, and skill badges.
- **In-line Stage Selector Dropdown**: Enable users to change an opportunity's stage directly within the table row using an accessible dropdown menu without opening the detail sheet.
- **Multi-Row Checkbox Selection & Batch Actions**: Add row checkboxes and a "Select All" header toggle. When items are selected, display an ergonomic action dock to batch-update stages (e.g., move multiple to Applied or Archived) or clear selection.
- **Deep Row Inspection**: Clicking any row (outside interactive action controls) opens the existing slide-over `JobDetailSheet` for notes, salary detection, and links.
- **Responsive Mobile List Adaptation**: On screens `< 768px`, dynamically adapt the wide data grid into an ergonomic stacked card list with touch-friendly stage selectors.
- **Search & Stage Filter Sync**: Filter rows seamlessly based on the `TopContextBar` search query and stage filters.

## Capabilities

### New Capabilities
- `applications-table`: Interactive high-density tabular view with multi-column sorting, in-line stage switcher dropdowns, multi-row batch actions, and responsive mobile card-list view.

### Modified Capabilities
- `job-board`: Synchronizes live updates made in the table view (single-row stage changes or batch transitions) immediately with the Kanban board via the shared store.

## Impact

- **Components**: Introduces `src/components/applications-table.tsx`; integrates with `src/components/admin-shell.tsx` and `src/components/job-detail-sheet.tsx`.
- **Dependencies**: Uses existing Radix UI primitives (`DropdownMenu`, `Checkbox`) or lightweight custom accessible components adhering to Linear styling.
- **Tests**: Adds comprehensive Playwright test suite (`tests/applications-table.spec.ts`) validating sorting, in-line stage updates, multi-selection, and responsive mobile adaptation.
