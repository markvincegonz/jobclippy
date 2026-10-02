# Spec Delta: applications-table

## Purpose
Provides a high-density, interactive tabular view for job opportunities featuring multi-column sorting, in-line stage selector dropdowns, multi-row batch actions, and responsive mobile card-list presentation.

## ADDED Requirements

### Requirement: High-Density Table Presentation
The system SHALL present a data table displaying tracked job applications with columns for Role/Title, Company, Stage, Compensation, Location, Skills, and Row Actions in Linear design aesthetics.

#### Scenario: Rendering application records
- **WHEN** user selects the "All Applications" Table view
- **THEN** all non-archived or filtered job applications render as dense rows with hairline dividers and hover highlights

### Requirement: Multi-Column Sorting
The table SHALL support ascending, descending, and neutral sorting across Title, Company, Stage, and Compensation columns by clicking the column headers.

#### Scenario: Toggling sort order on a column
- **WHEN** user clicks a sortable column header (e.g., Company)
- **THEN** the rows reorder accordingly and display an active sort direction indicator icon

### Requirement: In-line Stage Switcher Dropdown
Each table row SHALL render an interactive stage pill that opens a dropdown menu to immediately transition the job's stage without opening a modal.

#### Scenario: Changing stage directly from table row
- **WHEN** user clicks the stage dropdown pill on a row and selects a new stage (e.g., "Interviewing")
- **THEN** the job store updates the opportunity's stage immediately, reflecting the new stage pill styling and toast confirmation

### Requirement: Multi-Row Selection and Batch Stage Transitions
The table SHALL provide row selection checkboxes, a "Select All" header checkbox, and an action bar when items are selected to batch-update stages or clear selection.

#### Scenario: Selecting multiple rows and batch updating stage
- **WHEN** user selects two or more job rows and triggers a batch stage transition to "Archived"
- **THEN** all selected opportunities update to the new stage simultaneously, showing a toast summary and clearing selection

### Requirement: Responsive Mobile Card-List Adaptation
On mobile viewports (< 768px), the table SHALL adapt into an ergonomic stacked list of cards that preserves in-row stage dropdowns and touch targets of at least 44px.

#### Scenario: Viewing table on mobile display
- **WHEN** user views the table view on a screen width under 768px
- **THEN** the horizontal table transforms into a compact vertical card list with full stage switching capabilities

### Requirement: Row Inspection Detail Sheet Trigger
Clicking any table row (outside interactive buttons, dropdowns, and checkboxes) SHALL open the slide-over JobDetailSheet.

#### Scenario: Opening detail sheet from table row
- **WHEN** user clicks on a table row
- **THEN** the slide-over JobDetailSheet opens populated with the selected job's timeline, notes, and full details
