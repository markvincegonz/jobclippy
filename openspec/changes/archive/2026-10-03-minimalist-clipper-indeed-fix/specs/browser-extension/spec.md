# browser-extension Specification Delta

## Purpose

Provides an ultra-minimalist, high-speed browser clipper interface and scoped extraction pipeline that saves job opportunities into JobClippy.

## ADDED Requirements

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
