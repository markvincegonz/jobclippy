# Spec Delta: smart-extractor

## ADDED Requirements

### Requirement: Database-Backed URL Hash Extraction Cache
The extraction pipeline SHALL persist and retrieve cached job extractions directly from the PostgreSQL `ExtractionCache` table via Prisma instead of a local JSON disk file.

#### Scenario: Caching extraction result in database
- **WHEN** an AI extraction completes successfully for a job URL
- **THEN** the extraction payload is saved into the `ExtractionCache` PostgreSQL table keyed by the canonical URL SHA-256 hash

#### Scenario: Retrieving extraction from database cache
- **WHEN** an extraction request is received for a previously analyzed URL hash within the expiration window
- **THEN** the system returns the cached extraction from PostgreSQL without re-invoking the LLM API
