# Design: Eliminate Ghost Jobs and Implement Database Card Positioning

## Context

See `proposal.md` for motivation. Currently, `src/lib/job-store.tsx` uses browser `localStorage` as a fallback and persistence layer for jobs. Because the store attempts to merge local jobs with database jobs on mount, deleted jobs reappear as ghost jobs in other browsers. Furthermore, manual Kanban card reordering is not tracked in PostgreSQL because the `Job` model lacks a position field.

## Goals / Non-Goals

**Goals:**
- Eliminate cross-browser data divergence by making PostgreSQL the single source of truth for all job data.
- Prevent ghost job resurrection by removing `localStorage` caching of jobs and removing the `localOnly` merge loop.
- Support persistent drag-and-drop card ordering within and across Kanban stages by adding a database `position` field.
- Preserve lightweight UI preferences (sidebar collapsed state and theme preference) in `localStorage` to avoid hydration layout flicker.

**Non-Goals:**
- Complete removal of `localStorage` for unrelated UI layout preferences (sidebar, theme).
- Implementing WebSocket/SSE streaming infrastructure (standard REST API + in-memory custom event sync is sufficient for MVP).

## Decisions

### 1. Fractional Float Positioning vs Sequential Integer Re-indexing
- **Decision:** Use a `Float` column for `position` with midpoint calculation `(prevPos + nextPos) / 2`. Initial seed and new jobs will be assigned spaced increments (`1000.0, 2000.0, 3000.0`).
- **Rationale:** Moving a card between two existing cards requires updating only a single database row (`PATCH /api/jobs/[id]` with `position`), rather than executing bulk sequential updates across dozens of rows.
- **Alternatives Considered:**
  - *Sequential Integers (0, 1, 2, ...):* Requires re-indexing all subsequent rows in a stage on every drag event, introducing unnecessary database write contention.
  - *CreatedAt Timestamp Sorting Only:* Excludes the ability to manually prioritize and order cards within a column.

### 2. In-Memory React State Without Local Storage Caching
- **Decision:** The web application will maintain `jobs: Job[]` purely in React memory state initialized on mount via `GET /api/jobs`.
- **Rationale:** Deleting a job from PostgreSQL ensures that no browser will resurrect it upon refresh. All browsers query the same PostgreSQL database directly.
- **Alternatives Considered:**
  - *Service Worker Cache / IndexedDB:* Introduces the same stale cache and multi-device divergence problems as `localStorage`.

### 3. Extension In-Memory Event Notification
- **Decision:** The Chrome Extension content script (`bridge.js`) will dispatch `CustomEvent("jobclippy:synced")` directly on the `window` to trigger an in-memory refetch or state update, with zero reads or writes to `localStorage`.
- **Rationale:** Keeps the browser extension capable of instantly updating an open dashboard tab while guaranteeing that all data passes through the PostgreSQL database endpoint (`POST /api/jobs`).

## Risks / Trade-offs

- **[Offline Access]** → Without `localStorage` caching, the dashboard requires an active connection to the backend server.
  *Mitigation:* Clean loading skeletons and Linear-grade empty/error states inform the user if the server is unreachable.
- **[Float Precision Degradation]** → Rapid reordering between the exact same two cards hundreds of times could theoretically degrade float precision.
  *Mitigation:* Standard float spacing provides over 50 subdivisions before precision limits are approached. A simple rebalance can be run if needed.

## Migration Plan

1. Update `prisma/schema.prisma` with `position Float @default(0)` and index `[stage, position]`.
2. Run `npx prisma db push` to apply schema changes to PostgreSQL.
3. Update `prisma/seed.ts` to assign spaced positions (`index * 1000.0`) to seed opportunities.
4. Update API routes `/api/jobs` and `/api/jobs/[id]` to query and mutate `position`.
5. Update `src/lib/job-store.tsx` to remove `STORAGE_KEY`, `getStoredJobs`, and `saveStoredJobs`.
6. Update `extension/content/bridge.js` to eliminate `localStorage.setItem`.

