# Spec Delta

## MODIFIED Requirements

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
