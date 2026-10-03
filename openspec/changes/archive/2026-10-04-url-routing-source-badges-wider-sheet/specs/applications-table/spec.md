# Spec Delta

## MODIFIED Requirements

### Requirement: High-Density Table Presentation
The system SHALL present a data table displaying tracked job applications with columns for Role/Title (with source favicon and brand text), Company, Stage, Compensation, Location, Skills, and Row Actions in Linear design aesthetics.

#### Scenario: Rendering application records
- **WHEN** user selects the "All Applications" Table view
- **THEN** all non-archived or filtered job applications render as dense rows with hairline dividers, hover highlights, and a source favicon + brand text displayed inline with the title or as a separate indicator

### Requirement: Row Inspection Detail Sheet Trigger
Clicking any table row (outside interactive buttons, dropdowns, and checkboxes) SHALL open the slide-over JobDetailSheet at the wider `max-w-3xl` width.

#### Scenario: Opening detail sheet from table row
- **WHEN** user clicks on a table row
- **THEN** the slide-over JobDetailSheet opens at `max-w-3xl` width, populated with the selected job's timeline, notes, source badge, and full details
