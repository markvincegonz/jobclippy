# Spec Delta: job-board

## MODIFIED Requirements

### Requirement: Direct PostgreSQL Database Sourced Lifecycle
The application SHALL load opportunities and notes directly from the PostgreSQL database via `/api/jobs` and persist all lifecycle mutations directly to the database without reading, writing, or synchronizing job datasets through browser `localStorage`.

#### Scenario: Initial dashboard load
- **WHEN** the candidate accesses the application in any browser
- **THEN** the system queries `GET /api/jobs` and populates the Kanban board with persisted database records without reading from `localStorage`

#### Scenario: Direct mutation persistence
- **WHEN** the candidate adds, moves, updates, or deletes an opportunity
- **THEN** the system updates in-memory React state, dispatches corresponding REST operations to `/api/jobs`, and commits changes directly in PostgreSQL without saving job arrays to `localStorage`

## ADDED Requirements

### Requirement: Database-Backed Card Ordering and Spatial Reordering
The Kanban board SHALL maintain card positions within each pipeline stage backed by the database `position` field, persisting reordered positions via API so that card order is identical across browser sessions.

#### Scenario: Dragging and reordering a card within a column
- **WHEN** a candidate drags a card to a new position within the same stage column
- **THEN** the application recalculates the card's position value, optimistically reorders in memory, and persists the new `position` to `/api/jobs/[id]`

#### Scenario: Moving a card to another stage with specific order placement
- **WHEN** a candidate drops a card into a specific index of another stage column
- **THEN** the application updates both `stage` and `position` in memory and dispatches a `PATCH /api/jobs/[id]` with the updated stage and position values
