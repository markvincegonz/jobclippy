# job-board Specification

## Purpose
Provides a visual Kanban board and management interface to track job opportunities through multi-stage pipelines with rich detail inspection.

## Requirements

### Requirement: Pipeline Stage Management
The application SHALL organize saved jobs across five distinct stages: Wishlist, Applied, Interviewing, Offer, and Archived.

#### Scenario: Moving a job between stages
- **WHEN** user moves a job card to a different column or selects a new stage from the card menu
- **THEN** the job is updated to the new stage and displayed in the target column

### Requirement: Job Card Summary Display
Each job card SHALL prominently display the position title, company name, location, detected salary range badge, key skill tags, stage status, and the originating source favicon with brand text label.

#### Scenario: Viewing a job card
- **WHEN** user views the Kanban board
- **THEN** every job card renders title, company, formatted salary badge, relevant skill chips, and a source badge (favicon + brand text) in the footer area

### Requirement: Job Details Inspection and Notes
The application SHALL provide a detail drawer allowing users to view full descriptions, manage notes, access original job links, and see the source badge. The detail drawer SHALL render at 1.5× the original maximum width (`max-w-3xl`, approximately 768px).

#### Scenario: Opening and editing job details
- **WHEN** user clicks a job card
- **THEN** a detail panel opens at `max-w-3xl` width showing full description, skill tags, editable notes timeline, original job URL link, and source favicon with brand text

### Requirement: Search and Filtering
The application SHALL filter visible job cards in real-time based on search keywords, skill tags, and location. The active search query and stage filter SHALL be read from and written to URL search params (`q` and `stage`).

#### Scenario: Filtering by keyword or skill
- **WHEN** user types a search term into the search bar
- **THEN** the board dynamically updates to show only jobs matching the keyword in title, company, or skills, and the URL updates to reflect the `q` param

### Requirement: Admin App Shell Integration
The Kanban board SHALL render inside the main viewport of the administrative app shell layout, maintaining full spatial drag-and-drop and detail sheet capabilities.

#### Scenario: Rendering board within admin layout
- **WHEN** user accesses the dashboard
- **THEN** the Kanban board renders alongside the persistent left sidebar with streamlined top context controls

### Requirement: Cross-View Pipeline Synchronization
Stage transitions and updates executed within the Table view (single-row or batch updates) SHALL immediately reflect in the Kanban board and stage count badges without page reloads.

#### Scenario: Switching between Table and Board views after stage updates
- **WHEN** user changes an opportunity's stage in the Table view and switches to the Pipeline Board
- **THEN** the corresponding card appears in the new stage column and sidebar counters reflect the updated quantities

### Requirement: Direct PostgreSQL Database Sourced Lifecycle
The application SHALL load opportunities and notes directly from the PostgreSQL database via `/api/jobs` and persist all lifecycle mutations directly to the database without relying on browser `localStorage` as the primary store.

#### Scenario: Initial dashboard load
- **WHEN** the candidate accesses the application
- **THEN** the system queries `GET /api/jobs` and populates the Kanban board with persisted database records

#### Scenario: Direct mutation persistence
- **WHEN** the candidate adds, moves, updates, or deletes an opportunity
- **THEN** the system dispatches corresponding REST operations to `/api/jobs` and commits changes directly in PostgreSQL
