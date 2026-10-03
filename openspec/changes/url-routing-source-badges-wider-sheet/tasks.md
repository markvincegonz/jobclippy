# Tasks

## 1. Job Source Derivation & Minimalist Badge Component

- [x] 1.1 Implement domain-to-brand derivation utility in `src/lib/job-source.ts` (supporting LinkedIn, Indeed, JobStreet, Seek, Glassdoor, and generic domains) and verify unit test passes via Playwright/node test runner.
- [x] 1.2 Create `JobSourceBadge` in `src/components/job-source-badge.tsx` displaying favicon image + text label with an SVG globe fallback on image error.
- [x] 1.3 Integrate `JobSourceBadge` into `JobCard` footer in `src/components/job-card.tsx` and verify cards with valid URLs show their source favicon and brand text.
- [x] 1.4 Integrate `JobSourceBadge` into `ApplicationsTable` rows in `src/components/applications-table.tsx` and verify table rows display the source indicator.
- [x] 1.5 Integrate `JobSourceBadge` into `JobDetailSheet` header in `src/components/job-detail-sheet.tsx` next to the original posting link.

## 2. Job Detail Drawer Width Expansion

- [x] 2.1 Update `Sheet` container styling in `src/components/ui/sheet.tsx` from `max-w-xl` to `max-w-3xl` (~1.5× width) and verify responsive full-width bounds on mobile viewports.

## 3. URL Routing & Search Parameter State

- [x] 3.1 Refactor global providers (`JobStoreProvider`, `ToastProvider`) in `src/app/layout.tsx` so job store and toast state persist seamlessly across page navigations.
- [x] 3.2 Update `Sidebar` in `src/components/sidebar.tsx` and `TopContextBar` in `src/components/top-context-bar.tsx` to use Next.js `<Link>` elements and determine active states with `usePathname()`.
- [x] 3.3 Create Next.js route pages: `src/app/board/page.tsx`, `src/app/applications/page.tsx`, `src/app/analytics/page.tsx`, `src/app/settings/page.tsx`, and configure root `src/app/page.tsx` to redirect to `/board`.
- [x] 3.4 Synchronize search query (`q`) and stage filter (`stage`) with URL search params in `src/components/admin-shell.tsx` and the views, verifying URL reflection and back/forward navigation.

## 4. Verification & Integration Testing

- [x] 4.1 Update existing E2E navigation tests in `tests/admin-shell.spec.ts` and `tests/table-view.spec.ts` to navigate via direct URL routes (`/board`, `/applications`).
- [x] 4.2 Create comprehensive E2E tests in `tests/url-routing-and-source-badges.spec.ts` asserting `/` redirect to `/board`, sidebar link navigation, search param persistence, source badge rendering, and 1.5× sheet width.
- [x] 4.3 Run `npm run build` and run test suite to verify zero regressions.
