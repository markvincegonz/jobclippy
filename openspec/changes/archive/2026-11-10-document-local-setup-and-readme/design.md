# Design: Comprehensive Local Setup Documentation and Visual Tour

## Context

See `proposal.md` for motivation. JobClippy is an offline-capable, local-first candidate command center that will not be deployed to cloud hosting. The documentation must guide developers through local operation, Docker PostgreSQL setup, DeepSeek API key configuration, unpacked Chrome extension loading, and keyboard navigation.

## Goals / Non-Goals

**Goals:**
- Provide complete, zero-assumption local setup documentation in `README.md`.
- Detail all required and optional environment variables (`DATABASE_URL`, `DEEPSEEK_API_KEY`, `PORT`).
- Automate capturing crisp, high-DPI screenshots of the application views (`docs/screenshots/`) using Playwright.
- Include a visual tour, system architecture diagram, Chrome extension setup, keyboard shortcut cheatsheet, and troubleshooting guide.

**Non-Goals:**
- Documenting cloud deployment platforms (Vercel, AWS, Fly.io) since the repository is strictly local.
- Implementing new application features or modifying database schemas.

## Decisions

### 1. Automated Screenshot Generation via Playwright
- **Decision:** Use a headless Playwright script to capture 5 high-resolution (deviceScaleFactor: 2) screenshots of the active local application:
  - `docs/screenshots/pipeline-board.png`: The 5-stage Kanban board.
  - `docs/screenshots/job-detail-sheet.png`: The 1.5× wide detail slide-over sheet.
  - `docs/screenshots/applications-table.png`: The high-density tabular view with stage filters.
  - `docs/screenshots/funnel-analytics.png`: The pipeline velocity and attribution analytics.
  - `docs/screenshots/command-palette.png`: The spotlight modal (`Cmd+K`).
- **Rationale:** Automated capture guarantees screenshots match the exact current UI tokens, colors, and layout without manual capture skew or compression artifacts.

### 2. Relative Asset Embedding in Markdown
- **Decision:** Embed screenshots into `README.md` using relative repository paths (`docs/screenshots/<name>.png`).
- **Rationale:** Ensures screenshots render properly on GitHub and offline in any Markdown viewer.

### 3. Clear Separation of Database vs AI API Requirements
- **Decision:** Structure environment setup into two distinct sections:
  1. *Database Configuration (Mandatory)*: Docker Compose PostgreSQL connection string.
  2. *DeepSeek AI Key (Required for intelligent parsing)*: Clearly explaining how to obtain a DeepSeek key, where to place it in `.env.local`, and what happens if omitted (graceful heuristic parsing fallback).

## Risks / Trade-offs

- **[Port Availability during capture]** → Screenshot capture requires Next.js on port 3000 and PostgreSQL on port 5433.
  *Mitigation:* Both services are already active and healthy in the local environment.
- **[Repository size from images]** → High-resolution PNGs could increase git history size.
  *Mitigation:* Limit screenshots to the 5 core views and optimize PNG compression.

