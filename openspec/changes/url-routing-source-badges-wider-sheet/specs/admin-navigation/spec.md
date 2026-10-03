# Spec Delta

## MODIFIED Requirements

### Requirement: Admin Sidebar Shell Layout
The application SHALL render a persistent left navigation sidebar adhering to the Linear design system tokens (240px expanded width, 1px hairline border, surface-1 background). Navigation items SHALL use `<Link>` elements with URL paths (`/board`, `/applications`, `/analytics`, `/settings`) instead of callback-based state switching. The active view SHALL be determined by reading the current URL pathname via `usePathname()`.

#### Scenario: Rendering expanded sidebar on desktop
- **WHEN** user views the application on a desktop display (>= 1024px)
- **THEN** the sidebar renders on the left at 240px width with brand header, navigation views, stage shortcuts, and footer utilities

#### Scenario: Active view highlighting from URL
- **WHEN** user navigates to `/applications`
- **THEN** the "All Applications" sidebar item is visually highlighted as the active view

#### Scenario: Browser back/forward navigation
- **WHEN** user clicks the browser back button after navigating from `/board` to `/applications`
- **THEN** the application returns to `/board` and the sidebar active state updates accordingly

### Requirement: Collapsible Sidebar State
The system SHALL allow users to collapse the sidebar into a 56px icon-rail using a toggle button or keyboard shortcut `[` / `Cmd+B`.

#### Scenario: Toggling sidebar collapse
- **WHEN** user clicks the collapse button or presses `[` on desktop
- **THEN** the sidebar smoothly transitions between 240px and 56px width, displaying icon tooltips when collapsed

### Requirement: Pipeline Stage Quick Navigation
The sidebar SHALL display live counter badges for each pipeline stage (Wishlist, Applied, Interviewing, Offer, Archived) reflecting real-time job store quantities.

#### Scenario: Viewing stage count badges
- **WHEN** jobs are added, moved, or deleted in the store
- **THEN** the stage counter pills in the sidebar update immediately to reflect the count in each stage

#### Scenario: Filtering pipeline by stage click
- **WHEN** user clicks a stage item in the sidebar
- **THEN** the current view updates the `stage` URL search param to filter by that stage

### Requirement: Responsive Mobile Navigation Drawer
The system SHALL collapse the sidebar into a hamburger trigger on mobile viewports (< 1024px) that opens a slide-out navigation sheet.

#### Scenario: Opening mobile drawer
- **WHEN** user taps the mobile menu button on a screen under 1024px
- **THEN** a backdrop-blurred slide-over drawer opens displaying the complete navigation tree

## ADDED Requirements

### Requirement: URL-Based View Routing
The application SHALL serve each major view at a distinct URL path: `/board` for Pipeline Board, `/applications` for All Applications, `/analytics` for Analytics, and `/settings` for Settings.

#### Scenario: Direct URL access to a view
- **WHEN** user navigates directly to `/applications` in the browser address bar
- **THEN** the All Applications table view loads with the sidebar showing "All Applications" as active

#### Scenario: Root URL redirect
- **WHEN** user navigates to `/`
- **THEN** the application redirects to `/board`

### Requirement: Filter State in URL Search Params
Search query and stage filter SHALL persist as URL search params (`q` and `stage`) so that filter state survives page navigation and can be shared via URL.

#### Scenario: Applying search filter via URL
- **WHEN** user types "React" in the search bar on `/board`
- **THEN** the URL updates to `/board?q=React` and only matching jobs are displayed

#### Scenario: Navigating away and back preserves filters
- **WHEN** user has `/board?q=React&stage=applied`, navigates to `/settings`, then clicks browser back
- **THEN** the board loads with the search query "React" and stage filter "applied" restored
