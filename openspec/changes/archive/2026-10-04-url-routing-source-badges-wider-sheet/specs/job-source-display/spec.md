# Spec Delta

## Purpose

Derives and displays the originating job board brand (e.g. "LinkedIn", "Indeed", "JobStreet") from a job's URL field, showing a favicon image and text label across all listing surfaces.

## ADDED Requirements

### Requirement: Job Source Brand Derivation
The system SHALL derive a human-readable source brand name from the job's `url` field by matching the URL hostname against a known set of job board domains.

#### Scenario: Known job board URL
- **WHEN** a job has a URL with hostname matching a known job board (e.g. `linkedin.com`, `indeed.com`, `ph.jobstreet.com`, `seek.com`)
- **THEN** the system returns the brand name (e.g. "LinkedIn", "Indeed", "JobStreet", "Seek")

#### Scenario: Unknown or company career site URL
- **WHEN** a job has a URL whose hostname does not match any known job board
- **THEN** the system returns a generic label derived from the domain (e.g. "cloudvanguard.io" → "cloudvanguard.io")

#### Scenario: Job with no URL
- **WHEN** a job has an empty or missing `url` field
- **THEN** no source badge is displayed

### Requirement: Source Favicon Display
The system SHALL display a favicon image for each recognized job board source, loaded from the domain's standard favicon endpoint (e.g. Google Favicon API or direct `/favicon.ico`).

#### Scenario: Favicon for known source
- **WHEN** a job's source is a recognized board like LinkedIn
- **THEN** the system renders a small favicon image (16×16 or similar) next to the brand text label

#### Scenario: Favicon for unrecognized source
- **WHEN** a job's source is an unrecognized domain
- **THEN** the system renders a generic globe/link icon as the favicon placeholder

### Requirement: Source Badge on Kanban Job Card
Each job card on the Pipeline Board SHALL display the source favicon and brand text label in the card footer area.

#### Scenario: Viewing source on a board card
- **WHEN** user views the Kanban board
- **THEN** each job card shows a small favicon + text label (e.g. favicon + "LinkedIn") in the footer alongside existing elements

### Requirement: Source Indicator in Applications Table
Each row in the Applications Table SHALL display the source favicon and brand text label.

#### Scenario: Viewing source in table row
- **WHEN** user views the All Applications table
- **THEN** each row displays the source favicon and brand text inline within the title column or as a dedicated source column

### Requirement: Source Badge in Job Detail Sheet
The Job Detail Sheet header SHALL display the source favicon and brand text label.

#### Scenario: Viewing source in detail sheet
- **WHEN** user opens the Job Detail Sheet for a job with a URL
- **THEN** the header area displays the source favicon and brand text near the "Open posting" link
