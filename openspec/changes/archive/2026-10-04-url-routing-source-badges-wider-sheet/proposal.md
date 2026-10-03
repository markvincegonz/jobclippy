# Proposal

## Why

The app currently renders all views on a single `/` route with `useState`-based view switching. This means no browser history, no deep linking, and no shareable URLs. Additionally, users cannot see where a saved job was originally posted (Indeed, LinkedIn, JobStreet, etc.) without clicking through to the original listing. Finally, the job detail slide-over sheet is too narrow for comfortable reading of long descriptions and notes.

## What Changes

- **URL-based routing**: Replace `useState` view switching with Next.js App Router file-based routes. Each major view gets its own URL path:
  - `/board` — Pipeline Kanban board
  - `/applications` — All Applications table
  - `/analytics` — Pipeline analytics
  - `/settings` — Command center settings
  - `/` — Redirects to `/board`
- **Filter state in URL search params**: Search query (`q`) and stage filter (`stage`) persist as URL search params (e.g. `/board?stage=applied&q=react`), surviving navigation between views and enabling shareable filtered views.
- **Job source badges**: Display the originating job board or career site (derived from `job.url`) as a favicon + text label on:
  - Kanban board job cards (footer area)
  - Applications table rows (new "Source" column or inline in the title column)
  - Job detail sheet header
- **Wider job detail sheet**: Increase the slide-over panel width from `max-w-xl` (576px) to 1.5× → approximately `max-w-3xl` (768px).

## Capabilities

### New Capabilities
- `job-source-display`: Derives and displays the originating job board brand (e.g. "LinkedIn", "Indeed", "JobStreet") from the job's URL across all listing surfaces. Includes a utility function for domain-to-brand mapping and favicon resolution.

### Modified Capabilities
- `admin-navigation`: Navigation items change from `setState` view switching to `<Link>` route navigation. Sidebar reads `usePathname()` to determine the active view. The `AdminView` type maps to URL paths instead of local state keys.
- `job-board`: Job cards display a source badge (favicon + text) in the card footer area. The board page moves to its own route at `/board` and reads filter state from URL search params.
- `applications-table`: Table rows display a source indicator. The table page moves to its own route at `/applications` and reads filter state from URL search params.

## Impact

- **File structure**: `src/app/page.tsx` splits into `src/app/board/page.tsx`, `src/app/applications/page.tsx`, `src/app/analytics/page.tsx`, `src/app/settings/page.tsx`. Root `page.tsx` becomes a redirect.
- **Layout**: `AdminShell` logic (sidebar, top bar, providers) moves into a shared `src/app/layout.tsx` or a `(dashboard)/layout.tsx` route group.
- **State management**: `activeView` state is eliminated — replaced by the URL pathname. `searchQuery` and `selectedStage` move to URL search params via `useSearchParams()`.
- **Components**: `Sidebar` and `TopContextBar` switch from callback-based view switching to `<Link>` navigation with `usePathname()` for active state.
- **Sheet component**: `max-w-xl` → `max-w-3xl` in `src/components/ui/sheet.tsx`.
- **New utility**: `src/lib/job-source.ts` — domain-to-brand mapping function.
- **Tests**: Existing Playwright tests referencing the single-page structure will need route-aware navigation. Tests for source badges and wider sheet need to be added.
- **No database schema changes**: Job source is derived from the existing `url` field at render time.
