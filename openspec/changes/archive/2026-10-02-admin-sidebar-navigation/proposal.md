# Proposal: Admin Sidebar Navigation & App Shell

## Why

As JobClippy evolves beyond a standalone Kanban board into a full Job Hunt Command Center, the horizontal top-navigation bar has reached cognitive and spatial capacity. Organizing upcoming features (table view, stage analytics, follow-up alerts, and workspace settings) requires a dedicated, Linear-grade Left Sidebar navigation shell that anchors the workspace, provides persistent stage counts, and supports collapsible/mobile-responsive views.

## What Changes

- **Admin App Shell Layout**: Introduce a responsive administrative layout with a persistent left sidebar (240px expanded, 56px collapsed icon rail, slide-out drawer on mobile < 1024px).
- **Core View Navigation**: Add primary view navigation items for **Board** (Pipeline), **Table** (dense spreadsheet view placeholder), **Analytics** (conversion velocity placeholder), and **Settings** (theme, data reset, import/export).
- **Pipeline Stage Shortcuts**: Integrate real-time counter pills for each pipeline stage (`Wishlist`, `Applied`, `Interviewing`, `Offer Received`, `Archived`) directly in the sidebar for single-click stage filtering.
- **Top Context Bar**: Streamline the top header into a 48px context header displaying breadcrumbs, quick search, Quick Add button, and theme/profile actions.
- **Keyboard Accessibility**: Add `[` or `Cmd+B` shortcut to collapse/expand the sidebar smoothly with CSS transitions.

## Capabilities

### New Capabilities
- `admin-navigation`: Defines administrative app shell navigation, sidebar collapse states, route/view switching, and mobile drawer accessibility.

### Modified Capabilities
- `job-board`: Integrates the Kanban board as the primary view inside the admin app shell layout.

## Impact

- **UI / Layout**: Replaces top-only header on the main workspace with the left sidebar + top context bar app shell.
- **Components**: Introduces `Sidebar`, `SidebarItem`, `SidebarStagePill`, and responsive mobile sheet drawer.
- **Routing**: Prepares routing structure for nested views (`/`, `/table`, `/analytics`, `/settings`) while maintaining instant client-side performance.
- **Accessibility & Tests**: Adds Playwright test coverage for sidebar toggle, stage shortcuts, and keyboard navigation.
