# browser-extension Specification Delta

## Purpose

Enables candidates to clip job postings from any web page (LinkedIn, Indeed, ATS portals, and highlighted text) into JobClippy with automated attribute extraction and real-time pipeline synchronization.

## ADDED Requirements

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
