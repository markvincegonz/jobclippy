# Spec Delta: database-persistence

## MODIFIED Requirements

### Requirement: Relational Schema & ORM Management
The system SHALL manage relational models for jobs, personal notes, and extraction caches through Prisma ORM with type-safe client operations, including a `position` float field on jobs for deterministic cross-browser ordering.

#### Scenario: Schema migration execution
- **WHEN** Prisma migrations or db push are executed against the running database
- **THEN** tables for `Job`, `JobNote`, and `ExtractionCache` are created with appropriate indexes, constraints, cascade delete rules, and a `position` float column on `Job` indexed by `[stage, position]`

### Requirement: Jobs REST API Endpoints
The system SHALL expose REST endpoints at `/api/jobs` and `/api/jobs/[id]` to query, create, update, and delete job records backed by Prisma, with deterministic ordering based on stage and card position.

#### Scenario: Querying all jobs
- **WHEN** a client performs a `GET` request to `/api/jobs`
- **THEN** the system returns an array of jobs including their associated notes ordered by `stage` ascending and `position` ascending (or `position` ascending, `createdAt` descending)

#### Scenario: Creating a new job
- **WHEN** a client performs a `POST` request to `/api/jobs` with valid job payload
- **THEN** the system calculates an appropriate position value, stores the record in PostgreSQL, and returns the created job with HTTP 201

#### Scenario: Updating an existing job
- **WHEN** a client performs a `PATCH` request to `/api/jobs/[id]` with `position`, `stage`, or other field updates
- **THEN** the system updates the record in PostgreSQL and returns the updated job

#### Scenario: Deleting a job
- **WHEN** a client performs a `DELETE` request to `/api/jobs/[id]`
- **THEN** the system deletes the job and cascades deletion to associated notes

## ADDED Requirements

### Requirement: Single Source of Truth Without Client Cache Resurrection
The application data layer SHALL treat PostgreSQL as the sole source of truth for job opportunities, eliminating client `localStorage` caching of jobs so that deleted or modified jobs are never resurrected across browser sessions.

#### Scenario: Cross-browser data consistency
- **WHEN** a job is deleted or updated in one browser session and a second browser session accesses or reloads the application
- **THEN** the second browser session reflects the exact database state without resurrecting deleted items from local storage caches
