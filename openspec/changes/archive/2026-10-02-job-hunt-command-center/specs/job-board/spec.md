# Spec Delta

## Purpose

Provides a visual Kanban board and management interface to track job opportunities through multi-stage pipelines with rich detail inspection.

## ADDED Requirements

### Requirement: Pipeline Stage Management
The application SHALL organize saved jobs across five distinct stages: Wishlist, Applied, Interviewing, Offer, and Archived.

#### Scenario: Moving a job between stages
- **WHEN** user moves a job card to a different column or selects a new stage from the card menu
- **THEN** the job is updated to the new stage and displayed in the target column

### Requirement: Job Card Summary Display
Each job card SHALL prominently display the position title, company name, location, detected salary range badge, key skill tags, and stage status.

#### Scenario: Viewing a job card
- **WHEN** user views the Kanban board
- **THEN** every job card renders title, company, formatted salary badge, and relevant skill chips

### Requirement: Job Details Inspection and Notes
The application SHALL provide a detail drawer or modal allowing users to view full descriptions, manage notes, and access original job links.

#### Scenario: Opening and editing job details
- **WHEN** user clicks a job card
- **THEN** a detail panel opens showing full description, skill tags, editable notes timeline, and original job URL link

### Requirement: Search and Filtering
The application SHALL filter visible job cards in real-time based on search keywords, skill tags, and location.

#### Scenario: Filtering by keyword or skill
- **WHEN** user types a search term into the search bar
- **THEN** the board dynamically updates to show only jobs matching the keyword in title, company, or skills
