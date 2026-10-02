# Design: Interactive Applications Table View

## Context

`AdminShell` currently renders a placeholder `<table>` showing job attributes without interaction. Meanwhile, `KanbanBoard` provides rich stage switching and links to `JobDetailSheet`. The goal is to provide a dedicated, first-class `ApplicationsTable` component that connects directly to `useJobStore()`, offering full data-grid parity with Linear's desktop list/table views.

## Goals / Non-Goals

**Goals:**
- Provide multi-column sorting (Title, Company, Stage, Compensation) with visible sort direction icons.
- Implement an in-row stage dropdown selector pill allowing instant stage transitions without opening a modal.
- Provide multi-row checkboxes and an ergonomic floating batch action bar for moving multiple jobs at once.
- Open `JobDetailSheet` upon row click, preserving full access to notes, descriptions, and salary info.
- Deliver responsive layout transformation: table on desktop/tablet, stacked card-list on screens `< 768px`.
- Filter rows dynamically using the global `TopContextBar` search query and stage filters.

**Non-Goals:**
- Virtualized infinite scrolling (client dataset currently ranges from dozens to hundreds of jobs).
- Complex column reordering or customizable column resizing in v1.

## Decisions

### 1. Dedicated `ApplicationsTable` Component
- **Approach**: Create `src/components/applications-table.tsx` and mount it inside `src/components/admin-shell.tsx`.
- **Rationale**: Isolates sorting, selection, and mobile layout logic from the outer shell while keeping `AdminShell` lean.
- **Alternatives Considered**: Keeping table rendering inside `AdminShell` directly; rejected as it creates an unmaintainable monolith.

### 2. Event Bubbling Management
- **Approach**: The table row `<tr>` has `onClick={() => setSelectedJobId(job.id)}`. The checkbox cell and the stage dropdown pill explicitly call `e.stopPropagation()`.
- **Rationale**: Prevents accidental modal opening when users are simply selecting checkboxes or changing stages.

### 3. In-line Stage Dropdown Menu
- **Approach**: Use an accessible dropdown menu styled as a compact Linear stage badge with stage dot indicator and chevron. Clicking opens options: *Wishlist*, *Applied*, *Interviewing*, *Offer*, *Archived*.
- **Rationale**: Direct stage modification is 3x faster than opening a modal and clicking another button.

### 4. Floating Batch Action Dock
- **Approach**: When `selectedRowIds.size > 0`, animate in a floating dock at the bottom of the viewport:
  - Indicator: `"{N} roles selected"`
  - Quick action: "Move stage to..." dropdown
  - Action: "Archive selected"
  - Dismiss: "Deselect all"
- **Rationale**: Follows modern productivity apps (Linear, Notion, GitHub) where bulk actions float over the table rather than pushing layout content down.

### 5. Centralized `JobDetailSheet` in `AdminShell`
- **Approach**: Ensure `JobDetailSheet` is rendered at the `AdminShell` level (or mounted for table view) so clicking any row immediately slides the inspector open.
- **Rationale**: Reuses the entire notes timeline and opportunity detail sheet with zero code duplication.

## Risks / Trade-offs

- **[Risk]** Sorting mixed compensation strings ($125K-$155K vs $140K) numerically.
  - *Mitigation*: Parse the minimum number from salary strings using regex (e.g. `parseInt(salary.replace(/\D/g, ""))`) for clean numeric sorting, falling back to string comparison.
- **[Risk]** Mobile table horizontal overflow.
  - *Mitigation*: Use responsive CSS (`hidden md:table` vs `block md:hidden`) to seamlessly render a mobile-optimized card list on viewports under 768px.
