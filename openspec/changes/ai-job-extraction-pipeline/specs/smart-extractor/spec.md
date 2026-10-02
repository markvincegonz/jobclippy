# Spec Delta: smart-extractor

## ADDED Requirements

### Requirement: URL Canonicalization and Hashing
The system SHALL normalize job posting URLs by stripping marketing and tracking parameters and generate a deterministic SHA-256 hash for cache lookups.

#### Scenario: Stripping tracking parameters from job URLs
- **WHEN** a job posting URL contains tracking parameters such as `utm_source`, `refId`, `trackingId`, `vjs`, or `fbclid`
- **THEN** the system removes the tracking parameters and standardizes the domain and path to a canonical form

#### Scenario: Deterministic URL hashing
- **WHEN** two URLs point to the same job listing but contain differing query parameters or session IDs
- **THEN** both URLs resolve to the exact same SHA-256 hash identifier

### Requirement: Extraction Cache Verification
The system SHALL query the persistent extraction cache before invoking external AI extraction endpoints.

#### Scenario: Cache hit avoids AI invocation
- **WHEN** an incoming job extraction request matches an existing SHA-256 URL hash in the cache
- **THEN** the system returns the cached structured job attributes in under 50ms and skips AI model invocation

#### Scenario: Cache miss triggers AI extraction and persists result
- **WHEN** an incoming job extraction request does not match any entry in the cache
- **THEN** the system executes the AI extraction pipeline, persists the resulting structured data with an expiration timestamp, and returns the response

### Requirement: AI-Powered Structured Extraction
The system SHALL extract standardized job attributes from pre-cleaned job text using an LLM conforming to a strict JSON schema.

#### Scenario: Strict JSON extraction of job attributes
- **WHEN** pre-cleaned job text is processed by the AI extraction pipeline
- **THEN** the system outputs a validated JSON object containing title, company, location, workplaceType, salary, seniority, skills, experienceYears, and a 2-sentence summary

#### Scenario: Fallback to client heuristics when AI service is unavailable
- **WHEN** the AI API endpoint fails, is rate-limited, or lacks configured credentials
- **THEN** the system falls back gracefully to high-confidence client-side regex extraction without blocking the user from saving the job
