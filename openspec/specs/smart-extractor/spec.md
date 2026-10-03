# smart-extractor Specification

## Purpose
Extracts structured job attributes including salary ranges, required skill keywords, company name, and job role from raw text or job descriptions.

## Requirements

### Requirement: Salary Detection
The system SHALL parse unstructured job description text and identify compensation ranges or mark salary as not listed.

#### Scenario: Explicit compensation range detected
- **WHEN** raw job description contains salary patterns like "$120,000 - $150,000" or "$60k-$80k"
- **THEN** the system extracts and formats the salary range (e.g. "$120K–$150K")

#### Scenario: No salary information present
- **WHEN** raw job description does not contain discernible compensation patterns
- **THEN** the system marks the salary attribute as "Salary not listed"

### Requirement: Skill and Keyword Extraction
The system SHALL identify relevant technical skills, tools, and methodologies from job descriptions and generate tag chips.

#### Scenario: Extracting tech stack chips
- **WHEN** a job description mentions technologies such as React, TypeScript, Python, or AWS
- **THEN** the system extracts and associates corresponding standardized skill tags with the job record

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

### Requirement: Server-Side AI Environment Key Enforcement
The system SHALL execute AI model extractions using API keys configured solely in server environment variables without requiring or accepting client-provided API keys from the browser extension.

#### Scenario: Extension requests extraction without API key
- **WHEN** the browser extension sends an extraction request to `/api/extract` without an `x-api-key` header or key payload
- **THEN** the server uses the server's configured environment variables (`DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY`) to complete the extraction

### Requirement: DeepSeek Model Execution Support
The system SHALL support extraction via DeepSeek's API using JSON object response mode when `DEEPSEEK_API_KEY` is present.

#### Scenario: DeepSeek extraction execution
- **WHEN** `DEEPSEEK_API_KEY` is configured in environment variables and `/api/extract` receives raw job text
- **THEN** the system calls DeepSeek's completions endpoint with `response_format: { type: "json_object" }` and returns validated structured job attributes

### Requirement: Database-Backed URL Hash Extraction Cache
The extraction pipeline SHALL persist and retrieve cached job extractions directly from the PostgreSQL `ExtractionCache` table via Prisma instead of a local JSON disk file.

#### Scenario: Caching extraction result in database
- **WHEN** an AI extraction completes successfully for a job URL
- **THEN** the extraction payload is saved into the `ExtractionCache` PostgreSQL table keyed by the canonical URL SHA-256 hash

#### Scenario: Retrieving extraction from database cache
- **WHEN** an extraction request is received for a previously analyzed URL hash within the expiration window
- **THEN** the system returns the cached extraction from PostgreSQL without re-invoking the LLM API
