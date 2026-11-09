# Proposal: Comprehensive Local Setup Documentation and Visual Tour

## Why

JobClippy is an offline-capable, local-first application and browser extension that is not intended for hosted cloud deployment. The current `README.md` is an uncustomized default Next.js template. A complete, professional documentation suite is required to guide engineers through local prerequisites (Node 20+, Docker Compose, PostgreSQL 16 on port 5433), environment variable configuration (including `DEEPSEEK_API_KEY` for AI job parsing), database initialization, unpacked Chrome extension installation, and keyboard accelerators. Visual screenshots of the dashboard, table, analytics, and detail sheet are needed to provide immediate clarity on the app's capabilities.

## What Changes

- **Automated High-Resolution Screenshot Capture**: Capture clean, high-DPI screenshots of the Kanban Board, Applications Table, Pipeline Analytics, Job Detail Slide-Over, and Command Palette into `docs/screenshots/`.
- **Complete `README.md` Authoring**: Replace the default Next.js README with comprehensive, production-grade documentation:
  - Hero section with badges and Clippy design ethos.
  - Interactive visual walkthrough with screenshots.
  - Step-by-step local prerequisites and installation guide.
  - Clear explanation of `.env.local` requirements including database credentials and `DEEPSEEK_API_KEY`.
  - Browser extension installation guide for Chrome Developer Mode.
  - Keyboard navigation and shortcut cheatsheet.
  - Test suite commands (`playwright test`).
  - Architecture overview and troubleshooting.

## Capabilities

### New Capabilities
None (pure documentation change with `skip_specs: true`).

### Modified Capabilities
None (pure documentation change with `skip_specs: true`).

## Impact

- `README.md`: Completely rewritten.
- `docs/screenshots/`: New directory containing captured UI screenshots.
- Documentation and onboarding developer experience significantly improved.

