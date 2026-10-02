# Proposal

## Why

Job seekers currently manage applications across disconnected browser bookmarks, notes, spreadsheets, and open tabs, which creates significant cognitive overhead and friction. This change introduces the Job Hunt Command Center web application (JobClippy) with dark/light theming, an intelligent visual job management pipeline, and an end-to-end Playwright test suite, establishing a frictionless hub for tracking opportunities from discovery to offer.

## What Changes

- Add a dark/light theming system using shadcn UI tokens and persistent theme switching.
- Build a responsive Job Hunt Command Center dashboard with interactive Kanban columns (`Wishlist`, `Applied`, `Interviewing`, `Offer`, `Archived`), stage metrics, search, and filtering.
- Implement an intelligent parsing and job capture interface that detects salary ranges, key skill tags, locations, and descriptions.
- Implement a comprehensive Job Detail sheet/modal supporting notes, recruiter logs, and original job posting links.
- Create an end-to-end Playwright test suite verifying theme toggling, job lifecycle stage transitions, detail updates, and search/filtering.

## Capabilities

### New Capabilities
- `theme-system`: Dark and light mode theme configuration, CSS variable tokens, and persistent theme switching toggle.
- `job-board`: Visual multi-stage Kanban pipeline, job cards, search/filter controls, and job detail inspection with editable notes.
- `smart-extractor`: Intelligent extraction of salary ranges, required skills, company, title, and metadata from job posting text.
- `e2e-testing`: Automated Playwright test specifications validating theme persistence, job pipeline transitions, and UI interactions.

### Modified Capabilities
<!-- None: Greenfield application -->

## Impact

- **Dependencies**: Adds `next-themes` for robust theme switching alongside existing shadcn/ui components.
- **Components**: Introduces theme switcher, Kanban board, Job card, Job detail sheet, and Quick Add clipper dialog.
- **Testing**: Adds comprehensive Playwright specs in `tests/`.
