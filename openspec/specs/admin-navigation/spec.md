# admin-navigation Specification

## Purpose
Provides an administrative app shell with a persistent, collapsible left sidebar navigation, stage quick-filter counters, and responsive mobile drawer.

## Requirements

### Requirement: Admin Sidebar Shell Layout
The application SHALL render a persistent left navigation sidebar adhering to the Linear design system tokens (240px expanded width, 1px hairline border, surface-1 background).

#### Scenario: Rendering expanded sidebar on desktop
- **WHEN** user views the application on a desktop display (>= 1024px)
- **THEN** the sidebar renders on the left at 240px width with brand header, navigation views, stage shortcuts, and footer utilities

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
- **THEN** the main board navigates or scrolls to highlight that stage column

### Requirement: Responsive Mobile Navigation Drawer
The system SHALL collapse the sidebar into a hamburger trigger on mobile viewports (< 1024px) that opens a slide-out navigation sheet.

#### Scenario: Opening mobile drawer
- **WHEN** user taps the mobile menu button on a screen under 1024px
- **THEN** a backdrop-blurred slide-over drawer opens displaying the complete navigation tree
