# Design: Admin Sidebar Navigation & App Shell

## Context

See `proposal.md` for background and motivation. The existing workspace renders on a single top-level page (`src/app/page.tsx`) with a 56px top nav and full-width main view. To support additional administrative views (Table view, Funnel Analytics, and Settings), this design establishes an administrative App Shell (`AdminShell`) containing a persistent, collapsible Left Sidebar and an elevated contextual header.

## Goals / Non-Goals

**Goals:**
- Provide a persistent left sidebar conforming to the Linear design system (`surface-1` lift, 1px hairlines, 240px expanded, 56px icon rail).
- Support smooth transitions between expanded and collapsed states, with state persisted in `localStorage`.
- Display live stage count pills (Wishlist, Applied, Interviewing, Offer, Archived) sourced from `useJobStore()`.
- Streamline the top contextual header to 48px with breadcrumbs, quick search, Quick Add button, and theme toggle.
- Provide a responsive slide-out drawer on tablet/mobile screens (< 1024px).
- Add keyboard accessibility (`[` or `Cmd+B` to toggle sidebar).

**Non-Goals:**
- Full implementation of Table view and Analytics view data grids (these will render structured Linear empty/preview states until subsequent changes build them).
- Backend authentication or cloud multi-tenant workspace switching.

## Architecture & Component Hierarchy

```
+-----------------------------------------------------------------------------------+
| AdminShell (Layout wrapper)                                                       |
|                                                                                   |
| +-------------------------+ +---------------------------------------------------+ |
| | Sidebar (240px / 56px)  | | TopContextBar (h-12 border-b border-hairline)     | |
| |                         | |  [Breadcrumbs]      [Cmd+K Search] [+] [Theme]    | |
| | - WorkspaceBrandHeader  | +---------------------------------------------------+ |
| |   (Clippy + Name + v)   | | Main Content View Area                            | |
| | - NavigationViewsGroup  | |                                                   | |
| |   * Board (Kanban)      | |   (KanbanBoard | TableView | AnalyticsView)       | |
| |   * Table               | |                                                   | |
| |   * Analytics           | |                                                   | |
| | - StageFilterShortcuts  | |                                                   | |
| |   (Wishlist, Applied..) | |                                                   | |
| | - Utilities & Settings  | |                                                   | |
| | - CollapseToggleRail    | |                                                   | |
| +-------------------------+ +---------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

## Decisions

### 1. Nested Route & Layout Structure vs View State
- **Decision**: Implement an `AppShell` component wrapping the main view with client navigation state for active view (`'board' | 'table' | 'analytics' | 'settings'`), while structuring the layout cleanly for future App Router page expansions.
- **Rationale**: Instant zero-latency switching with no full-page hydration or SSR reload, while retaining the shared persistent state of `JobStoreProvider` and `ToastProvider`.

### 2. Collapsible State Persistence & SSR Hydration
- **Decision**: Store sidebar collapsed state in `localStorage` under `jobclippy_sidebar_collapsed_v1`, hydrated safely via `useSyncExternalStore` (defaulting to expanded on server to avoid hydration mismatch).
- **Rationale**: Follows the strict hydration safety patterns established in the project.

### 3. Styling & Tokens (Linear Design System)
- **Decision**: 
  - Sidebar background: `bg-surface-1/90 backdrop-blur-md`
  - Right border: `border-r border-hairline`
  - Active item: `bg-surface-2 text-ink font-medium`
  - Hover item: `hover:bg-surface-2 hover:text-ink text-ink-muted transition-colors`
  - Counter badge: `bg-surface-2 border border-hairline text-ink-muted font-mono text-[11px]`

## Risks / Trade-offs

- **[Screen width constraint on smaller laptops (1024px-1280px)]** -> Mitigation: 240px sidebar can easily collapse into a 56px icon rail via `[` shortcut, giving the 5-column Kanban board maximum breathing room.
- **[Mobile layout (< 1024px)]** -> Mitigation: Sidebar hides off-canvas; top bar renders hamburger icon that triggers a slide-out navigation sheet.
