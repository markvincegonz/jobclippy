# Spec Delta: browser-extension

## Purpose

Enables candidates to clip job opportunities from any webpage and persist them directly into the PostgreSQL database using environment-configured API endpoints.

## ADDED Requirements

### Requirement: Direct Database Save from Extension
The Chrome Extension SHALL send clipped job payloads directly to `POST /api/jobs` on the configured backend API, persisting the new record immediately into PostgreSQL.

#### Scenario: User clips job from extension popup
- **WHEN** the candidate clicks "Save to Tracker" in the extension popup
- **THEN** the extension sends an HTTP POST request to `/api/jobs` and receives the created job record from PostgreSQL

### Requirement: Environment-Configured API Base URL
The Chrome Extension SHALL resolve the backend API URL dynamically from a centralized configuration module (`extension/config.js`) supporting environment variables without hardcoded localhost strings.

#### Scenario: Extension resolving API endpoint
- **WHEN** the extension initiates an API extraction or job save request
- **THEN** it resolves the target URL from `CONFIG.API_BASE_URL` rather than a hardcoded string
