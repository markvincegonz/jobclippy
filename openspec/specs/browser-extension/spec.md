# browser-extension Specification

## Purpose
Enables candidates to clip job postings from any web page (LinkedIn, Indeed, ATS portals, and highlighted text) into JobClippy with automated attribute extraction and real-time pipeline synchronization.

## Requirements

### Requirement: Universal Job Extraction
The browser extension content script SHALL extract structured job attributes including title, company name, location, salary range, and technical skills from active web pages.

#### Scenario: Extracting job from LinkedIn or Indeed
- **WHEN** the user opens the extension popup while viewing a job posting on LinkedIn or Indeed
- **THEN** the system extracts the job title, company name, location, salary (if available), and full job description from the page DOM

#### Scenario: Extracting job from Schema.org JSON-LD
- **WHEN** the user opens the extension popup on a company career portal containing `schema.org/JobPosting` structured JSON-LD
- **THEN** the system extracts title, hiringOrganization, jobLocation, baseSalary, and description attributes directly from the structured data

#### Scenario: Extracting job from highlighted text
- **WHEN** the user has highlighted text on any webpage and opens the popup or right-clicks
- **THEN** the system parses the selected text using heuristic salary and skill dictionary regexes to extract candidate job attributes

### Requirement: Interactive Clip Preview Popup
The extension popup SHALL present an editable preview of detected job information styled with the Linear design system before saving to JobClippy.

#### Scenario: Pre-populating detected attributes
- **WHEN** the extension popup opens on a detected job page
- **THEN** the popup pre-fills the Job Title, Company, Location, Salary, detected Skill chips, and displays a "Job Detected" status indicator

#### Scenario: Editing attributes before clipping
- **WHEN** the user edits the title, company, salary, location, or removes/adds skill tags in the popup
- **THEN** the popup reflects the user modifications in the payload to be saved

#### Scenario: Selecting pipeline stage and adding notes
- **WHEN** the user chooses a stage (e.g. "Wishlist" or "Applied") and types a quick note in the popup
- **THEN** the saved job record is assigned to the selected stage with the timestamped personal note included

### Requirement: Web Application Synchronization Bridge
The system SHALL synchronize clipped jobs into the JobClippy web application storage without data loss.

#### Scenario: Instant sync to active JobClippy tab
- **WHEN** the user clicks "[ Clip to JobClippy ]" and a JobClippy web app tab is open in the browser
- **THEN** the bridge script writes the job to `localStorage["jobclippy_jobs_v1"]`, dispatches a store notification, and the web app UI updates immediately

#### Scenario: Queued sync when JobClippy tab is inactive
- **WHEN** the user clips a job while no JobClippy tab is currently active
- **THEN** the job is saved to `chrome.storage.local` pending queue, the extension badge increments, and jobs are automatically imported the next time JobClippy is opened

### Requirement: Context Menu Highlight Clipping
The extension SHALL register a context menu action allowing users to save selected text directly.

#### Scenario: Right-click save selected text
- **WHEN** a user highlights job details on a page, right-clicks, and selects "Save Highlighted Job to JobClippy"
- **THEN** the background service worker extracts attributes from the selection, queues the job, and displays a confirmation notification/badge flash

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

### Requirement: Ultra-Minimalist Clip Dialog
The extension popup SHALL present a clean, high-density dialog focused on pipeline stage assignment and personal notes, omitting pregathered editable form fields.

#### Scenario: Opening extension popup on active job page
- **WHEN** the user opens the extension popup on a detected job page
- **THEN** the popup displays the brand header, a subtle status dot indicating source detection, the pipeline stage dropdown, a personal note input, and the primary clip button without displaying pregathered text inputs for title, company, salary, location, or skills

#### Scenario: Selecting pipeline stage and entering notes
- **WHEN** the user selects a stage (e.g. "Wishlist" or "Applied") and types a quick note
- **THEN** the values are held in state to be saved alongside the extracted job data

#### Scenario: Clean typography and zero casual emojis
- **WHEN** the user views the popup interface in any state (initial, loading, or saved)
- **THEN** all user-facing labels and buttons use clean typography and Linear-grade SVG icons without casual emojis

### Requirement: Scoped Indeed Feed and Preview Extraction
The content extractor SHALL isolate the actively selected job on Indeed feeds, search result split-views, and detail pages.

#### Scenario: Extracting clicked job on Indeed homepage recommendation feed
- **WHEN** the user navigates Indeed recommendation feeds with an active job key in the query parameter (e.g. `?from=gnav-compui&vjk=a9fb756783b8d1a4`)
- **THEN** the system isolates the job corresponding to the `vjk` parameter and extracts the complete job description rather than falling back to the generic page title

#### Scenario: Extracting job from 2-pane SERP right preview pane
- **WHEN** the user clicks an opportunity in search results where the posting is displayed in an active right-hand pane or preview iframe
- **THEN** the system scopes description, salary, title, and company extraction to the active preview pane or iframe content document

#### Scenario: Preventing fallback to generic page title
- **WHEN** title extraction encounters an Indeed page whose DOM header lacks an isolated job title
- **THEN** the system NEVER sets the job title to "Job Search" or other site-wide headings, resolving instead via scoped card metadata or same-origin viewjob retrieval

### Requirement: On-Demand AI Extraction on Save
The extension SHALL defer server-side AI extraction until the user explicitly initiates the clip action.

#### Scenario: AI extraction triggered only upon clip button submission
- **WHEN** the user opens the extension popup
- **THEN** zero AI extraction network requests are dispatched while reviewing or editing stage/notes

#### Scenario: Direct database persistence with loading and success states
- **WHEN** the user clicks the "Clip to JobClippy" button
- **THEN** the extension transitions the button to a loading state ("Saving..."), passes raw job text to `/api/extract` for structured attribute parsing, persists the result to `POST /api/jobs`, and displays a checkmark confirmation

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
