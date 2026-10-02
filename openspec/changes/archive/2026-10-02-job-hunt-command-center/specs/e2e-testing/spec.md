# Spec Delta

## Purpose

Automates end-to-end user journey validation across theme switching, job capture, pipeline progression, and filtering using Playwright.

## ADDED Requirements

### Requirement: Theme E2E Validation
Playwright test suites SHALL verify dark/light mode toggling and class application.

#### Scenario: Verify theme toggle in E2E
- **WHEN** Playwright executes the theme test suite
- **THEN** it verifies the theme toggle changes the root DOM theme classes and elements reflect the active theme

### Requirement: Job Management Lifecycle E2E Validation
Playwright test suites SHALL verify saving jobs, stage movement, note editing, and search filtering.

#### Scenario: Full job lifecycle execution
- **WHEN** Playwright executes the core user flow test
- **THEN** it successfully adds a new job, changes its pipeline stage, adds a note in the details view, and validates search filtering
