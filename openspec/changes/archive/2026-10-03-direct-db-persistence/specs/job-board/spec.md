# Spec Delta: job-board

## ADDED Requirements

### Requirement: Direct PostgreSQL Database Sourced Lifecycle
The application SHALL load opportunities and notes directly from the PostgreSQL database via `/api/jobs` and persist all lifecycle mutations directly to the database without relying on browser `localStorage` as the primary store.

#### Scenario: Initial dashboard load
- **WHEN** the candidate accesses the application
- **THEN** the system queries `GET /api/jobs` and populates the Kanban board with persisted database records

#### Scenario: Direct mutation persistence
- **WHEN** the candidate adds, moves, updates, or deletes an opportunity
- **THEN** the system dispatches corresponding REST operations to `/api/jobs` and commits changes directly in PostgreSQL
