# database-persistence Specification

## Purpose
Provides durable, relational data persistence for job listings, notes, and AI extraction caches using a containerized PostgreSQL database and Prisma ORM.

## Requirements

### Requirement: Dockerized PostgreSQL Service
The system SHALL provide a reproducible Docker Compose service running PostgreSQL 16 Alpine with persistent volume storage and local port exposure.

#### Scenario: Docker container initialization
- **WHEN** `docker compose up -d` is executed
- **THEN** a PostgreSQL container starts listening on port 5432 with health check status healthy and data persisted in a named docker volume

### Requirement: Relational Schema & ORM Management
The system SHALL manage relational models for jobs, personal notes, and extraction caches through Prisma ORM with type-safe client operations.

#### Scenario: Schema migration execution
- **WHEN** Prisma migrations are executed against the running database
- **THEN** tables for `Job`, `JobNote`, and `ExtractionCache` are created with appropriate indexes, constraints, and cascade delete rules

### Requirement: Jobs REST API Endpoints
The system SHALL expose REST endpoints at `/api/jobs` and `/api/jobs/[id]` to query, create, update, and delete job records backed by Prisma.

#### Scenario: Querying all jobs
- **WHEN** a client performs a `GET` request to `/api/jobs`
- **THEN** the system returns an array of jobs including their associated notes ordered by creation date

#### Scenario: Creating a new job
- **WHEN** a client performs a `POST` request to `/api/jobs` with valid job payload
- **THEN** the system stores the record in PostgreSQL and returns the created job with HTTP 201

#### Scenario: Updating an existing job
- **WHEN** a client performs a `PATCH` request to `/api/jobs/[id]` with stage or field updates
- **THEN** the system updates the record in PostgreSQL and returns the updated job

#### Scenario: Deleting a job
- **WHEN** a client performs a `DELETE` request to `/api/jobs/[id]`
- **THEN** the system deletes the job and cascades deletion to associated notes

### Requirement: Database Seed Pipeline
The system SHALL provide an automated seed script that populates the PostgreSQL database with initial realistic opportunities when initialized.

#### Scenario: Seeding database
- **WHEN** `npx prisma db seed` is executed
- **THEN** default curated opportunities and notes are safely inserted into PostgreSQL without duplication
