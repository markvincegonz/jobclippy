# browser-extension Specification Delta

## Purpose

Enables candidates to accurately clip jobs from JobStreet, Seek, and arbitrary multi-column job boards through dynamic reading pane scoring and AI URL disambiguation.

## ADDED Requirements

### Requirement: JobStreet and Seek Platform Extraction
The content extractor SHALL support JobStreet and Seek Asia domains, parsing both 2-pane search views and standalone detail pages into structured opportunity records.

#### Scenario: Extracting job from JobStreet 2-pane search split view
- **WHEN** the user opens the extension while viewing an active opportunity on a JobStreet search results split view (e.g. `ph.jobstreet.com/web-jobs?jobId=95014441&type=standard`)
- **THEN** the system isolates the right-hand details pane using `data-automation` attributes and extracts the job title, company, location, salary, and complete description corresponding to `jobId=95014441`

#### Scenario: Extracting job from JobStreet standalone detail view
- **WHEN** the user clips a job on a standalone JobStreet detail page (e.g. `ph.jobstreet.com/job/95014441`)
- **THEN** the system extracts all job attributes and sets the opportunity source to `jobstreet`

#### Scenario: Normalizing JobStreet web-jobs URLs to canonical direct links
- **WHEN** a job is clipped from a JobStreet 2-pane URL containing `jobId=...`
- **THEN** the stored opportunity URL is normalized to the clean canonical format `https://{domain}/job/{jobId}`

### Requirement: Universal Semantic Reading Pane Identification
The content extractor SHALL evaluate candidate DOM containers using semantic layout and content scoring to locate the active job reading pane across arbitrary job platforms.

#### Scenario: Dynamically isolating the active reading view on multi-pane layouts
- **WHEN** a user visits a multi-pane job site without hardcoded platform rules
- **THEN** the system scores candidate containers based on layout dimensions, heading presence, text length, and URL identifier matches to extract the primary reading view

#### Scenario: Discarding sidebar search cards and navigation bars
- **WHEN** extracting job content from a page that displays both a list of search cards and an expanded job reading pane
- **THEN** the extractor isolates the expanded reading container and excludes the sidebar list from the description payload

### Requirement: AI URL and Target Disambiguation
The server extraction pipeline SHALL accept the active page URL and target job identifier to disambiguate the viewed opportunity when processing page content.

#### Scenario: Disambiguating active job matching URL parameter in AI prompt
- **WHEN** the server receives a raw text payload containing multiple job snippets along with a specific target job identifier in the URL
- **THEN** the AI prompt directs the model to extract and verify the specific job matching the target URL or expanded description rather than the first list item
